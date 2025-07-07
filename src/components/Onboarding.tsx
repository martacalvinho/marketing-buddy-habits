import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

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
  const [productType, setProductType] = useState("");
  const [goal, setGoal] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [productName, setProductName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const progress = (step / 3) * 100;

  const handlePlatformChange = (platformId: string, checked: boolean) => {
    if (checked) {
      setPlatforms([...platforms, platformId]);
    } else {
      setPlatforms(platforms.filter(p => p !== platformId));
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    // TODO: Save to Supabase
    console.log("Onboarding complete:", {
      productType,
      productName,
      goal,
      platforms
    });
    
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1000);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4">
            <span className="text-2xl font-bold text-primary-foreground">MB</span>
          </div>
          <h1 className="text-3xl font-bold">Let's get you set up</h1>
          <p className="text-muted-foreground mt-2">
            Tell us about your business so we can personalize your experience
          </p>
        </div>

        <div className="mb-8">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Step {step} of 3
          </p>
        </div>

        <Card className="shadow-soft border-0 bg-gradient-card">
          <CardHeader>
            <CardTitle>
              {step === 1 && "What are you building?"}
              {step === 2 && "What's your goal?"}
              {step === 3 && "Where are you active?"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Help us understand your business type"}
              {step === 2 && "What would you like to achieve?"}
              {step === 3 && "Select the platforms you use or want to use"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Product/Business Name</Label>
                  <Input
                    id="product-name"
                    placeholder="e.g., Acme SaaS, John's Consultancy"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>
                <RadioGroup value={productType} onValueChange={setProductType}>
                  {PRODUCT_TYPES.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={type.id} id={type.id} />
                      <Label htmlFor={type.id} className="flex-1 cursor-pointer">
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-muted-foreground">{type.description}</div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <Label htmlFor="goal">What's your main marketing goal?</Label>
                <Textarea
                  id="goal"
                  placeholder="e.g., Get 100 signups, Reach 1K Twitter followers, Validate my MVP, Generate leads..."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  rows={4}
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {PLATFORMS.map((platform) => (
                    <div key={platform.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={platform.id}
                        checked={platforms.includes(platform.id)}
                        onCheckedChange={(checked) => 
                          handlePlatformChange(platform.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={platform.id} className="cursor-pointer">
                        {platform.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              {step > 1 ? (
                <Button variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              ) : (
                <div />
              )}
              
              {step < 3 ? (
                <Button 
                  onClick={nextStep}
                  disabled={
                    (step === 1 && (!productType || !productName)) ||
                    (step === 2 && !goal)
                  }
                  variant="hero"
                >
                  Continue
                </Button>
              ) : (
                <Button 
                  onClick={handleComplete}
                  disabled={platforms.length === 0 || isLoading}
                  variant="hero"
                >
                  {isLoading ? "Setting up..." : "Complete Setup"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}