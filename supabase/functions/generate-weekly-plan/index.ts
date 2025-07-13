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
      .select('goal, product_type, product_name, platforms, selected_strategy')
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

    // Calculate completion rate and identify patterns
    const completedTasks = pastTasks?.filter(task => task.completed) || [];
    const incompleteTasks = pastTasks?.filter(task => !task.completed) || [];
    const completionRate = pastTasks?.length ? (completedTasks.length / pastTasks.length * 100).toFixed(1) : '0';
    
    // Analyze category performance
    const categoryPerformance = pastTasks?.reduce((acc, task) => {
      if (!acc[task.category]) {
        acc[task.category] = { total: 0, completed: 0 };
      }
      acc[task.category].total++;
      if (task.completed) acc[task.category].completed++;
      return acc;
    }, {} as Record<string, { total: number; completed: number }>) || {};

    const weeklyPlanPrompt = `You are an intelligent marketing assistant that learns from user behavior to generate highly personalized weekly plans.

=== USER PROFILE ===
Goal: ${profile?.goal || 'Not specified'}
Product Type: ${profile?.product_type || 'Not specified'}
Product Name: ${profile?.product_name || 'Not specified'}
Active Platforms: ${profile?.platforms?.join(', ') || 'Not specified'}
Selected Marketing Strategy: ${profile?.selected_strategy || 'Not specified'}

=== PERFORMANCE ANALYTICS ===
Overall Completion Rate: ${completionRate}%
Total Tasks Last Week: ${pastTasks?.length || 0}
Completed: ${completedTasks.length}
Incomplete: ${incompleteTasks.length}

Category Performance:
${Object.entries(categoryPerformance).map(([category, stats]) => 
  `${category}: ${(stats as any).completed}/${(stats as any).total} (${((stats as any).completed/(stats as any).total*100).toFixed(1)}%)`
).join('\n')}

=== DETAILED TASK ANALYSIS ===
${pastTasks?.length ? 
  pastTasks.map(task => `
📋 Task: ${task.title}
   Category: ${task.category} | Priority: ${task.priority}
   Status: ${task.completed ? '✅ COMPLETED' : '❌ INCOMPLETE'}
   User's Approach: ${task.user_approach || 'Not documented'}
   Results & Learning: ${task.result_notes || 'No notes provided'}
   Time Spent: ${task.time_spent || 'Not tracked'}
  `).join('\n') 
  : 'No historical data available - this is likely a new user'}

=== WEBSITE CONTEXT ===
${websiteAnalysis ? 
  `🌐 Website: ${(websiteAnalysis as any).website_url}
📊 Analysis Insights: ${typeof (websiteAnalysis as any).analysis_data === 'string' ? (websiteAnalysis as any).analysis_data : JSON.stringify((websiteAnalysis as any).analysis_data, null, 2)}`
  : 'No website analysis available'}

=== ADAPTIVE PLANNING INSTRUCTIONS ===
As an intelligent assistant, analyze the user's patterns and generate a personalized plan:

🧠 BEHAVIORAL ANALYSIS:
1. Identify which task categories the user excels at vs struggles with
2. Note patterns in their approach and results documentation
3. Recognize time management patterns and preferences
4. Understand what motivates them based on completed tasks

🎯 ADAPTIVE STRATEGY:
1. **Build on Strengths**: More tasks in categories where they have high completion rates
2. **Address Weaknesses**: Smaller, easier tasks in struggling categories to build confidence
3. **Learn from Notes**: Incorporate insights from their results and approaches
4. **Progressive Difficulty**: Match task complexity to their demonstrated capabilities
5. **Personalized Timing**: Suggest time estimates based on their past performance
6. **Strategy Alignment**: ALL tasks must align with their selected marketing strategy and support its execution

🎯 STRATEGY-FOCUSED BRIEF:
The user has selected "${profile?.selected_strategy || 'Not specified'}" as their primary marketing strategy. This week's tasks should:
- Directly support and advance this specific marketing strategy
- Build upon the website analysis insights to create relevant, actionable tasks
- Form a coherent weekly plan that moves the strategy forward step-by-step
- Reference specific opportunities identified in their website analysis
- Consider their business context and past performance within this strategy focus

📋 TASK GENERATION RULES:
- Generate 5-7 tasks that feel personally relevant
- Reference their specific business/website in task descriptions
- Include variety but emphasize their successful patterns
- Make tasks specific and actionable, not generic
- Consider their goal and current business stage

Respond with JSON only:
{
  "weeklyTasks": [
    {
      "title": "Specific task referencing their business/website",
      "description": "Detailed description that shows you understand their context and past performance",
      "category": "SEO/Social/Email/Content/Analytics/PaidAds/Networking/etc",
      "priority": "high/medium/low",
      "estimatedTime": "Realistic estimate based on their past performance",
      "aiSuggestion": "Personalized advice referencing their strengths, challenges, or past results",
      "adaptiveReason": "Brief explanation of why this task was chosen based on their patterns"
    }
  ],
  "weeklyInsights": {
    "performanceAnalysis": "Specific analysis of their strengths and improvement areas based on data",
    "behavioralPatterns": "Insights about their work style and preferences",
    "focusAreas": "Strategic areas to prioritize this week based on their goals and performance",
    "motivationalNote": "Encouraging message that acknowledges their progress and challenges",
    "suggestedStrategy": "One specific marketing strategy recommendation with reasoning"
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