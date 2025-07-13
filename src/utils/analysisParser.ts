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
  // Helper to clean up asterisks and markdown artifacts
  const clean = (text: string) => text.replace(/^[*-]\s+/gm, '').replace(/\*/g, '').replace(/`+/g, '').replace(/_/g, '').trim();

  const actionableKeywords = [
    'increase', 'improve', 'add', 'reduce', 'optimize', 'opportunity', 'recommend', 'should', 'suggest', 'consider', 'enhance', 'expand', 'create', 'develop', 'implement', 'focus', 'grow', 'boost', 'leverage', 'prioritize', 'address', 'achieve', 'drive', 'generate', 'launch', 'build', 'strengthen', 'clarify', 'highlight', 'maximize', 'minimize', 'update', 'test', 'experiment', 'measure', 'track', 'analyze', 'remove', 'fix', 'avoid', 'prevent'
  ];

  const extractOrSummarize = (content: string): string[] => {
    // Remove markdown and asterisks, split into sentences
    const sentences = clean(content)
      .split(/[.!?\n\r]+/)
      .map(s => s.trim())
      .filter(s => s && !/^[-•*#]/.test(s) && s.length > 8 && !/^key (value|insight|recommendation|opportunit)/i.test(s));

    // Prefer actionable sentences
    let summary = sentences.filter(s => actionableKeywords.some(k => s.toLowerCase().includes(k)));
    // If not enough, add other non-title sentences
    if (summary.length < 3) {
      const more = sentences.filter(s => !summary.includes(s));
      summary = summary.concat(more);
    }
    // Ensure exactly 3 items
    while (summary.length < 3) summary.push('No additional insight');
    return summary.slice(0, 3);
  };

  // Marketing Opportunities
  let opportunities: string[] = extractOrSummarize(analysis.marketingOpportunities.content);
  if (analysis.marketingOpportunities.subsections) {
    for (const sub of analysis.marketingOpportunities.subsections) {
      const subBullets = extractOrSummarize(sub.content);
      opportunities = opportunities.concat(subBullets).slice(0, 3);
      if (opportunities.length >= 3) break;
    }
  }

  // Actionable Recommendations
  let recommendations: string[] = extractOrSummarize(analysis.actionableRecommendations.content);
  if (analysis.actionableRecommendations.subsections) {
    for (const sub of analysis.actionableRecommendations.subsections) {
      const subBullets = extractOrSummarize(sub.content);
      recommendations = recommendations.concat(subBullets).slice(0, 3);
      if (recommendations.length >= 3) break;
    }
  }

  return { opportunities, recommendations };
}
