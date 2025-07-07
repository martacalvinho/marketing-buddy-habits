import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    <Card className={`border-4 ${color} shadow-brutal`}>
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
      
      {/* Main Analysis Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderSection(
          analysis.businessOverview, 
          <Target className="w-5 h-5" />,
          "border-blue-500"
        )}
        
        {renderSection(
          analysis.marketingStrengths, 
          <TrendingUp className="w-5 h-5" />,
          "border-green-500"
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderSection(
          analysis.marketingOpportunities, 
          <Lightbulb className="w-5 h-5" />,
          "border-yellow-500"
        )}
        
        {renderSection(
          analysis.contentMessaging, 
          <MessageSquare className="w-5 h-5" />,
          "border-purple-500"
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderSection(
          analysis.competitivePositioning, 
          <Users className="w-5 h-5" />,
          "border-orange-500"
        )}
        
        {renderSection(
          analysis.actionableRecommendations, 
          <CheckCircle className="w-5 h-5" />,
          "border-red-500"
        )}
      </div>
    </div>
  );
};

export default AnalysisDisplay;
