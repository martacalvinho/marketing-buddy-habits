
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
    const requestBody = await req.json();
    console.log('Received request body:', JSON.stringify(requestBody, null, 2));

    const { 
      analysis, 
      userGoal, 
      productType, 
      platforms, 
      websiteAnalysisId,
      selectedStrategy,
      isOnboarding 
    } = requestBody;

    console.log('Extracted data:', {
      hasAnalysis: !!analysis,
      userGoal,
      productType,
      platforms,
      selectedStrategy,
      isOnboarding
    });

    if (!analysis || !userGoal) {
      console.error('Missing required fields:', { hasAnalysis: !!analysis, hasUserGoal: !!userGoal });
      throw new Error('Analysis and user goal are required');
    }

    if (!openrouterApiKey) {
      console.error('OpenRouter API key not configured');
      throw new Error('OpenRouter API key not configured');
    }

    // Initialize Supabase client to get analysis_sections if websiteAnalysisId is provided
    const supabase = createClient(supabaseUrl, supabaseKey);
    let analysisSections = '';
    
    if (websiteAnalysisId) {
      console.log('Fetching analysis sections for website analysis ID:', websiteAnalysisId);
      const { data: sections, error: sectionsError } = await supabase
        .from('analysis_sections')
        .select('section_title, section_content, section_type')
        .eq('analysis_id', websiteAnalysisId);

      if (sectionsError) {
        console.error('Error fetching analysis sections:', sectionsError);
      } else if (sections && sections.length > 0) {
        analysisSections = sections.map(section => 
          `## ${section.section_title} (${section.section_type})\n${section.section_content}`
        ).join('\n\n');
        console.log('Found analysis sections:', sections.length);
      }
    }

    const taskCount = isOnboarding ? 5 : 3;
    const taskContext = isOnboarding ? 'initial onboarding tasks' : 'weekly tasks';

    const strategyPrompt = `You are an expert marketing strategist. Based on this comprehensive website analysis, create a personalized marketing strategy with exactly ${taskCount} specific ${taskContext}.

=== WEBSITE ANALYSIS ===
${analysis}

${analysisSections ? `
=== DETAILED ANALYSIS SECTIONS ===
${analysisSections}
` : ''}

=== USER CONTEXT ===
User Goal: ${userGoal}
Product Type: ${productType}
Active Platforms: ${platforms?.join(', ') || 'Not specified'}
${selectedStrategy ? `Selected Strategy: ${selectedStrategy.name} - ${selectedStrategy.description} (Category: ${selectedStrategy.category})` : ''}

=== CRITICAL INSTRUCTIONS ===
You MUST analyze the website content above and extract key insights about:
- The specific business/product being offered
- Target audience and their pain points
- Current marketing strengths and weaknesses
- Specific opportunities for improvement based on the analysis
- Competitive positioning and unique value proposition

${selectedStrategy ? `
🎯 STRATEGY FOCUS: ALL tasks must directly align with and advance the "${selectedStrategy.name}" strategy.
Strategy Description: "${selectedStrategy.description}"
Strategy Category: ${selectedStrategy.category}

Every task must specifically support this chosen marketing strategy and reference how it advances the strategy goals.
` : ''}

Then create a JSON response with EXACTLY ${taskCount} highly specific, actionable tasks:

{
  "strategies": [
    {
      "name": "${selectedStrategy?.name || 'Marketing Strategy'}",
      "description": "${selectedStrategy?.description || 'Comprehensive marketing approach'}",
      "channel": "${selectedStrategy?.category || 'Multi-channel'}",
      "priority": "high"
    }
  ],
  "weeklyTasks": [
    {
      "title": "Specific task title based on the website analysis and ${selectedStrategy?.name || 'marketing strategy'}",
      "description": "Detailed description referencing specific findings from the analysis and how it supports the ${selectedStrategy?.name || 'chosen strategy'}",
      "category": "${selectedStrategy?.category || 'Marketing'}",
      "priority": "high/medium/low",
      "estimatedTime": "30 minutes to 2 hours",
      "aiSuggestion": "Specific actionable advice based on the website's current state and opportunities identified in the analysis"
    }
  ]
}

🚨 CRITICAL REQUIREMENTS:
- Generate EXACTLY ${taskCount} tasks, no more, no less
- Make all tasks highly specific to this business based on the actual website analysis content
- Reference specific findings, opportunities, and recommendations from the analysis above
- ${selectedStrategy ? `Ensure ALL tasks directly support the "${selectedStrategy.name}" strategy and advance its goals` : 'Focus on the most impactful marketing activities'}
- Include specific examples, copy suggestions, or implementation details where relevant
- Use insights from the detailed analysis sections to create targeted, relevant tasks
- DO NOT use generic marketing advice - everything must be tailored to this specific business and website
- Each task should feel personally relevant and actionable based on their current website state

${isOnboarding ? `
🎯 ONBOARDING FOCUS: These are the user's first 5 tasks after joining. Make them:
- Immediately actionable and impactful
- Directly related to their website's specific opportunities
- Clearly connected to their chosen "${selectedStrategy?.name || 'marketing'}" strategy
- Designed to create quick wins and build momentum
- Specific enough that they know exactly what to do next
` : `
📅 WEEKLY FOCUS: Create ${taskCount} tasks for consistent weekly progress that:
- Build on previous work and maintain momentum
- Are achievable within a week alongside other work
- Advance the "${selectedStrategy?.name || 'marketing'}" strategy systematically
`}

Respond with ONLY the JSON object, no additional text.`;

    console.log('Generating tasks with strategy:', selectedStrategy?.name, 'Task count:', taskCount);

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
            content: `You are a marketing strategy expert. Always respond with valid JSON only. You must generate exactly ${taskCount} tasks based on the website analysis and selected strategy.` 
          },
          { role: 'user', content: strategyPrompt }
        ],
        temperature: 0.4,
        max_tokens: 2500,
      }),
    });

    if (!aiResponse.ok) {
      const aiResponseText = await aiResponse.text();
      console.error('OpenRouter API error:', aiResponse.status, aiResponseText);
      throw new Error(`OpenRouter API error: ${aiResponse.status} - ${aiResponseText}`);
    }

    const aiData = await aiResponse.json();
    let strategy;

    try {
      const aiContent = aiData.choices[0].message.content;
      console.log('AI Response content length:', aiContent.length);
      
      strategy = JSON.parse(aiContent);
      
      // Ensure we have exactly the right number of tasks
      if (!strategy.weeklyTasks || !Array.isArray(strategy.weeklyTasks)) {
        throw new Error('AI response missing weeklyTasks array');
      }
      
      // If we have more tasks than needed, take the first ones
      if (strategy.weeklyTasks.length > taskCount) {
        console.log(`AI generated ${strategy.weeklyTasks.length} tasks, trimming to ${taskCount}`);
        strategy.weeklyTasks = strategy.weeklyTasks.slice(0, taskCount);
      }
      
      // If we have fewer tasks than needed, create fallback tasks
      while (strategy.weeklyTasks.length < taskCount) {
        console.log(`Adding fallback task, currently have ${strategy.weeklyTasks.length}/${taskCount}`);
        strategy.weeklyTasks.push({
          title: `${selectedStrategy?.name || 'Marketing'} task ${strategy.weeklyTasks.length + 1} for your business`,
          description: `Continue working on your ${selectedStrategy?.name || 'marketing'} strategy based on your website analysis`,
          category: selectedStrategy?.category || "Marketing",
          priority: "medium",
          estimatedTime: "1-2 hours",
          aiSuggestion: `Focus on implementing ${selectedStrategy?.name || 'marketing'} improvements identified in your website analysis`
        });
      }

      console.log(`Final task count: ${strategy.weeklyTasks.length}`);
      
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('AI Response:', aiData.choices?.[0]?.message?.content || 'No content');
      
      // Create comprehensive fallback strategy
      strategy = {
        strategies: [
          {
            name: selectedStrategy?.name || "Content Marketing",
            description: selectedStrategy?.description || "Create valuable content for your audience",
            channel: selectedStrategy?.category || "Content",
            priority: "high"
          }
        ],
        weeklyTasks: Array.from({ length: taskCount }, (_, i) => ({
          title: `${selectedStrategy?.name || 'Marketing'} task ${i + 1} for your business`,
          description: `Work on ${selectedStrategy?.name || 'marketing'} activities related to your product and goals`,
          category: selectedStrategy?.category || "Marketing",
          priority: i < 2 ? "high" : "medium",
          estimatedTime: "1-2 hours",
          aiSuggestion: `Focus on ${selectedStrategy?.name || 'marketing'} activities that align with your business goals`
        }))
      };
    }

    console.log(`Generated ${strategy.weeklyTasks?.length || 0} tasks for ${isOnboarding ? 'onboarding' : 'weekly planning'}`);

    return new Response(JSON.stringify({ 
      success: true, 
      strategy,
      websiteAnalysisId: websiteAnalysisId || null,
      taskCount: strategy.weeklyTasks?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-strategy function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
