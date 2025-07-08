import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Eye, Trash2, Plus, TrendingUp, Target } from "lucide-react";

// Interface for website analysis data structure
interface AnalysisData {
  business_overview?: any;
  marketing_strengths?: any;
  marketing_opportunities?: any[];
  content_messaging_analysis?: any;
  competitive_positioning?: any;
  actionable_recommendations?: any[];
  key_insights?: any[];
}

interface WebsiteAnalysis {
  id: string;
  website_url: string;
  analysis_data: AnalysisData;
  analysis_topics: string[];
  market_opportunities: number;
  action_items: number;
  created_at: string;
  updated_at: string;
}

interface WebsiteAnalysisStorageProps {
  userId: string;
}

export default function WebsiteAnalysisStorage({ userId }: WebsiteAnalysisStorageProps) {
  const [analyses, setAnalyses] = useState<WebsiteAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<WebsiteAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyses();
  }, [userId]);

  const loadAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('website_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match our interface
      const transformedData = (data || []).map(item => ({
        id: item.id,
        website_url: item.website_url,
        analysis_data: item.analysis_data as AnalysisData,
        analysis_topics: item.analysis_topics,
        market_opportunities: item.market_opportunities || 0,
        action_items: item.action_items || 0,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      setAnalyses(transformedData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load website analyses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveAnalysis = async (analysisData: AnalysisData, websiteUrl: string) => {
    try {
      // Extract topics and counts from analysis data
      const topics = extractTopicsFromAnalysis(analysisData);
      const marketOpportunities = analysisData.marketing_opportunities?.length || 0;
      const actionItems = analysisData.actionable_recommendations?.length || 0;

      const { data, error } = await supabase
        .from('website_analyses')
        .insert({
          user_id: userId,
          website_url: websiteUrl,
          analysis_data: analysisData as any,
          analysis_topics: topics,
          market_opportunities: marketOpportunities,
          action_items: actionItems,
        })
        .select()
        .single();

      if (error) throw error;

      const newAnalysis: WebsiteAnalysis = {
        id: data.id,
        website_url: data.website_url,
        analysis_data: data.analysis_data as AnalysisData,
        analysis_topics: data.analysis_topics,
        market_opportunities: data.market_opportunities || 0,
        action_items: data.action_items || 0,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setAnalyses([newAnalysis, ...analyses]);
      toast({
        title: "Analysis Saved",
        description: "Website analysis has been saved successfully",
      });

      return newAnalysis;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save website analysis",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAnalysis = async (analysisId: string) => {
    try {
      const { error } = await supabase
        .from('website_analyses')
        .delete()
        .eq('id', analysisId);

      if (error) throw error;

      setAnalyses(analyses.filter(a => a.id !== analysisId));
      if (selectedAnalysis?.id === analysisId) {
        setSelectedAnalysis(null);
      }

      toast({
        title: "Analysis Deleted",
        description: "Website analysis has been deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete analysis",
        variant: "destructive",
      });
    }
  };

  const extractTopicsFromAnalysis = (analysisData: AnalysisData): string[] => {
    const topics = new Set<string>();
    
    // Extract topics from different sections of the analysis
    if (analysisData.business_overview) topics.add('business_overview');
    if (analysisData.marketing_strengths) topics.add('marketing_strengths');
    if (analysisData.marketing_opportunities) topics.add('marketing_opportunities');
    if (analysisData.content_messaging_analysis) topics.add('content_messaging');
    if (analysisData.competitive_positioning) topics.add('competitive_positioning');
    if (analysisData.actionable_recommendations) topics.add('actionable_recommendations');
    if (analysisData.key_insights) topics.add('key_insights');
    
    return Array.from(topics);
  };

  const generateTasksFromAnalysis = async (analysis: WebsiteAnalysis, section: string) => {
    // This would integrate with your task generation system
    toast({
      title: "Tasks Generated",
      description: `Generated tasks from ${section} analysis`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg font-black uppercase">Loading analyses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase">Website Analyses</h2>
          <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            {analyses.length} analyses saved
          </p>
        </div>
        <Button variant="hero" size="sm" className="font-black uppercase">
          <Plus className="w-4 h-4 mr-2" />
          New Analysis
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analysis List */}
        <div className="space-y-4">
          {analyses.map((analysis) => (
            <Card 
              key={analysis.id} 
              className={`border-4 border-foreground shadow-brutal cursor-pointer transition-all hover:shadow-brutal-hover ${
                selectedAnalysis?.id === analysis.id ? 'bg-accent/10' : 'bg-card'
              }`}
              onClick={() => setSelectedAnalysis(analysis)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-black uppercase truncate">
                    {analysis.website_url}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAnalysis(analysis.id);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <CardDescription className="text-xs font-bold uppercase tracking-wide">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {new Date(analysis.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-yellow-100 border-2 border-foreground p-2 text-center">
                    <div className="text-xs font-black uppercase">Opportunities</div>
                    <div className="text-lg font-black">{analysis.market_opportunities}</div>
                  </div>
                  <div className="bg-green-100 border-2 border-foreground p-2 text-center">
                    <div className="text-xs font-black uppercase">Actions</div>
                    <div className="text-lg font-black">{analysis.action_items}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {analysis.analysis_topics.slice(0, 3).map((topic) => (
                    <Badge key={topic} variant="outline" className="text-xs font-bold uppercase">
                      {topic.replace('_', ' ')}
                    </Badge>
                  ))}
                  {analysis.analysis_topics.length > 3 && (
                    <Badge variant="outline" className="text-xs font-bold">
                      +{analysis.analysis_topics.length - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {analyses.length === 0 && (
            <Card className="border-4 border-foreground shadow-brutal">
              <CardContent className="text-center py-8">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <div className="text-lg font-black uppercase mb-2">No Analyses Yet</div>
                <p className="text-sm text-muted-foreground">
                  Run your first website analysis to get started
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Analysis Details */}
        <div>
          {selectedAnalysis ? (
            <Card className="border-4 border-foreground shadow-brutal">
              <CardHeader>
                <CardTitle className="text-lg font-black uppercase">
                  Analysis Details
                </CardTitle>
                <CardDescription className="font-bold uppercase tracking-wide">
                  {selectedAnalysis.website_url}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-6 border-2 border-foreground">
                    <TabsTrigger value="overview" className="font-black uppercase text-xs">Overview</TabsTrigger>
                    <TabsTrigger value="business" className="font-black uppercase text-xs">Business</TabsTrigger>
                    <TabsTrigger value="marketing" className="font-black uppercase text-xs">Marketing</TabsTrigger>
                    <TabsTrigger value="opportunities" className="font-black uppercase text-xs">Opportunities</TabsTrigger>
                    <TabsTrigger value="positioning" className="font-black uppercase text-xs">Positioning</TabsTrigger>
                    <TabsTrigger value="actions" className="font-black uppercase text-xs">Actions</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-primary/10 border-2 border-foreground p-3 text-center">
                        <div className="text-sm font-black uppercase">Market Opportunities</div>
                        <div className="text-2xl font-black">{selectedAnalysis.market_opportunities}</div>
                      </div>
                      <div className="bg-secondary/10 border-2 border-foreground p-3 text-center">
                        <div className="text-sm font-black uppercase">Action Items</div>
                        <div className="text-2xl font-black">{selectedAnalysis.action_items}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-black uppercase">Analysis Topics:</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedAnalysis.analysis_topics.map((topic) => (
                          <Badge key={topic} variant="outline" className="font-bold uppercase">
                            {topic.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="business" className="space-y-3">
                    <div className="bg-blue-50 border-2 border-foreground p-4">
                      <div className="text-sm font-black uppercase mb-2">Business Overview</div>
                      <div className="text-sm">{selectedAnalysis.analysis_data.business_overview?.summary || 'No business overview available'}</div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="marketing" className="space-y-3">
                    <div className="bg-green-50 border-2 border-foreground p-4">
                      <div className="text-sm font-black uppercase mb-2">Marketing Strengths</div>
                      <div className="text-sm">{selectedAnalysis.analysis_data.marketing_strengths?.summary || 'No marketing strengths data available'}</div>
                    </div>
                    <div className="bg-purple-50 border-2 border-foreground p-4">
                      <div className="text-sm font-black uppercase mb-2">Content & Messaging Analysis</div>
                      <div className="text-sm">{selectedAnalysis.analysis_data.content_messaging_analysis?.summary || 'No content analysis available'}</div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="opportunities" className="space-y-3">
                    {selectedAnalysis.analysis_data.marketing_opportunities?.map((opportunity: any, index: number) => (
                      <div key={index} className="bg-yellow-50 border-2 border-foreground p-3">
                        <div className="font-bold text-sm">{opportunity.title || `Opportunity ${index + 1}`}</div>
                        <div className="text-xs text-muted-foreground mt-1">{opportunity.description}</div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 text-xs font-bold uppercase"
                          onClick={() => generateTasksFromAnalysis(selectedAnalysis, 'opportunities')}
                        >
                          <Target className="w-3 h-3 mr-1" />
                          Generate Tasks
                        </Button>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="text-sm font-bold uppercase">No opportunities data available</div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="positioning" className="space-y-3">
                    <div className="bg-orange-50 border-2 border-foreground p-4">
                      <div className="text-sm font-black uppercase mb-2">Competitive Positioning</div>
                      <div className="text-sm">{selectedAnalysis.analysis_data.competitive_positioning?.summary || 'No competitive positioning data available'}</div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="actions" className="space-y-3">
                    {selectedAnalysis.analysis_data.actionable_recommendations?.map((action: any, index: number) => (
                      <div key={index} className="bg-green-50 border-2 border-foreground p-3">
                        <div className="font-bold text-sm">{action.title || `Action ${index + 1}`}</div>
                        <div className="text-xs text-muted-foreground mt-1">{action.description}</div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 text-xs font-bold uppercase"
                          onClick={() => generateTasksFromAnalysis(selectedAnalysis, 'actions')}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add to Tasks
                        </Button>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="text-sm font-bold uppercase">No action items available</div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-4 border-foreground shadow-brutal">
              <CardContent className="text-center py-12">
                <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <div className="text-lg font-black uppercase mb-2">Select an Analysis</div>
                <p className="text-sm text-muted-foreground">
                  Choose an analysis from the list to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Export the saveAnalysis function for use in other components
export { WebsiteAnalysisStorage };
