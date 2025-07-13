import { supabase } from '@/integrations/supabase/client';
import { ParsedAnalysis } from '@/utils/analysisParser';

/**
 * Save each analysis section as a separate row in the analysis_sections table.
 * @param userId - The user's UUID
 * @param websiteUrl - The website being analyzed
 * @param parsedAnalysis - The parsed analysis object
 * @returns Promise<void>
 */
export async function saveAnalysisSections(
  userId: string,
  websiteUrl: string,
  parsedAnalysis: ParsedAnalysis
): Promise<void> {
  const sectionMap = [
    { key: 'businessOverview', type: 'business_overview' },
    { key: 'marketingStrengths', type: 'marketing_strengths' },
    { key: 'marketingOpportunities', type: 'marketing_opportunities' },
    { key: 'contentMessaging', type: 'content_messaging' },
    { key: 'competitivePositioning', type: 'competitive_positioning' },
    { key: 'actionableRecommendations', type: 'actionable_recommendations' },
  ];

  const rows = sectionMap.map(({ key, type }) => {
    const section = parsedAnalysis[key as keyof ParsedAnalysis];
    return {
      user_id: userId,
      website_url: websiteUrl,
      section_type: type,
      section_title: section.title,
      section_content: section.content,
    };
  });

  // Bulk insert all sections
  // @ts-ignore - analysis_sections table exists in DB but not in generated types
  const { error } = await supabase.from('analysis_sections').insert(rows);
  if (error) {
    throw error;
  }
}
