
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
  // Helper function to clean and extract meaningful insights
  const extractBulletPoints = (content: string, maxPoints: number = 3): string[] => {
    if (!content || content.trim() === 'No data available') {
      return Array(maxPoints).fill('No insights available');
    }

    // Split content into sentences and clean them
    const sentences = content
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/`/g, '') // Remove code backticks
      .replace(/_/g, '') // Remove italic markdown
      .split(/[.!?\n\r]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10 && !s.match(/^[-•*#]/)) // Filter out short sentences and list markers
      .map(s => {
        // Clean up sentence starts
        s = s.replace(/^[^a-zA-Z]*/, ''); // Remove non-letter starts
        s = s.replace(/^(Key|Main|Primary|Important)\s+/i, ''); // Remove filler words
        return s.charAt(0).toUpperCase() + s.slice(1); // Capitalize first letter
      })
      .filter(s => s.length > 5);

    // Look for numbered lists or bullet points first
    const numberedItems = content.match(/^\d+\.\s*(.+?)(?=\n\d+\.|\n\n|$)/gm);
    if (numberedItems && numberedItems.length >= maxPoints) {
      return numberedItems
        .slice(0, maxPoints)
        .map(item => item.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim())
        .map(item => item.charAt(0).toUpperCase() + item.slice(1));
    }

    // Look for bullet points
    const bulletItems = content.match(/^[-•*]\s*(.+?)(?=\n[-•*]|\n\n|$)/gm);
    if (bulletItems && bulletItems.length >= maxPoints) {
      return bulletItems
        .slice(0, maxPoints)
        .map(item => item.replace(/^[-•*]\s*/, '').replace(/\*\*/g, '').trim())
        .map(item => item.charAt(0).toUpperCase() + item.slice(1));
    }

    // Fallback to sentences
    if (sentences.length >= maxPoints) {
      return sentences.slice(0, maxPoints);
    }

    // If we don't have enough, pad with fallback text
    const result = [...sentences];
    while (result.length < maxPoints) {
      result.push('Additional analysis needed');
    }

    return result.slice(0, maxPoints);
  };

  // Extract market opportunities
  let opportunities: string[] = [];
  
  // First try the main marketing opportunities content
  opportunities = extractBulletPoints(analysis.marketingOpportunities.content, 3);
  
  // If we didn't get good results, try subsections
  if (opportunities.every(o => o === 'Additional analysis needed' || o === 'No insights available')) {
    if (analysis.marketingOpportunities.subsections) {
      const allSubContent = analysis.marketingOpportunities.subsections
        .map(sub => sub.content)
        .join('\n\n');
      opportunities = extractBulletPoints(allSubContent, 3);
    }
  }

  // Extract actionable recommendations
  let recommendations: string[] = [];
  
  // First try the main actionable recommendations content
  recommendations = extractBulletPoints(analysis.actionableRecommendations.content, 3);
  
  // If we didn't get good results, try subsections
  if (recommendations.every(r => r === 'Additional analysis needed' || r === 'No insights available')) {
    if (analysis.actionableRecommendations.subsections) {
      const allSubContent = analysis.actionableRecommendations.subsections
        .map(sub => sub.content)
        .join('\n\n');
      recommendations = extractBulletPoints(allSubContent, 3);
    }
  }

  // Final fallback - try to extract from other sections if needed
  if (opportunities.every(o => o === 'Additional analysis needed' || o === 'No insights available')) {
    // Try content messaging section for opportunities
    opportunities = extractBulletPoints(analysis.contentMessaging.content, 3);
  }

  if (recommendations.every(r => r === 'Additional analysis needed' || r === 'No insights available')) {
    // Try competitive positioning for recommendations
    recommendations = extractBulletPoints(analysis.competitivePositioning.content, 3);
  }

  return { opportunities, recommendations };
}
