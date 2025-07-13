import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { 
  Target, 
  TrendingUp, 
  Lightbulb, 
  MessageSquare, 
  Users, 
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { parseAnalysisMarkdown, extractKeyInsights, type ParsedAnalysis } from '@/utils/analysisParser';
import { renderBoldText } from '@/utils/textFormat';

interface AnalysisDisplayProps {
  analysisText: string;
  keyInsights?: string[]; // Array of 6 concise bullet points
  onSaveToTasks?: (tasks: string[]) => void;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ 
  analysisText, 
  keyInsights,
  onSaveToTasks 
}) => {
  const analysis = parseAnalysisMarkdown(analysisText);
  
  // Use keyInsights from backend if provided (array of 6 bullets), else fallback to local extraction
  const displayInsights = keyInsights && Array.isArray(keyInsights) && keyInsights.length > 0
    ? keyInsights
    : (() => {
        const { opportunities, recommendations } = extractKeyInsights(analysis);
        return [...opportunities, ...recommendations];
      })();
  
  // Track the current section index
  const [currentSectionIndex, setCurrentSectionIndex] = React.useState(0);

  // Define all analysis sections with their icons and colors
  const [analysisSections, setAnalysisSections] = React.useState([
    {
      section: analysis.businessOverview,
      icon: <Target className="w-5 h-5" />,
      color: "border-blue-500"
    },
    {
      section: analysis.marketingStrengths,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "border-green-500"
    },
    {
      section: analysis.marketingOpportunities,
      icon: <Lightbulb className="w-5 h-5" />,
      color: "border-yellow-500"
    },
    {
      section: analysis.contentMessaging,
      icon: <MessageSquare className="w-5 h-5" />,
      color: "border-purple-500"
    },
    {
      section: analysis.competitivePositioning,
      icon: <Users className="w-5 h-5" />,
      color: "border-orange-500"
    },
    {
      section: analysis.actionableRecommendations,
      icon: <CheckCircle className="w-5 h-5" />,
      color: "border-pink-500"
    }
  ]);

  const handleSaveToTasks = () => {
    if (onSaveToTasks) {
      onSaveToTasks(displayInsights);
    }
  };

  const renderSection = (
    section: ParsedAnalysis[keyof ParsedAnalysis], 
    icon: React.ReactNode,
    color: string = "border-foreground"
  ) => (
    <div className="h-[500px] flex flex-col">
      <Card className={`border-4 ${color} shadow-brutal flex flex-col h-full`}>
        <CardHeader className="pb-4 border-b-4 border-foreground">
          <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
            {icon}
            {section.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {section.content && (
              <div className="text-sm font-medium leading-relaxed whitespace-pre-line">
                {renderBoldText(section.content)}
              </div>
            )}
            {section.subsections && section.subsections.map((subsection, index) => (
              <div key={index} className="border-l-4 border-foreground/30 pl-4">
                <h4 className="font-black text-sm uppercase mb-2">{subsection.title}</h4>
                <div className="text-sm font-medium leading-relaxed whitespace-pre-line">
                  {renderBoldText(subsection.content)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Move a card to the front of the stack
  const bringToFront = (index: number) => {
    if (index === 0) return; // Already at front
    
    setAnalysisSections(prevSections => {
      const newSections = [...prevSections];
      const [moved] = newSections.splice(index, 1);
      return [moved, ...newSections];
    });
    setCurrentSectionIndex(0);
  };

  // Move to next card (rotate right)
  const nextCard = () => {
    setAnalysisSections(prevSections => {
      const [first, ...rest] = prevSections;
      return [...rest, first];
    });
    setCurrentSectionIndex((prevIndex) => 
      prevIndex === analysisSections.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Move to previous card (rotate left)
  const prevCard = () => {
    setAnalysisSections(prevSections => {
      const last = prevSections[prevSections.length - 1];
      const rest = prevSections.slice(0, -1);
      return [last, ...rest];
    });
    setCurrentSectionIndex((prevIndex) => 
      prevIndex === 0 ? analysisSections.length - 1 : prevIndex - 1
    );
  };

  const renderKeyInsights = () => {
    // Extract main categories from actionable recommendations
    const mainCategories = analysis.actionableRecommendations?.content
      .split('\n')
      .filter(line => line.match(/^\d+\.\s+\*\*[^*]+\*\*/))
      .map(line => line.replace(/^\d+\.\s+\*\*|\*\*/g, '').trim()) || [];
    
    return (
      <Card className="border-4 border-success shadow-brutal bg-success/5">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            KEY INSIGHTS FOR YOUR DASHBOARD
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-black text-sm uppercase mb-3 text-success">
                MARKET OPPORTUNITIES (3)
              </h4>
              <ul className="space-y-2">
                {displayInsights.slice(0, 3).map((insight, index) => (
                  <li key={`insight-${index}`} className="text-sm font-medium">
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-black text-sm uppercase mb-3 text-success">
                ACTION ITEMS (3)
              </h4>
              <ul className="space-y-2">
                {displayInsights.slice(3, 6).map((insight, index) => (
                  <li key={`action-${index}`} className="text-sm font-medium">
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {onSaveToTasks && displayInsights.length > 0 && (
            <div className="pt-4 border-t-2 border-success">
              <Button 
                onClick={handleSaveToTasks}
                variant="default"
                className="bg-success hover:bg-success/90 text-success-foreground font-black uppercase"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Save to Weekly Tasks
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Key Insights - Top Priority */}
      {renderKeyInsights()}
      
      {/* Analysis Sections */}
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-black uppercase mb-2">Detailed Analysis</h3>
          <p className="text-sm text-muted-foreground font-medium">
            Swipe through different analysis sections • {analysisSections.length} sections
          </p>
        </div>
        
        <div className="relative max-w-3xl mx-auto">
          <div className="relative w-full" style={{ height: '520px' }}>
            {analysisSections.map((item, index) => {
              // Calculate the offset for the stacked effect
              const maxOffset = 40; // Maximum offset in pixels
              const maxScale = 0.9; // Maximum scale reduction
              const maxOpacity = 0.7; // Maximum opacity reduction
              
              // Calculate values based on position in stack
              const offset = Math.min(20 + (index * 10), maxOffset);
              const zIndex = analysisSections.length - index;
              const translateY = index * 10;
              const translateX = index * 6;
              const scale = 1 - (index * 0.05);
              const opacity = 1 - (index * 0.3);
              const blur = Math.min(index * 0.5, 2);
              
              return (
                <div 
                  key={index}
                  className={`absolute top-0 left-0 right-0 transition-all duration-300 ease-out ${
                    index > 0 ? 'cursor-pointer' : ''
                  }`}
                  style={{
                    zIndex,
                    transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
                    opacity: Math.max(opacity, 0.3),
                    filter: `blur(${blur}px)`,
                    pointerEvents: index === 0 ? 'auto' : 'none',
                    transformOrigin: 'top center',
                  }}
                  onClick={() => index > 0 && bringToFront(index)}
                >
                  <div className="px-4">
                    {renderSection(item.section, item.icon, item.color)}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 px-4">
            <Button 
              variant="outline" 
              size="lg" 
              className="border-4 border-foreground shadow-brutal hover:shadow-brutal-hover bg-background font-black uppercase min-w-32"
              onClick={prevCard}
            >
              ← Previous
            </Button>
            <div className="text-sm font-medium text-muted-foreground flex items-center">
              {currentSectionIndex + 1} of {analysisSections.length}
            </div>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-4 border-foreground shadow-brutal hover:shadow-brutal-hover bg-background font-black uppercase min-w-32"
              onClick={nextCard}
            >
              Next →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDisplay;
