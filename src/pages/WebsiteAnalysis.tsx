import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AnalysisDisplay from "@/components/AnalysisDisplay";
import { ArrowLeft, Plus, TrendingUp, TrendingDown, Calendar, Globe, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WebsiteAnalysis {
  id: string;
  website_url: string;
  analysis_data: any; // Json type from Supabase
  created_at: string;
  market_opportunities: number;
  action_items: number;
}

interface Strategy {
  id: string;
  name: string;
  description: string;
  channel: string;
  created_at: string;
}

export default function WebsiteAnalysis() {
  const [analyses, setAnalyses] = useState<WebsiteAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<WebsiteAnalysis | null>(null);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load website analyses
      const { data: analysesData, error: analysesError } = await supabase
        .from('website_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (analysesError) throw analysesError;

      setAnalyses(analysesData || []);
      if (analysesData && analysesData.length > 0) {
        setSelectedAnalysis(analysesData[0]);
      }

      // Load strategies
      const { data: strategiesData, error: strategiesError } = await supabase
        .from('strategies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (strategiesError) throw strategiesError;
      setStrategies(strategiesData || []);

    } catch (error) {
      console.error('Error loading analyses:', error);
      toast({
        title: "Error",
        description: "Failed to load website analyses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runNewAnalysis = async () => {
    if (!newUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a website URL to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Call the website analysis function
      const { data, error } = await supabase.functions.invoke('analyze-website-jina', {
        body: { url: newUrl }
      });

      if (error) throw error;

      if (data.success && data.analysis) {
        // Save the analysis
        const { data: savedAnalysis, error: saveError } = await supabase
          .from('website_analyses')
          .insert({
            user_id: user.id,
            website_url: newUrl,
            analysis_data: data.analysis,
          })
          .select()
          .single();

        if (saveError) throw saveError;

        // Reload analyses and select the new one
        await loadAnalyses();
        setSelectedAnalysis(savedAnalysis);
        setNewUrl("");

        toast({
          title: "Analysis Complete! 🎉",
          description: "Your website analysis has been saved",
        });
      } else {
        throw new Error("Analysis failed");
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze website",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getImprovementIndicator = (currentAnalysis: WebsiteAnalysis, previousAnalysis?: WebsiteAnalysis) => {
    if (!previousAnalysis) return null;

    const currentOpportunities = currentAnalysis.market_opportunities || 0;
    const previousOpportunities = previousAnalysis.market_opportunities || 0;
    const improvement = currentOpportunities - previousOpportunities;

    if (improvement > 0) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <TrendingUp className="w-3 h-3 mr-1" />
          +{improvement} opportunities
        </Badge>
      );
    } else if (improvement < 0) {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          <TrendingDown className="w-3 h-3 mr-1" />
          {improvement} opportunities
        </Badge>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="lg:col-span-2 h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Website Analysis Hub
              </h1>
              <p className="text-muted-foreground">
                Track your website improvements and marketing strategies
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Analysis List & New Analysis */}
          <div className="space-y-6">
            {/* New Analysis Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  New Analysis
                </CardTitle>
                <CardDescription>
                  Analyze a website to get marketing insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="url">Website URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={runNewAnalysis} 
                  disabled={isAnalyzing}
                  className="w-full"
                  variant="hero"
                >
                  {isAnalyzing ? "Analyzing..." : "Run Analysis"}
                </Button>
              </CardContent>
            </Card>

            {/* Analysis History */}
            <Card>
              <CardHeader>
                <CardTitle>Analysis History</CardTitle>
                <CardDescription>
                  {analyses.length} analyses saved
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No analyses yet</p>
                    <p className="text-sm">Run your first analysis above</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analyses.map((analysis, index) => {
                      const previousAnalysis = analyses[index + 1];
                      const isSelected = selectedAnalysis?.id === analysis.id;
                      
                      return (
                        <div
                          key={analysis.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedAnalysis(analysis)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {new URL(analysis.website_url).hostname}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(analysis.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {getImprovementIndicator(analysis, previousAnalysis) && (
                            <div className="mt-2">
                              {getImprovementIndicator(analysis, previousAnalysis)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Selected Analysis */}
          <div className="lg:col-span-2">
            {selectedAnalysis ? (
              <Tabs defaultValue="analysis" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="analysis">Analysis Details</TabsTrigger>
                  <TabsTrigger value="strategies">Recommended Strategies</TabsTrigger>
                </TabsList>

                <TabsContent value="analysis" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            {new URL(selectedAnalysis.website_url).hostname}
                          </CardTitle>
                          <CardDescription>
                            Analyzed on {new Date(selectedAnalysis.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {selectedAnalysis.market_opportunities > 0 && (
                            <Badge variant="secondary">
                              {selectedAnalysis.market_opportunities} opportunities
                            </Badge>
                          )}
                          {selectedAnalysis.action_items > 0 && (
                            <Badge variant="outline">
                              {selectedAnalysis.action_items} action items
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <AnalysisDisplay 
                        analysisText={typeof selectedAnalysis.analysis_data === 'string' ? selectedAnalysis.analysis_data : JSON.stringify(selectedAnalysis.analysis_data)}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="strategies" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Recommended Strategies
                      </CardTitle>
                      <CardDescription>
                        Marketing strategies generated from this analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {strategies.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No strategies generated yet</p>
                          <p className="text-sm">Complete onboarding to generate strategies</p>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {strategies.map((strategy) => (
                            <Card key={strategy.id} className="border-l-4 border-l-primary">
                              <CardContent className="pt-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-semibold">{strategy.name}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {strategy.description}
                                    </p>
                                  </div>
                                  <Badge variant="outline">{strategy.channel}</Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Analysis Selected</h3>
                  <p>Select an analysis from the history or run a new one</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
