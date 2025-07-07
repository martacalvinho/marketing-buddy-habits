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
    const { websiteUrl } = await req.json();

    if (!websiteUrl) {
      throw new Error('Website URL is required');
    }

    if (!openrouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    // Crawl the website
    console.log('Crawling website:', websiteUrl);
    const websiteResponse = await fetch(websiteUrl);
    const websiteHtml = await websiteResponse.text();

    // Extract text content (basic extraction)
    const textContent = websiteHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 8000); // Limit to 8k chars

    // Analyze with AI
    const analysisPrompt = `Analyze this website content and provide insights in JSON format:

Website Content:
${textContent}

Please analyze and return a JSON object with these exact keys:
{
  "productDescription": "Brief description of what the product/service is",
  "targetAudience": "Who the target audience appears to be",
  "painPoints": "What pain points or problems the product solves",
  "valueProposition": "The main value proposition",
  "contentQuality": "Assessment of how clear and compelling the messaging is (1-10)",
  "suggestions": "3-5 suggestions for improving the landing page messaging",
  "marketingChannels": ["list", "of", "recommended", "marketing", "channels"]
}

Be concise but insightful. Focus on actionable insights.`;

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
            content: 'You are a marketing expert analyzing websites. Always respond with valid JSON only.' 
          },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`OpenRouter API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let analysis;

    try {
      analysis = JSON.parse(aiData.choices[0].message.content);
    } catch (e) {
      // Fallback if AI doesn't return valid JSON
      analysis = {
        productDescription: "Analysis unavailable",
        targetAudience: "Could not determine",
        painPoints: "Could not identify",
        valueProposition: "Unclear from content",
        contentQuality: 5,
        suggestions: ["Improve headline clarity", "Add social proof", "Clarify value proposition"],
        marketingChannels: ["SEO", "Social Media", "Content Marketing"]
      };
    }

    return new Response(JSON.stringify({ 
      success: true, 
      analysis,
      websiteContent: textContent.substring(0, 500) // Return first 500 chars for reference
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-website function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});