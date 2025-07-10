import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, websiteAnalysisId } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!openrouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user profile and goal
    const { data: profile } = await supabase
      .from('profiles')
      .select('goal, product_type, product_name, platforms')
      .eq('user_id', userId)
      .single();

    // Get past week's tasks and results
    const pastWeekStart = new Date();
    pastWeekStart.setDate(pastWeekStart.getDate() - 14); // Two weeks ago
    const pastWeekEnd = new Date();
    pastWeekEnd.setDate(pastWeekEnd.getDate() - 7); // One week ago
    
    const pastWeekStartStr = pastWeekStart.toISOString().split('T')[0];
    const pastWeekEndStr = pastWeekEnd.toISOString().split('T')[0];

    let pastTasksQuery = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .gte('week_start_date', pastWeekStartStr)
      .lte('week_start_date', pastWeekEndStr);

    if (websiteAnalysisId) {
      pastTasksQuery = pastTasksQuery.eq('website_analysis_id', websiteAnalysisId);
    }

    const { data: pastTasks } = await pastTasksQuery;

    // Get website analysis if specified
    let websiteAnalysis = null;
    if (websiteAnalysisId) {
      const { data: analysis } = await supabase
        .from('website_analyses')
        .select('*')
        .eq('id', websiteAnalysisId)
        .single();
      websiteAnalysis = analysis;
    }

    // Generate next week's tasks using AI
    const nextWeekStart = new Date();
    nextWeekStart.setDate(nextWeekStart.getDate() - nextWeekStart.getDay() + 7); // Next Monday
    const nextWeekStartStr = nextWeekStart.toISOString().split('T')[0];

    const weeklyPlanPrompt = `You are a marketing assistant helping a user plan their next week based on their past performance and goals.

=== USER CONTEXT ===
Goal: ${profile?.goal || 'Not specified'}
Product Type: ${profile?.product_type || 'Not specified'}
Product Name: ${profile?.product_name || 'Not specified'}
Active Platforms: ${profile?.platforms?.join(', ') || 'Not specified'}

=== PAST WEEK'S PERFORMANCE ===
${pastTasks?.length ? 
  pastTasks.map(task => `
  Task: ${task.title}
  Category: ${task.category}
  Priority: ${task.priority}
  Completed: ${task.completed ? 'Yes' : 'No'}
  User Approach: ${task.user_approach || 'Not recorded'}
  Results & Notes: ${task.result_notes || 'Not recorded'}
  `).join('\n') 
  : 'No past tasks available'}

=== WEBSITE ANALYSIS CONTEXT ===
${websiteAnalysis ? 
  `Website: ${websiteAnalysis.website_url}
   Analysis Data: ${JSON.stringify(websiteAnalysis.analysis_data, null, 2)}`
  : 'No specific website analysis provided'}

=== INSTRUCTIONS ===
Based on the user's past performance, goals, and website analysis:

1. Analyze what worked well and what didn't based on completed vs incomplete tasks
2. Review the user's notes and results to understand their strengths and challenges
3. Consider the website analysis to identify specific opportunities
4. Generate 5-7 strategic tasks for next week that:
   - Build on successful patterns from past performance
   - Address gaps or incomplete areas
   - Are specific to their business and website
   - Progress toward their overall goal
   - Vary in difficulty and time commitment

Respond with JSON only:
{
  "weeklyTasks": [
    {
      "title": "Specific, actionable task title",
      "description": "Detailed description referencing past performance or website insights",
      "category": "SEO/Social/Email/Content/Analytics/etc",
      "priority": "high/medium/low",
      "estimatedTime": "15 minutes to 3 hours",
      "aiSuggestion": "Strategic advice based on their past performance and current opportunities"
    }
  ],
  "weeklyInsights": {
    "performanceAnalysis": "Brief analysis of what worked well last week",
    "focusAreas": "Key areas to focus on this week",
    "suggestedStrategy": "One recommended strategy based on their current state"
  }
}

Make tasks highly personalized based on their actual past performance and specific business context.`;

    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert marketing assistant who creates personalized weekly plans. Always respond with valid JSON only.' 
          },
          { role: 'user', content: weeklyPlanPrompt }
        ],
        temperature: 0.3,
        max_tokens: 3000,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`OpenRouter API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let weeklyPlan;

    try {
      weeklyPlan = JSON.parse(aiData.choices[0].message.content);
    } catch (e) {
      // Fallback plan
      weeklyPlan = {
        weeklyTasks: [
          {
            title: "Review and improve your website's homepage",
            description: "Based on your goals, focus on clarifying your value proposition",
            category: "Website",
            priority: "high",
            estimatedTime: "1 hour",
            aiSuggestion: "Start with the most visible elements that visitors see first"
          }
        ],
        weeklyInsights: {
          performanceAnalysis: "Continue building consistent marketing habits",
          focusAreas: "Website optimization and content creation",
          suggestedStrategy: "Focus on one channel at a time for better results"
        }
      };
    }

    // Save tasks to database
    const tasksToInsert = weeklyPlan.weeklyTasks.map((task: any) => ({
      user_id: userId,
      website_analysis_id: websiteAnalysisId,
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      estimated_time: task.estimatedTime,
      ai_suggestion: task.aiSuggestion,
      week_start_date: nextWeekStartStr,
      completed: false
    }));

    const { error: insertError } = await supabase
      .from('tasks')
      .insert(tasksToInsert);

    if (insertError) {
      console.error('Error inserting tasks:', insertError);
      throw new Error('Failed to save generated tasks');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      weeklyPlan,
      tasksGenerated: tasksToInsert.length,
      weekStartDate: nextWeekStartStr
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-weekly-plan function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});