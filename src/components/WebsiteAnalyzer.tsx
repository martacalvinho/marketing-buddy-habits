import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Globe, Target, Lightbulb, TrendingUp } from "lucide-react";

interface WebsiteAnalysis {
  productDescription: string;
  targetAudience: string;
  painPoints: string;
  valueProposition: string;
  contentQuality: number;
  suggestions: string[];
  marketingChannels: string[];
}

interface WebsiteAnalyzerProps {
  onAnalysisComplete: (analysis: WebsiteAnalysis) => void;
}

export default function WebsiteAnalyzer({ onAnalysisComplete }: WebsiteAnalyzerProps) {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<WebsiteAnalysis | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!websiteUrl) {
      toast({
        title: "Error",
        description: "Please enter a website URL",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-website', {
        body: { websiteUrl }
      });

      if (error) throw error;

      if (data.success) {
        setAnalysis(data.analysis);
        onAnalysisComplete(data.analysis);
        toast({
          title: "Analysis Complete!",
          description: "Your website has been analyzed successfully",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze website. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 8) return "bg-success text-success-foreground";
    if (score >= 6) return "bg-warning text-warning-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  return (
    <div className="space-y-6">
      <Card className="bg-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-black uppercase">
            <Globe className="w-6 h-6" />
            WEBSITE ANALYSIS
          </CardTitle>
          <CardDescription className="text-base font-medium">
            Let's analyze your website to understand how it comes across to potential customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="https://yourwebsite.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="flex-1 border-4 border-foreground text-base font-medium"
              disabled={isAnalyzing}
            />
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !websiteUrl}
              variant="hero"
              className="px-8"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ANALYZING...
                </>
              ) : (
                "ANALYZE"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Overview */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
                <Target className="w-5 h-5" />
                PRODUCT OVERVIEW
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-bold text-sm uppercase mb-2">What You're Building:</h4>
                <p className="text-sm font-medium">{analysis.productDescription}</p>
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase mb-2">Target Audience:</h4>
                <p className="text-sm font-medium">{analysis.targetAudience}</p>
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase mb-2">Pain Points Solved:</h4>
                <p className="text-sm font-medium">{analysis.painPoints}</p>
              </div>
            </CardContent>
          </Card>

          {/* Value Proposition & Quality */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                VALUE PROPOSITION
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-bold text-sm uppercase mb-2">Main Value:</h4>
                <p className="text-sm font-medium">{analysis.valueProposition}</p>
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase mb-2">Content Quality Score:</h4>
                <Badge className={`${getQualityColor(analysis.contentQuality)} text-lg px-4 py-2 font-black`}>
                  {analysis.contentQuality}/10
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Suggestions */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                IMPROVEMENT SUGGESTIONS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-sm uppercase mb-3">Landing Page Improvements:</h4>
                  <ul className="space-y-2">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm font-medium flex items-start gap-2">
                        <span className="w-2 h-2 bg-foreground rounded-full mt-2 flex-shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-sm uppercase mb-3">Recommended Channels:</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.marketingChannels.map((channel, index) => (
                      <Badge key={index} variant="outline" className="border-2 border-foreground font-bold">
                        {channel}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}