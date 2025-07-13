
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
    const { 
      analysis, 
      userGoal, 
      productType, 
      platforms, 
      websiteAnalysisId,
      selectedStrategy,
      isOnboarding 
    } = await req.json();

    if (!analysis || !userGoal) {
      throw new Error('Analysis and user goal are required');
    }

    if (!openrouterApiKey) {
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

    const strategyPrompt = `Based on this comprehensive website analysis, create a personalized marketing strategy with specific ${taskContext}.

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

=== INSTRUCTIONS ===
Analyze the website content above and extract key insights about:
- The business/product being offered
- Target audience and their needs
- Current marketing strengths and weaknesses
- Specific opportunities for improvement
- Competitive positioning

${selectedStrategy ? `
FOCUS ON THE SELECTED STRATEGY: All tasks must align with and advance the "${selectedStrategy.name}" strategy. 
Reference the strategy description: "${selectedStrategy.description}"
Category: ${selectedStrategy.category}
` : ''}

Then create a JSON response with exactly ${taskCount} highly specific tasks:
{
  "strategies": [
    {
      "name": "Strategy Name",
      "description": "Brief description based on the analysis",
      "channel": "platform/channel name",
      "priority": "high/medium/low"
    }
  ],
  "weeklyTasks": [
    {
      "title": "Specific task title based on the website analysis${selectedStrategy ? ' and selected strategy' : ''}",
      "description": "Detailed description referencing specific findings from the analysis",
      "category": "${selectedStrategy ? selectedStrategy.category : 'Marketing'}",
      "priority": "high/medium/low",
      "estimatedTime": "30 minutes to 2 hours",
      "aiSuggestion": "Specific actionable advice based on the website's current state and opportunities identified"
    }
  ]
}

CRITICAL REQUIREMENTS:
- Generate exactly ${taskCount} tasks
- Make all tasks highly specific to this business based on the actual website analysis
- Reference specific findings, opportunities, and recommendations from the analysis above
- ${selectedStrategy ? `Ensure all tasks directly support the "${selectedStrategy.name}" strategy` : 'Focus on the most impactful marketing activities'}
- Include specific examples, copy suggestions, or implementation details where relevant
- Do NOT use generic marketing advice - everything must be tailored to this specific business

${isOnboarding ? 'These are the user\'s first tasks after onboarding, so make them impactful and immediately actionable to create a great first impression.' : 'Focus on weekly consistency and building momentum.'}`;

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
            content: 'You are a marketing strategy expert. Always respond with valid JSON only.' 
          },
          { role: 'user', content: strategyPrompt }
        ],
        temperature: 0.4,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`OpenRouter API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let strategy;

    try {
      strategy = JSON.parse(aiData.choices[0].message.content);
      
      // Ensure we have exactly the right number of tasks
      if (strategy.weeklyTasks && strategy.weeklyTasks.length !== taskCount) {
        strategy.weeklyTasks = strategy.weeklyTasks.slice(0, taskCount);
      }
    } catch (e) {
      console.error('Failed to parse AI response, using fallback strategy');
      // Fallback strategy
      strategy = {
        strategies: [
          {
            name: selectedStrategy?.name || "Content Marketing",
            description: "Create valuable content for your audience",
            channel: selectedStrategy?.category || "Content",
            priority: "high"
          }
        ],
        weeklyTasks: Array.from({ length: taskCount }, (_, i) => ({
          title: `Marketing task ${i + 1} for your business`,
          description: "Create valuable content related to your product",
          category: selectedStrategy?.category || "Content",
          priority: "high",
          estimatedTime: "1-2 hours",
          aiSuggestion: "Focus on solving a specific problem your audience faces"
        }))
      };
    }

    console.log(`Generated ${strategy.weeklyTasks?.length || 0} tasks for ${isOnboarding ? 'onboarding' : 'weekly planning'}`);

    return new Response(JSON.stringify({ 
      success: true, 
      strategy,
      websiteAnalysisId: websiteAnalysisId || null
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
