import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AnalysisDisplay from './AnalysisDisplay';
import { 
  ExternalLink, 
  Loader2, 
  Target, 
  TrendingUp, 
  Lightbulb, 
  Globe 
} from 'lucide-react';

interface WebsiteAnalyzerProps {
  onAnalysisComplete: (analysis: string, keyInsights?: any, websiteUrl?: string) => void;
}

export default function WebsiteAnalyzer({ onAnalysisComplete }: WebsiteAnalyzerProps) {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!websiteUrl) return;
    
    setIsAnalyzing(true);
    
    try {
      // Website analysis using Jina AI
      const { data, error } = await supabase.functions.invoke('analyze-website-jina', {
        body: { url: websiteUrl }
      });

      if (error) throw error;

      if (data.success) {
        setAnalysis(data.analysis);
        // Pass analysis, keyInsights, and websiteUrl to parent
        onAnalysisComplete(data.analysis, data.keyInsights, websiteUrl);
        
        // Save analysis to database
        await saveAnalysisToDatabase(data.analysis);
        
        toast({
          title: "ANALYSIS COMPLETE! ",
          description: `Analyzed website with ${data.contentLength} characters of content`,
        });
      } else {
        throw new Error(data.error);
      }

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "ANALYSIS FAILED",
        description: "COULD NOT ANALYZE WEBSITE. PLEASE CHECK THE URL AND TRY AGAIN.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveAnalysisToDatabase = async (analysisText: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          website_url: websiteUrl,
          website_analysis: {
            analysis_text: analysisText,
            analyzed_at: new Date().toISOString(),
            url: websiteUrl
          }
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving analysis:', error);
      }
    } catch (error) {
      console.error('Error saving to database:', error);
    }
  };

  const handleSaveToTasks = async (opportunities: string[], recommendations: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create tasks for opportunities and recommendations
      const tasksToCreate = [
        ...opportunities.map(opportunity => ({
          user_id: user.id,
          title: `Market Opportunity: ${opportunity.substring(0, 50)}...`,
          description: opportunity,
          category: 'marketing_opportunity',
          week_start_date: new Date().toISOString().split('T')[0],
          ai_suggestion: opportunity
        })),
        ...recommendations.map(recommendation => ({
          user_id: user.id,
          title: `Action Item: ${recommendation.substring(0, 50)}...`,
          description: recommendation,
          category: 'action_item',
          week_start_date: new Date().toISOString().split('T')[0],
          ai_suggestion: recommendation
        }))
      ];

      const { error } = await supabase
        .from('tasks')
        .insert(tasksToCreate);

      if (error) throw error;

      toast({
        title: "TASKS CREATED! ",
        description: `Added ${tasksToCreate.length} tasks to your weekly dashboard`,
      });
    } catch (error) {
      console.error('Error creating tasks:', error);
      toast({
        title: "ERROR CREATING TASKS",
        description: "Could not save tasks to dashboard. Please try again.",
        variant: "destructive",
      });
    }
  };



  return (
    <div className="space-y-6">
      <Card className="bg-primary/10 border-4 border-foreground shadow-brutal">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-black uppercase">
            <Globe className="w-6 h-6" />
            WEBSITE ANALYSIS
          </CardTitle>
          <CardDescription className="text-base font-bold uppercase tracking-wide">
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
              className="px-8 font-black uppercase"
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
          {websiteUrl && (
            <div className="mt-4 p-3 bg-muted border-2 border-foreground">
              <div className="flex items-center gap-2 text-sm font-bold">
                <ExternalLink className="w-4 h-4" />
                <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  PREVIEW: {websiteUrl}
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {analysis && (
        <AnalysisDisplay 
          analysisText={analysis}
          onSaveToTasks={handleSaveToTasks}
        />
      )}
    </div>
  );
}