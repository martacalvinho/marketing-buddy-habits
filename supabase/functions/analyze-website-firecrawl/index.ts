import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
const firecrawlEndpoint = Deno.env.get('FIRECRAWL_ENDPOINT') || 'http://localhost:3002'; // Default to local instance

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CrawlResult {
  url: string;
  title: string;
  content: string;
  links: string[];
}

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

    if (!firecrawlEndpoint) {
      throw new Error('Firecrawl endpoint not configured');
    }

    console.log('Starting comprehensive website crawl for:', websiteUrl);

    // Step 1: Crawl the main page to discover navigation links
    const mainPageResponse = await fetch(`${firecrawlEndpoint}/v0/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: websiteUrl,
        formats: ['markdown', 'links'],
        onlyMainContent: true,
      }),
    });

    if (!mainPageResponse.ok) {
      throw new Error(`Firecrawl API error: ${mainPageResponse.status}`);
    }

    const mainPageData = await mainPageResponse.json();
    
    if (!mainPageData.success) {
      throw new Error(`Failed to crawl main page: ${mainPageData.error}`);
    }

    // Extract navigation and important links from the main page
    const allLinks = mainPageData.data.links || [];
    const baseUrl = new URL(websiteUrl).origin;
    
    // Filter for internal navigation links (likely menu items)
    const navigationLinks = allLinks
      .filter((link: string) => {
        try {
          const linkUrl = new URL(link, baseUrl);
          return linkUrl.origin === baseUrl && 
                 !link.includes('#') && 
                 !link.includes('mailto:') && 
                 !link.includes('tel:') &&
                 !link.match(/\.(pdf|jpg|jpeg|png|gif|zip|doc|docx)$/i);
        } catch {
          return false;
        }
      })
      .slice(0, 10); // Limit to 10 pages to avoid excessive crawling

    console.log(`Found ${navigationLinks.length} navigation links to crawl`);

    // Step 2: Crawl all discovered navigation pages
    const crawlPromises = navigationLinks.map(async (link: string) => {
      try {
        const response = await fetch(`${firecrawlEndpoint}/v0/scrape`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: link,
            formats: ['markdown'],
            onlyMainContent: true,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            return {
              url: link,
              title: data.data.metadata?.title || 'Untitled',
              content: data.data.markdown || '',
              links: data.data.links || []
            };
          }
        }
        return null;
      } catch (error) {
        console.error(`Failed to crawl ${link}:`, error);
        return null;
      }
    });

    // Add the main page to the results
    const mainPageResult: CrawlResult = {
      url: websiteUrl,
      title: mainPageData.data.metadata?.title || 'Home Page',
      content: mainPageData.data.markdown || '',
      links: allLinks
    };

    const crawlResults = await Promise.all(crawlPromises);
    const validResults = [mainPageResult, ...crawlResults.filter(result => result !== null)] as CrawlResult[];

    // Step 3: Create comprehensive markdown summary
    const markdownSummary = createMarkdownSummary(validResults, websiteUrl);

    // Step 4: Analyze with AI using the comprehensive markdown
    const analysisPrompt = `You are a marketing expert analyzing a website. I've crawled multiple pages and created a comprehensive markdown summary. Please analyze this content and provide detailed insights.

COMPREHENSIVE WEBSITE ANALYSIS:
${markdownSummary}

Please analyze and return a JSON object with these exact keys:
{
  "productDescription": "Detailed description of what the product/service is based on all pages",
  "targetAudience": "Who the target audience appears to be based on messaging across pages",
  "painPoints": "What pain points or problems the product solves (from all content)",
  "valueProposition": "The main value proposition and unique selling points",
  "contentQuality": "Assessment of how clear and compelling the messaging is across all pages (1-10)",
  "suggestions": "5-7 specific suggestions for improving the website based on the full analysis",
  "marketingChannels": "Recommended marketing channels based on the product and audience"
}

Be thorough and insightful. Focus on actionable insights based on the comprehensive content analysis.`;

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
            content: 'You are a marketing expert analyzing websites. Always respond with valid JSON only. Be thorough and provide actionable insights.' 
          },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
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
        productDescription: "Comprehensive analysis unavailable",
        targetAudience: "Could not determine from crawled content",
        painPoints: "Could not identify from available pages",
        valueProposition: "Unclear from comprehensive content review",
        contentQuality: 5,
        suggestions: [
          "Improve navigation clarity",
          "Add consistent messaging across pages",
          "Enhance call-to-action placement",
          "Improve page loading speed",
          "Add social proof elements"
        ],
        marketingChannels: ["SEO", "Content Marketing", "Social Media", "Email Marketing"]
      };
    }

    return new Response(JSON.stringify({ 
      success: true, 
      analysis,
      pages_crawled: validResults.length,
      crawled_content_length: markdownSummary.length,
      markdown_summary: markdownSummary.substring(0, 1000) + '...' // Return truncated summary for reference
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-website-firecrawl function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function createMarkdownSummary(crawlResults: CrawlResult[], websiteUrl: string): string {
  const summary = [`# Website Analysis Summary for ${websiteUrl}`, ''];
  
  summary.push(`**Total Pages Analyzed:** ${crawlResults.length}`);
  summary.push(`**Analysis Date:** ${new Date().toISOString()}`);
  summary.push('');

  crawlResults.forEach((result, index) => {
    summary.push(`## Page ${index + 1}: ${result.title}`);
    summary.push(`**URL:** ${result.url}`);
    summary.push('');
    
    // Clean and truncate content for each page
    const cleanContent = result.content
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .trim()
      .substring(0, 2000); // Limit each page content
    
    summary.push('**Content:**');
    summary.push(cleanContent);
    summary.push('');
    
    if (result.links && result.links.length > 0) {
      summary.push('**Key Links Found:**');
      result.links.slice(0, 5).forEach(link => {
        summary.push(`- ${link}`);
      });
      summary.push('');
    }
    
    summary.push('---');
    summary.push('');
  });

  return summary.join('\n');
}
