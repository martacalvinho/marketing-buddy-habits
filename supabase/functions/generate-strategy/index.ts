import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysis, userGoal, productType, platforms } = await req.json();

    if (!analysis || !userGoal) {
      throw new Error('Analysis and user goal are required');
    }

    if (!openrouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const strategyPrompt = `Based on this comprehensive website analysis, create a personalized marketing strategy with specific weekly tasks.

=== WEBSITE ANALYSIS ===
${analysis}

=== USER CONTEXT ===
User Goal: ${userGoal}
Product Type: ${productType}
Active Platforms: ${platforms?.join(', ') || 'Not specified'}

=== INSTRUCTIONS ===
Analyze the website content above and extract key insights about:
- The business/product being offered
- Target audience and their needs
- Current marketing strengths and weaknesses
- Specific opportunities for improvement
- Competitive positioning

Then create a JSON response with:
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
      "title": "Specific task title based on the website analysis",
      "description": "Detailed description referencing specific findings from the analysis",
      "category": "SEO/Social/Email/Content/etc",
      "priority": "high/medium/low",
      "estimatedTime": "30 minutes to 2 hours",
      "aiSuggestion": "Specific actionable advice based on the website's current state and opportunities identified"
    }
  ]
}

IMPORTANT: Make all strategies and tasks highly specific to this business based on the actual website analysis. Reference specific findings, opportunities, and recommendations from the analysis above. Do NOT use generic marketing advice.`;

    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-haiku',
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
    } catch (e) {
      // Fallback strategy
      strategy = {
        strategies: [
          {
            name: "Content Marketing",
            description: "Create valuable content for your audience",
            channel: "Content",
            priority: "high"
          }
        ],
        weeklyTasks: [
          {
            title: "Write one blog post about your product",
            description: "Create educational content related to your product",
            category: "Content",
            priority: "high",
            estimatedTime: "2 hours",
            aiSuggestion: "Focus on solving a specific problem your audience faces"
          }
        ]
      };
    }

    return new Response(JSON.stringify({ 
      success: true, 
      strategy 
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