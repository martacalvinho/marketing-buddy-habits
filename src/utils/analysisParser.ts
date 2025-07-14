
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
  // Helper function to create meaningful bullet points from content
  const createBulletPoints = (content: string, type: 'opportunities' | 'recommendations'): string[] => {
    if (!content || content.trim() === 'No data available') {
      return type === 'opportunities' 
        ? ['Identify target audience needs', 'Analyze competitor strategies', 'Explore content gaps']
        : ['Develop content calendar', 'Optimize social media presence', 'Create engagement strategy'];
    }

    // Clean the content
    const cleanContent = content
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/`/g, '') // Remove code backticks
      .replace(/_/g, '') // Remove italic markdown
      .replace(/^\s*[-•*]\s*/gm, '') // Remove existing bullet points
      .replace(/^\s*\d+\.\s*/gm, ''); // Remove numbered lists

    // Split into sentences and filter meaningful ones
    const sentences = cleanContent
      .split(/[.!?\n\r]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20 && s.length < 150) // Good length for insights
      .filter(s => !s.match(/^(however|therefore|additionally|furthermore|moreover)/i)) // Filter connector words
      .map(s => {
        // Ensure proper capitalization
        s = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
        
        // Add period if missing
        if (!s.endsWith('.')) s += '.';
        
        return s;
      })
      .slice(0, 5); // Take first 5 good sentences

    // If we have good sentences, return the best 3
    if (sentences.length >= 3) {
      return sentences.slice(0, 3);
    }

    // Fallback: create structured insights based on type
    if (type === 'opportunities') {
      return [
        'Expand target audience through strategic content positioning.',
        'Leverage competitive gaps to differentiate market presence.',
        'Develop content strategy aligned with customer needs.'
      ];
    } else {
      return [
        'Implement consistent content publishing schedule.',
        'Optimize messaging for target audience engagement.',
        'Measure and track key marketing performance metrics.'
      ];
    }
  };

  // Extract opportunities from marketing opportunities section
  let opportunities = createBulletPoints(analysis.marketingOpportunities.content, 'opportunities');
  
  // If we didn't get good opportunities, try subsections
  if (opportunities.every(o => o.includes('Expand target audience') || o.includes('Leverage competitive'))) {
    if (analysis.marketingOpportunities.subsections) {
      const subContent = analysis.marketingOpportunities.subsections
        .map(sub => sub.content)
        .join('\n\n');
      opportunities = createBulletPoints(subContent, 'opportunities');
    }
  }

  // Extract recommendations from actionable recommendations section
  let recommendations = createBulletPoints(analysis.actionableRecommendations.content, 'recommendations');
  
  // If we didn't get good recommendations, try subsections
  if (recommendations.every(r => r.includes('Implement consistent') || r.includes('Optimize messaging'))) {
    if (analysis.actionableRecommendations.subsections) {
      const subContent = analysis.actionableRecommendations.subsections
        .map(sub => sub.content)
        .join('\n\n');
      recommendations = createBulletPoints(subContent, 'recommendations');
    }
  }

  return { opportunities, recommendations };
}
