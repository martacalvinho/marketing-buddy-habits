import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import WebsiteAnalyzer from "./WebsiteAnalyzer";
import AnalysisDisplay from "./AnalysisDisplay";
import { MARKETING_STRATEGIES } from "./EnhancedStrategyLibrary";

const PRODUCT_TYPES = [
  { id: "saas", label: "SaaS", description: "Software as a Service product" },
  { id: "ecommerce", label: "E-commerce", description: "Online store or marketplace" },
  { id: "content", label: "Content", description: "Blog, newsletter, or media" },
  { id: "services", label: "Services", description: "Consulting, agency, or freelancing" },
  { id: "other", label: "Other", description: "Something else entirely" }
];

const PLATFORMS = [
  { id: "twitter", label: "Twitter/X" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "tiktok", label: "TikTok" },
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube" },
  { id: "email", label: "Email Marketing" },
  { id: "seo", label: "SEO/Content" },
  { id: "reddit", label: "Reddit" },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    productType: "",
    productName: "",
    websiteUrl: "",
    goal: "",
    platforms: [] as string[],
    selectedStrategy: "",
    websiteAnalysis: null as any,
    keyInsights: null as any
  });
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load form data from localStorage on component mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('onboarding-form-data');
    const savedStep = localStorage.getItem('onboarding-step');
    
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
    
    if (savedStep) {
      setStep(parseInt(savedStep, 10));
    }
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('onboarding-form-data', JSON.stringify(formData));
  }, [formData]);

  // Save current step to localStorage
  useEffect(() => {
    localStorage.setItem('onboarding-step', step.toString());
  }, [step]);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Auth error:', error);
          toast({
            title: "Authentication Required",
            description: "Please sign in to continue with onboarding.",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking auth:', error);
        navigate('/auth');
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const progress = (step / 5) * 100;

  const handlePlatformChange = (platformId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({ ...prev, platforms: [...prev.platforms, platformId] }));
    } else {
      setFormData(prev => ({ ...prev, platforms: prev.platforms.filter(p => p !== platformId) }));
    }
  };

  const handleAnalysisComplete = (analysis: any, keyInsights?: any, websiteUrl?: string) => {
    // Store analysis, keyInsights, and websiteUrl
    setFormData(prev => ({ 
      ...prev, 
      websiteAnalysis: analysis, 
      keyInsights,
      websiteUrl: websiteUrl || prev.websiteUrl 
    }));
  };

  const handleSaveToTasks = (tasks: any[]) => {
    // This will be implemented when we add task saving functionality
    console.log('Tasks to save:', tasks);
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      // Use the user state we're already tracking
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to complete onboarding.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // Find the selected strategy from MARKETING_STRATEGIES to get its name
      const selectedStrategyData = MARKETING_STRATEGIES.find(s => s.id === formData.selectedStrategy);
      console.log('Selected strategy data:', selectedStrategyData);
      console.log('Selected strategy ID:', formData.selectedStrategy);

      // Save profile data with selected_strategy (store the strategy name/ID for reference)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          email: user.email,
          website_url: formData.websiteUrl,
          product_name: formData.productName,
          product_type: formData.productType,
          goal: formData.goal,
          platforms: formData.platforms,
          selected_strategy_id: formData.selectedStrategy, // Store the strategy ID directly
          current_streak: 0,
          last_activity_date: new Date().toISOString().split('T')[0]
        }, {
          onConflict: 'user_id'
        });

      if (profileError) throw profileError;

      // Save website analysis to website_analyses table
      let websiteAnalysisId = null;
      if (formData.websiteAnalysis) {
        const { data: analysisData, error: analysisError } = await supabase
          .from('website_analyses')
          .insert({
            user_id: user.id,
            website_url: formData.websiteUrl,
            analysis_data: formData.websiteAnalysis,
          })
          .select('id')
          .single();

        if (analysisError) throw analysisError;
        websiteAnalysisId = analysisData.id;

        // Save each analysis section to analysis_sections table
        try {
          console.log('Saving analysis sections for user:', user.id, 'URL:', formData.websiteUrl);
          // Dynamically import parser and saver
          const { parseAnalysisMarkdown } = await import('@/utils/analysisParser');
          const { saveAnalysisSections } = await import('@/utils/saveAnalysisSections');
          const parsed = parseAnalysisMarkdown(formData.websiteAnalysis);
          console.log('Parsed analysis sections:', Object.keys(parsed));
          await saveAnalysisSections(user.id, formData.websiteUrl || '', parsed);
          console.log('Successfully saved analysis sections to database');
        } catch (sectionSaveError) {
          console.error('Failed to save analysis sections:', sectionSaveError);
          // Don't throw - continue with onboarding even if section saving fails
        }
      }

      // Generate initial tasks based on analysis and selected strategy
      if (formData.websiteAnalysis && formData.selectedStrategy) {
        try {
          console.log('Generating initial tasks with strategy:', formData.selectedStrategy);
          
          // Get the strategy details to include in the prompt
          const strategyDetails = selectedStrategyData ? {
            name: selectedStrategyData.name,
            description: selectedStrategyData.description,
            category: selectedStrategyData.category
          } : null;

          const { data: taskData } = await supabase.functions.invoke('generate-strategy', {
            body: {
              analysis: formData.websiteAnalysis,
              userGoal: formData.goal,
              productType: formData.productType,
              platforms: formData.platforms,
              selectedStrategy: strategyDetails, // Pass the full strategy details
              websiteAnalysisId: websiteAnalysisId,
              isOnboarding: true // Flag to generate 5 specific tasks
            }
          });

          if (taskData?.success) {
            console.log('Tasks generated successfully:', taskData);
            
            // Save the generated tasks
            const weekStartDate = new Date();
            weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay());
            
            const tasks = taskData.strategy.weeklyTasks.map((t: any) => ({
              user_id: user.id,
              website_analysis_id: websiteAnalysisId,
              title: t.title,
              description: t.description,
              category: t.category,
              priority: t.priority,
              estimated_time: t.estimatedTime,
              ai_suggestion: t.aiSuggestion,
              week_start_date: weekStartDate.toISOString().split('T')[0]
            }));

            const { error: tasksError } = await supabase.from('tasks').insert(tasks);
            if (tasksError) {
              console.error('Error saving tasks:', tasksError);
            } else {
              console.log(`Successfully saved ${tasks.length} tasks`);
            }
          }
        } catch (strategyError) {
          console.error("Error generating initial tasks:", strategyError);
          // Continue even if task generation fails
        }
      }

      // Clear onboarding data from localStorage on successful completion
      localStorage.removeItem('onboarding-form-data');
      localStorage.removeItem('onboarding-step');
      
      toast({
        title: "Welcome to Marketing Buddy! 🎉",
        description: "Your personalized marketing dashboard is ready with initial tasks",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const getStepTitle = () => {
    switch(step) {
      case 1: return "What are you building?";
      case 2: return "What's your website?";
      case 3: return "What's your goal?";
      case 4: return "Where are you active?";
      case 5: return "Choose your strategy";
      default: return "";
    }
  };

  const getStepDescription = () => {
    switch(step) {
      case 1: return "Help us understand your business type";
      case 2: return "Let's analyze your website to understand your product better";
      case 3: return "What would you like to achieve?";
      case 4: return "Select the platforms you use or want to use";
      case 5: return "Pick ONE strategy to focus on this week";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary border-4 border-foreground shadow-brutal mb-4">
            <span className="text-2xl font-black text-primary-foreground">MB</span>
          </div>
          <h1 className="text-4xl font-black uppercase">LET'S GET YOU SET UP</h1>
          <p className="text-foreground/70 mt-2 font-bold text-lg uppercase tracking-wide">
            Tell us about your business so we can personalize your experience
          </p>
        </div>

        <div className="mb-8">
          <Progress value={progress} className="w-full h-4 border-2 border-foreground" />
          <p className="text-sm font-bold mt-2 text-center uppercase tracking-wide">
            Step {step} of 5
          </p>
        </div>

        <Card className="shadow-brutal border-4 border-foreground bg-card">
          <CardHeader>
            <CardTitle className="text-2xl font-black uppercase">
              {getStepTitle()}
            </CardTitle>
            <CardDescription className="text-base font-bold uppercase tracking-wide">
              {getStepDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="product-name" className="text-sm font-black uppercase">Product/Business Name</Label>
                  <Input
                    id="product-name"
                    placeholder="e.g., Acme SaaS, John's Consultancy"
                    value={formData.productName}
                    onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                    className="border-4 border-foreground text-base font-medium"
                  />
                </div>
                <RadioGroup value={formData.productType} onValueChange={(value) => setFormData(prev => ({ ...prev, productType: value }))}>
                  {PRODUCT_TYPES.map((type) => (
                    <div key={type.id} className="flex items-center space-x-3 p-4 border-2 border-foreground bg-background">
                      <RadioGroupItem value={type.id} id={type.id} className="border-2 border-foreground" />
                      <Label htmlFor={type.id} className="flex-1 cursor-pointer">
                        <div className="font-black text-base uppercase">{type.label}</div>
                        <div className="text-sm font-medium">{type.description}</div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <WebsiteAnalyzer onAnalysisComplete={handleAnalysisComplete} />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <Label htmlFor="goal" className="text-sm font-black uppercase">What's your main marketing goal?</Label>
                <Textarea
                  id="goal"
                  placeholder="e.g., Get 100 signups, Reach 1K Twitter followers, Validate my MVP, Generate leads..."
                  value={formData.goal}
                  onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                  rows={4}
                  className="border-4 border-foreground text-base font-medium"
                />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {PLATFORMS.map((platform) => (
                    <div key={platform.id} className="flex items-center space-x-3 p-4 border-2 border-foreground bg-background">
                      <Checkbox
                        id={platform.id}
                        checked={formData.platforms.includes(platform.id)}
                        onCheckedChange={(checked) => 
                          handlePlatformChange(platform.id, checked as boolean)
                        }
                        className="border-2 border-foreground"
                      />
                      <Label htmlFor={platform.id} className="cursor-pointer font-bold text-base">
                        {platform.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                  Choose the marketing strategy you want to focus on this week. You can change this later.
                </p>
                <div className="grid gap-3">
                  {MARKETING_STRATEGIES.map((strategy) => (
                    <div 
                      key={strategy.id} 
                      className={`p-4 border-2 cursor-pointer transition-colors ${
                        formData.selectedStrategy === strategy.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-foreground bg-background hover:border-primary/50'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, selectedStrategy: strategy.id }))}
                    >
                      <div>
                        <h3 className="font-bold text-base uppercase">{strategy.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{strategy.description}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-secondary rounded font-medium">
                            {strategy.category}
                          </span>
                          <span className="text-xs px-2 py-1 bg-secondary rounded font-medium">
                            {strategy.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              {step > 1 ? (
                <Button variant="outline" onClick={prevStep} className="font-black uppercase">
                  Previous
                </Button>
              ) : (
                <div />
              )}
              
              {step < 5 ? (
                <Button 
                  onClick={nextStep}
                  disabled={
                    (step === 1 && (!formData.productType || !formData.productName)) ||
                    (step === 2 && !formData.websiteAnalysis) ||
                    (step === 3 && !formData.goal) ||
                    (step === 4 && formData.platforms.length === 0)
                  }
                  variant="hero"
                  className="font-black uppercase"
                >
                  Continue
                </Button>
              ) : (
                <Button 
                  onClick={handleComplete}
                  disabled={!formData.selectedStrategy || isLoading}
                  variant="hero"
                  className="font-black uppercase"
                >
                  {isLoading ? "SETTING UP..." : "COMPLETE SETUP"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
