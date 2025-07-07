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

    console.log('Crawling website:', websiteUrl);

    // Fetch the main page
    const mainPageResponse = await fetch(websiteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!mainPageResponse.ok) {
      throw new Error(`Failed to fetch website: ${mainPageResponse.status}`);
    }

    const mainPageHtml = await mainPageResponse.text();

    // Extract clean text content and structure
    const cleanContent = extractWebsiteContent(mainPageHtml, websiteUrl);

    // Try to find and crawl additional pages (About, Services, etc.)
    const additionalPages = await crawlAdditionalPages(websiteUrl, mainPageHtml);

    const fullContent = [cleanContent, ...additionalPages].join('\n\n---\n\n');

    console.log('Extracted content length:', fullContent.length);

    // Analyze with AI using OpenAI SDK approach
    const analysisPrompt = `You are a marketing expert analyzing a website. Based on the crawled content below, provide a detailed analysis in JSON format.

Website Content:
${fullContent.substring(0, 10000)} // Limit to avoid token limits

Analyze this website and return a JSON object with these exact keys:
{
  "productDescription": "Clear description of what this product/service actually does based on the content",
  "targetAudience": "Who this is specifically designed for based on language and content",
  "painPoints": "Specific problems this solves based on the messaging",
  "valueProposition": "The main value proposition as stated or implied on the site",
  "contentQuality": "Rate 1-10 based on clarity, professionalism, and effectiveness of messaging",
  "suggestions": ["Array of 4-6 specific, actionable suggestions for improving this particular website"],
  "marketingChannels": ["Array of marketing channels that would work best for this specific business"]
}

Be specific and base your analysis on the actual content provided. Avoid generic responses.`;

    // Use OpenAI SDK approach with OpenRouter
    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://marketingbuddy.app',
        'X-Title': 'Marketing Buddy'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-distill-llama-70b',
        messages: [
          { 
            role: 'system', 
            content: 'You are a marketing expert analyzing websites. Always respond with valid JSON only. Do not include any markdown formatting or code blocks.' 
          },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.text();
      console.error('OpenRouter API error:', aiResponse.status, errorData);
      throw new Error(`OpenRouter API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let analysis;

    try {
      const responseContent = aiData.choices[0].message.content;
      console.log('AI Response:', responseContent);
      
      // Clean the response in case there are markdown code blocks
      let jsonString = responseContent.trim();
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      analysis = JSON.parse(jsonString);
      
      // Validate the analysis has required fields
      if (!analysis.productDescription || !analysis.targetAudience) {
        throw new Error('Invalid analysis format');
      }
      
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      console.error('Raw response:', aiData.choices[0].message.content);
      
      // Create a more intelligent fallback based on the actual content
      const hasAbout = fullContent.toLowerCase().includes('about');
      const hasServices = fullContent.toLowerCase().includes('service');
      const hasProducts = fullContent.toLowerCase().includes('product');
      const hasPricing = fullContent.toLowerCase().includes('price') || fullContent.toLowerCase().includes('cost');
      
      analysis = {
        productDescription: hasProducts ? "Product-based business" : hasServices ? "Service-based business" : "Business website",
        targetAudience: "Potential customers and clients",
        painPoints: "Various business challenges",
        valueProposition: "Solutions for customer needs",
        contentQuality: hasAbout && hasServices ? 7 : 5,
        suggestions: [
          !hasAbout ? "Add an About page to build trust" : "Improve About page content",
          !hasPricing ? "Include pricing information" : "Make pricing more prominent",
          "Add customer testimonials",
          "Improve call-to-action buttons",
          "Optimize for mobile devices"
        ].filter(Boolean),
        marketingChannels: ["SEO", "Content Marketing", "Social Media", "Email Marketing"]
      };
    }

    return new Response(JSON.stringify({ 
      success: true, 
      analysis,
      crawled_content_length: fullContent.length,
      pages_crawled: 1 + additionalPages.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-website-real function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractWebsiteContent(html: string, baseUrl: string): string {
  // Remove scripts, styles, and comments
  let content = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // Extract title
  const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Extract meta description
  const metaDescMatch = content.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : '';

  // Extract headings
  const headings = [];
  const headingMatches = content.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi);
  if (headingMatches) {
    headings.push(...headingMatches.map(h => h.replace(/<[^>]+>/g, '').trim()));
  }

  // Extract navigation links
  const navLinks = [];
  const navMatches = content.match(/<(?:nav|header)[^>]*>[\s\S]*?<\/(?:nav|header)>/gi);
  if (navMatches) {
    navMatches.forEach(nav => {
      const linkMatches = nav.match(/<a[^>]*>([^<]+)<\/a>/gi);
      if (linkMatches) {
        navLinks.push(...linkMatches.map(l => l.replace(/<[^>]+>/g, '').trim()));
      }
    });
  }

  // Extract main content (remove HTML tags)
  const textContent = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Structure the extracted content
  const structuredContent = `
WEBSITE: ${baseUrl}
TITLE: ${title}
META DESCRIPTION: ${metaDescription}

MAIN HEADINGS:
${headings.slice(0, 10).join('\n')}

NAVIGATION:
${navLinks.slice(0, 15).join(' | ')}

CONTENT:
${textContent.substring(0, 4000)}
  `.trim();

  return structuredContent;
}

async function crawlAdditionalPages(baseUrl: string, mainHtml: string): Promise<string[]> {
  const additionalContent: string[] = [];
  
  try {
    // Extract potential additional page URLs
    const urlsToTry = [];
    const domain = new URL(baseUrl).origin;
    
    // Common page patterns
    const commonPages = ['/about', '/about-us', '/services', '/products', '/pricing', '/contact'];
    urlsToTry.push(...commonPages.map(path => `${domain}${path}`));
    
    // Extract URLs from main page links
    const linkMatches = mainHtml.match(/<a[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi);
    if (linkMatches) {
      linkMatches.forEach(link => {
        const hrefMatch = link.match(/href=["']([^"']+)["']/);
        const textMatch = link.match(/>([^<]+)</);
        
        if (hrefMatch && textMatch) {
          const href = hrefMatch[1];
          const text = textMatch[1].toLowerCase();
          
          // Look for about, services, products pages
          if ((text.includes('about') || text.includes('service') || text.includes('product')) 
              && href.startsWith('/')) {
            urlsToTry.push(`${domain}${href}`);
          }
        }
      });
    }

    // Limit to first 2 additional pages to avoid timeout
    const uniqueUrls = [...new Set(urlsToTry)].slice(0, 2);
    
    for (const url of uniqueUrls) {
      try {
        console.log('Crawling additional page:', url);
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          signal: AbortSignal.timeout(3000) // 3 second timeout
        });
        
        if (response.ok) {
          const html = await response.text();
          const content = extractWebsiteContent(html, url);
          additionalContent.push(`PAGE: ${url}\n${content}`);
        }
      } catch (e) {
        console.log('Failed to crawl:', url, e.message);
        // Continue with other pages
      }
    }
  } catch (e) {
    console.log('Error in additional page crawling:', e);
  }
  
  return additionalContent;
}