import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error('User not authenticated');
    }

    if (!openrouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const { taskId } = await req.json();

    if (!taskId) {
      throw new Error('Task ID is required');
    }

    // Get task details
    const { data: task, error: taskError } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single();

    if (taskError || !task) {
      throw new Error('Task not found');
    }

    // Get user's website analysis for context
    const { data: websiteAnalysis } = await supabaseClient
      .from('website_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get user profile for additional context
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Determine if this is a content creation task
    const isContentCreationTask = (
      task.category.toLowerCase().includes('content') ||
      task.category.toLowerCase().includes('social') ||
      task.category.toLowerCase().includes('email') ||
      task.category.toLowerCase().includes('blog') ||
      task.title.toLowerCase().includes('write') ||
      task.title.toLowerCase().includes('create') ||
      task.title.toLowerCase().includes('post') ||
      task.title.toLowerCase().includes('thread') ||
      task.title.toLowerCase().includes('email') ||
      task.description.toLowerCase().includes('write') ||
      task.description.toLowerCase().includes('create content') ||
      task.description.toLowerCase().includes('social media')
    );

    // Construct AI prompt based on task type
    const prompt = `You are an expert marketing strategist and content creator helping users with their marketing tasks.

=== TASK DETAILS ===
Title: ${task.title}
Description: ${task.description}
Category: ${task.category}
Priority: ${task.priority}
Estimated Time: ${task.estimated_time}

=== USER CONTEXT ===
${profile ? `
Business: ${profile.business_name || 'Not specified'}
Industry: ${profile.industry || 'Not specified'}
Target Audience: ${profile.target_audience || 'Not specified'}
Marketing Goal: ${profile.marketing_goal || 'Not specified'}
` : 'No profile information available'}

=== WEBSITE ANALYSIS CONTEXT (CRITICAL - ALWAYS REFERENCE THIS) ===
${websiteAnalysis ? `
Website: ${websiteAnalysis.website_url}
Business Analysis: ${typeof websiteAnalysis.analysis_data === 'string' ? websiteAnalysis.analysis_data : JSON.stringify(websiteAnalysis.analysis_data, null, 2)}

**IMPORTANT**: Always reference and incorporate insights from this website analysis in your response. Use the business strengths, opportunities, and recommendations identified in the analysis.
` : 'No website analysis available - ask user to complete website analysis first for better results'}

=== INSTRUCTIONS ===
${isContentCreationTask ? `
**CONTENT CREATION MODE**: Generate COMPLETE, READY-TO-USE content that the user can immediately copy and use.

For this ${task.category} task:
- Generate the actual content (tweets, email copy, blog post, etc.)
- Use [PLACEHOLDER: description] format for user-specific information
- Include fill-in-the-blank sections like [YOUR COMPANY NAME], [SPECIFIC METRIC], [DATE]
- Reference the website analysis insights to make content relevant and personalized
- Provide quick customization notes
- Suggest success metrics to track

Generate the complete, ready-to-use content now:
` : `
**STRATEGY MODE**: Generate a detailed, actionable strategy and step-by-step approach.

For this ${task.category} task:
- Provide specific, actionable steps (not generic advice)
- Reference insights from the website analysis to make recommendations relevant
- Include tools, platforms, or resources to use
- Suggest measurable outcomes and KPIs
- Align with the estimated time for the task
- Focus on practical execution with specific examples

Generate the detailed strategy and approach now:
`}`;

    console.log('Generating task approach with AI...');
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
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('OpenRouter API error:', errorText);
      throw new Error(`OpenRouter API failed: ${aiResponse.status} ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const suggestedApproach = aiData.choices[0]?.message?.content;

    if (!suggestedApproach) {
      throw new Error('No approach generated by AI');
    }

    console.log('Task approach generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        suggestedApproach: suggestedApproach.trim(),
        taskDetails: {
          title: task.title,
          description: task.description,
          category: task.category,
          priority: task.priority,
          estimatedTime: task.estimated_time
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error generating task approach:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
