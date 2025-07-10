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

interface AnalysisDisplayProps {
  analysisText: string;
  onSaveToTasks?: (opportunities: string[], recommendations: string[]) => void;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ 
  analysisText, 
  onSaveToTasks 
}) => {
  const analysis = parseAnalysisMarkdown(analysisText);
  const { opportunities, recommendations } = extractKeyInsights(analysis);

  const handleSaveToTasks = () => {
    if (onSaveToTasks) {
      onSaveToTasks(opportunities, recommendations);
    }
  };

  const renderSection = (
    section: ParsedAnalysis[keyof ParsedAnalysis], 
    icon: React.ReactNode,
    color: string = "border-foreground"
  ) => (
    <Card className={`border-4 ${color} shadow-brutal h-full`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
          {icon}
          {section.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {section.content && (
          <div className="text-sm font-medium leading-relaxed whitespace-pre-line">
            {section.content}
          </div>
        )}
        {section.subsections && section.subsections.map((subsection, index) => (
          <div key={index} className="border-l-4 border-foreground pl-4">
            <h4 className="font-black text-sm uppercase mb-2">{subsection.title}</h4>
            <div className="text-sm font-medium leading-relaxed whitespace-pre-line">
              {subsection.content}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  // Define all analysis sections with their icons and colors
  const analysisSections = [
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
      color: "border-red-500"
    }
  ];

  const renderKeyInsights = () => (
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
              Market Opportunities ({opportunities.length})
            </h4>
            <ul className="space-y-2">
              {opportunities.slice(0, 5).map((opportunity, index) => (
                <li key={index} className="text-sm font-medium flex items-start gap-2">
                  <span className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0" />
                  {opportunity}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-black text-sm uppercase mb-3 text-success">
              Action Items ({recommendations.length})
            </h4>
            <ul className="space-y-2">
              {recommendations.slice(0, 5).map((recommendation, index) => (
                <li key={index} className="text-sm font-medium flex items-start gap-2">
                  <span className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0" />
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {onSaveToTasks && (opportunities.length > 0 || recommendations.length > 0) && (
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

  return (
    <div className="space-y-6">
      {/* Key Insights - Top Priority */}
      {renderKeyInsights()}
      
      {/* Analysis Sections Carousel */}
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-black uppercase mb-2">Detailed Analysis</h3>
          <p className="text-sm text-muted-foreground font-medium">
            Swipe through different analysis sections • {analysisSections.length} sections
          </p>
        </div>
        
        <div className="relative px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {analysisSections.map((item, index) => (
                <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="h-96">
                    {renderSection(item.section, item.icon, item.color)}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="border-4 border-foreground shadow-brutal hover:shadow-brutal-hover bg-background" />
            <CarouselNext className="border-4 border-foreground shadow-brutal hover:shadow-brutal-hover bg-background" />
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDisplay;
