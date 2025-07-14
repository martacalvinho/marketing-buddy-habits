import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import WebsiteAnalyzer from './WebsiteAnalyzer';
import { strategies } from '@/data/strategies';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState("");
  const [goal, setGoal] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState("");
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [websiteAnalysis, setWebsiteAnalysis] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [keyInsights, setKeyInsights] = useState<any>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const platformOptions = [
    "Instagram", "TikTok", "YouTube", "LinkedIn", "Twitter", "Facebook", "Pinterest", "Email"
  ];

  const handlePlatformChange = (platform: string, checked: boolean) => {
    if (checked) {
      setPlatforms([...platforms, platform]);
    } else {
      setPlatforms(platforms.filter(p => p !== platform));
    }
  };

  const handleAnalysisComplete = (analysis: string, insights?: any, url?: string) => {
    setWebsiteAnalysis(analysis);
    setKeyInsights(insights);
    if (url) setWebsiteUrl(url);
    setAnalysisComplete(true);
  };

  const completeOnboarding = async () => {
    setIsCompleting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      console.log('Starting onboarding completion for user:', user.id);
      console.log('Profile data:', { productName, productType, goal, platforms, selectedStrategy, websiteUrl });

      // Save profile with onboarding data - don't save selected_strategy_id since it's not a UUID
      const profileData = {
        user_id: user.id,
        product_name: productName || null,
        product_type: productType || null,
        goal: goal || null,
        platforms: platforms.length > 0 ? platforms : null,
        website_url: websiteUrl || null,
        website_analysis: websiteAnalysis ? {
          analysis_text: websiteAnalysis,
          analyzed_at: new Date().toISOString(),
          url: websiteUrl,
          key_insights: keyInsights
        } : null
      };

      console.log('Attempting to save profile:', profileData);

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'user_id'
        });

      if (profileError) {
        console.error('Profile save error:', profileError);
        throw profileError;
      }

      console.log('Profile saved successfully');

      // Generate strategy and tasks only if we have a selected strategy
      if (selectedStrategy && websiteAnalysis) {
        console.log('Generating strategy with selected strategy ID:', selectedStrategy);
        
        const selectedStrategyData = strategies.find(s => s.id === selectedStrategy);
        
        const { data: strategyData, error: strategyError } = await supabase.functions.invoke('generate-strategy', {
          body: { 
            strategyId: selectedStrategy,
            strategyName: selectedStrategyData?.name || 'Content Strategy',
            strategyDescription: selectedStrategyData?.description || '',
            websiteAnalysis: websiteAnalysis,
            isOnboarding: true,
            platforms: platforms,
            productName: productName,
            goal: goal
          }
        });

        if (strategyError) {
          console.error('Strategy generation error:', strategyError);
          throw strategyError;
        }

        console.log('Strategy generated successfully:', strategyData);
      }

      toast({
        title: "ONBOARDING COMPLETE! 🎉",
        description: "Welcome to your personalized marketing dashboard!",
      });

      navigate('/dashboard');

    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "ONBOARDING FAILED",
        description: error.message || "Could not complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-4 border-foreground shadow-brutal">
            <CardHeader className="text-center border-b-4 border-foreground">
              <CardTitle className="text-2xl font-black uppercase">
                Tell us about your business
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div>
                <Label htmlFor="productName" className="text-base font-bold uppercase">
                  Product/Business Name
                </Label>
                <Input
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Enter your product or business name"
                  className="mt-2 border-4 border-foreground"
                />
              </div>

              <div>
                <Label htmlFor="productType" className="text-base font-bold uppercase">
                  What type of business is this?
                </Label>
                <Select value={productType} onValueChange={setProductType}>
                  <SelectTrigger className="mt-2 border-4 border-foreground">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saas">SaaS/Software</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="service">Service Business</SelectItem>
                    <SelectItem value="content">Content/Media</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="goal" className="text-base font-bold uppercase">
                  Primary Marketing Goal
                </Label>
                <Textarea
                  id="goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="What's your main marketing objective? (e.g., increase brand awareness, generate leads, drive sales)"
                  className="mt-2 border-4 border-foreground"
                  rows={3}
                />
              </div>

              <Button 
                onClick={() => setStep(2)} 
                className="w-full"
                variant="hero"
                disabled={!productName || !productType || !goal}
              >
                CONTINUE
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-4 border-foreground shadow-brutal">
            <CardHeader className="text-center border-b-4 border-foreground">
              <CardTitle className="text-2xl font-black uppercase">
                Choose your platforms
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div>
                <Label className="text-base font-bold uppercase mb-4 block">
                  Which platforms do you want to focus on?
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  {platformOptions.map((platform) => (
                    <div key={platform} className="flex items-center space-x-3">
                      <Checkbox
                        id={platform}
                        checked={platforms.includes(platform)}
                        onCheckedChange={(checked) => handlePlatformChange(platform, checked as boolean)}
                      />
                      <Label 
                        htmlFor={platform} 
                        className="text-sm font-medium cursor-pointer"
                      >
                        {platform}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => setStep(1)} 
                  variant="outline"
                  className="flex-1 border-4 border-foreground"
                >
                  BACK
                </Button>
                <Button 
                  onClick={() => setStep(3)} 
                  className="flex-1"
                  variant="hero"
                  disabled={platforms.length === 0}
                >
                  CONTINUE
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border-4 border-foreground shadow-brutal">
            <CardHeader className="text-center border-b-4 border-foreground">
              <CardTitle className="text-2xl font-black uppercase">
                Analyze your website
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <WebsiteAnalyzer onAnalysisComplete={handleAnalysisComplete} />
              
              {analysisComplete && (
                <div className="mt-8 flex gap-4">
                  <Button 
                    onClick={() => setStep(2)} 
                    variant="outline"
                    className="flex-1 border-4 border-foreground"
                  >
                    BACK
                  </Button>
                  <Button 
                    onClick={() => setStep(4)} 
                    className="flex-1"
                    variant="hero"
                  >
                    CONTINUE TO STRATEGY
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-4 border-foreground shadow-brutal">
            <CardHeader className="text-center border-b-4 border-foreground">
              <CardTitle className="text-2xl font-black uppercase">
                Choose your strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div>
                <Label className="text-base font-bold uppercase mb-4 block">
                  Pick a content strategy that fits your goals
                </Label>
                <div className="space-y-4">
                  {strategies.map((strategy) => (
                    <div
                      key={strategy.id}
                      className={`p-4 border-4 cursor-pointer transition-colors ${
                        selectedStrategy === strategy.id
                          ? 'border-primary bg-primary/10'
                          : 'border-foreground hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedStrategy(strategy.id)}
                    >
                      <h3 className="font-black text-lg uppercase">{strategy.name}</h3>
                      <p className="text-sm font-medium mt-2">{strategy.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => setStep(3)} 
                  variant="outline"
                  className="flex-1 border-4 border-foreground"
                >
                  BACK
                </Button>
                <Button 
                  onClick={completeOnboarding}
                  className="flex-1"
                  variant="hero"
                  disabled={!selectedStrategy || isCompleting}
                >
                  {isCompleting ? "SETTING UP..." : "COMPLETE ONBOARDING"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};

export default Onboarding;
