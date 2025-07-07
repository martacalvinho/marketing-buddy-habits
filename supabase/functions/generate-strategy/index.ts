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

    const strategyPrompt = `Based on this website analysis, create a personalized marketing strategy with weekly tasks.

Website Analysis:
- Product: ${analysis.productDescription}
- Target Audience: ${analysis.targetAudience}
- Pain Points: ${analysis.painPoints}
- Value Proposition: ${analysis.valueProposition}
- Recommended Channels: ${analysis.marketingChannels?.join(', ')}

User Goal: ${userGoal}
Product Type: ${productType}
Active Platforms: ${platforms?.join(', ')}

Create a JSON response with:
{
  "strategies": [
    {
      "name": "Strategy Name",
      "description": "Brief description",
      "channel": "platform/channel name",
      "priority": "high/medium/low"
    }
  ],
  "weeklyTasks": [
    {
      "title": "Specific task title",
      "description": "Detailed description",
      "category": "SEO/Social/Email/etc",
      "priority": "high/medium/low",
      "estimatedTime": "30 minutes",
      "aiSuggestion": "Specific actionable advice on how to complete this task"
    }
  ]
}

Focus on 3-5 strategies and 10-15 weekly tasks. Make tasks specific, actionable, and tailored to their product and audience.`;

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