export interface AnalysisSection {
  title: string;
  content: string;
  subsections?: { title: string; content: string }[];
}

export interface ParsedAnalysis {
  businessOverview: AnalysisSection;
  marketingStrengths: AnalysisSection;
  marketingOpportunities: AnalysisSection;
  contentMessaging: AnalysisSection;
  competitivePositioning: AnalysisSection;
  actionableRecommendations: AnalysisSection;
}

export function parseAnalysisMarkdown(markdown: string): ParsedAnalysis {
  const sections = markdown.split(/^##\s+/m).filter(section => section.trim());
  
  const findSection = (sectionNumber: string, fallbackTitle: string): AnalysisSection => {
    const section = sections.find(s => s.startsWith(sectionNumber) || s.toLowerCase().includes(fallbackTitle.toLowerCase()));
    if (!section) return { title: fallbackTitle, content: 'No data available' };
    
    const lines = section.split('\n');
    const title = lines[0].replace(/^\d+\.\s*/, '').trim();
    const content = lines.slice(1).join('\n').trim();
    
    // Parse subsections (###)
    const subsectionParts = content.split(/^###\s+/m).filter(part => part.trim());
    const subsections: { title: string; content: string }[] = [];
    
    let mainContent = '';
    
    if (subsectionParts.length > 1) {
      mainContent = subsectionParts[0].trim();
      for (let i = 1; i < subsectionParts.length; i++) {
        const subsectionLines = subsectionParts[i].split('\n');
        const subsectionTitle = subsectionLines[0].trim();
        const subsectionContent = subsectionLines.slice(1).join('\n').trim();
        subsections.push({ title: subsectionTitle, content: subsectionContent });
      }
    } else {
      mainContent = content;
    }
    
    return {
      title,
      content: mainContent,
      subsections: subsections.length > 0 ? subsections : undefined
    };
  };

  return {
    businessOverview: findSection('1.', 'Business Overview'),
    marketingStrengths: findSection('2.', 'Marketing Strengths'),
    marketingOpportunities: findSection('3.', 'Marketing Opportunities'),
    contentMessaging: findSection('4.', 'Content & Messaging Analysis'),
    competitivePositioning: findSection('5.', 'Competitive Positioning'),
    actionableRecommendations: findSection('6.', 'Actionable Recommendations')
  };
}

export function extractKeyInsights(analysis: ParsedAnalysis): {
  opportunities: string[];
  recommendations: string[];
} {
  const opportunities: string[] = [];
  const recommendations: string[] = [];
  
  // Extract bullet points from opportunities
  const opportunityContent = analysis.marketingOpportunities.content;
  const opportunityMatches = opportunityContent.match(/^[-•]\s+(.+)$/gm);
  if (opportunityMatches) {
    opportunities.push(...opportunityMatches.map(match => match.replace(/^[-•]\s+/, '').trim()));
  }
  
  // Extract bullet points from recommendations
  const recommendationContent = analysis.actionableRecommendations.content;
  const recommendationMatches = recommendationContent.match(/^[-•]\s+(.+)$/gm);
  if (recommendationMatches) {
    recommendations.push(...recommendationMatches.map(match => match.replace(/^[-•]\s+/, '').trim()));
  }
  
  // Also check subsections
  if (analysis.marketingOpportunities.subsections) {
    analysis.marketingOpportunities.subsections.forEach(sub => {
      const matches = sub.content.match(/^[-•]\s+(.+)$/gm);
      if (matches) {
        opportunities.push(...matches.map(match => match.replace(/^[-•]\s+/, '').trim()));
      }
    });
  }
  
  if (analysis.actionableRecommendations.subsections) {
    analysis.actionableRecommendations.subsections.forEach(sub => {
      const matches = sub.content.match(/^[-•]\s+(.+)$/gm);
      if (matches) {
        recommendations.push(...matches.map(match => match.replace(/^[-•]\s+/, '').trim()));
      }
    });
  }
  
  return { opportunities, recommendations };
}
