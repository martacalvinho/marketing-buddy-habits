import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, Users, Calendar, Globe, RotateCcw } from "lucide-react";

const FEATURES = [
  {
    icon: Globe,
    title: "Website Analysis",
    description: "Input your website URL to get AI-powered feedback and personalized marketing tasks for your unique project",
    uiPreview: (
      <div className="bg-background border-2 border-foreground p-4 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 bg-primary border border-foreground"></div>
          <span className="text-sm font-bold">Website Analysis Results</span>
        </div>
        <div className="space-y-2">
          <div className="bg-accent/20 border border-foreground p-2 text-xs">
            <span className="font-bold">📝 Task:</span> Add customer testimonials to your homepage
          </div>
          <div className="bg-accent/20 border border-foreground p-2 text-xs">
            <span className="font-bold">📝 Task:</span> Create a case study for your pricing page
          </div>
          <div className="bg-accent/20 border border-foreground p-2 text-xs">
            <span className="font-bold">📝 Task:</span> Optimize your call-to-action buttons
          </div>
        </div>
      </div>
    )
  },
  {
    icon: Check,
    title: "Daily Tasks",
    description: "Get personalized marketing tasks tailored to your business type and goals",
    uiPreview: (
      <div className="bg-background border-2 border-foreground p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold">Today's Tasks</span>
          <div className="bg-primary text-primary-foreground px-2 py-1 text-xs border border-foreground">2/3</div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 bg-success/20 border border-foreground">
            <div className="w-4 h-4 bg-success border border-foreground flex items-center justify-center">
              <Check className="w-2 h-2" />
            </div>
            <span className="text-xs">Write LinkedIn post about new feature</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-background border border-foreground">
            <div className="w-4 h-4 border-2 border-foreground"></div>
            <span className="text-xs">Update product screenshots</span>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: Star,
    title: "Streak Tracking",
    description: "Build consistent marketing habits with our visual streak tracker",
    uiPreview: (
      <div className="bg-background border-2 border-foreground p-4">
        <div className="text-center mb-3">
          <div className="text-2xl mb-1">🔥</div>
          <span className="text-sm font-bold">7-day streak!</span>
        </div>
        <div className="flex justify-center gap-1 mb-3">
          {[1,2,3,4,5,6,7].map((day) => (
            <div key={day} className="w-6 h-6 bg-success border border-foreground flex items-center justify-center">
              <div className="w-2 h-2 bg-success-foreground"></div>
            </div>
          ))}
        </div>
        <div className="text-center text-xs text-muted-foreground">
          14 tasks completed this week
        </div>
      </div>
    )
  }
];

const PRICING_PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "Website analysis",
      "3 daily tasks per week",
      "Basic streak tracking",
      "Community support"
    ],
    cta: "Get Started Free",
    popular: false
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    features: [
      "Everything in Free",
      "Unlimited daily tasks",
      "Advanced analytics",
      "Strategy library access",
      "Priority support"
    ],
    cta: "Start Pro Trial",
    popular: true
  },
  {
    name: "Team",
    price: "$49",
    period: "per month",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Custom strategies",
      "Dedicated support",
      "White-label option"
    ],
    cta: "Contact Sales",
    popular: false
  }
];

const Index = () => {
  const [flippedCards, setFlippedCards] = useState<number[]>([]);

  const toggleCard = (index: number) => {
    setFlippedCards(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-3xl mb-8 shadow-glow animate-pulse-glow">
            <span className="text-3xl font-bold text-primary-foreground">MB</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Your{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Marketing Buddy
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The consistent marketing companion for solo founders and indie hackers. 
            Build habits, track progress, and grow your business one task at a time.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" variant="hero" className="text-lg px-8 py-6" asChild>
              <a href="/auth">Get Started Free</a>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to stay consistent
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Marketing Buddy gives you the tools and guidance to build a sustainable marketing practice
          </p>
        </div>
        
        <div className="space-y-12 max-w-4xl mx-auto">
          {FEATURES.map((feature, index) => {
            const isFlipped = flippedCards.includes(index);
            return (
              <div 
                key={index} 
                className="group perspective-1000 cursor-pointer"
                onClick={() => toggleCard(index)}
              >
                <div className={`relative w-full transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                  {/* Front of card */}
                  <Card className="absolute inset-0 bg-gradient-card border-2 border-foreground shadow-brutal hover:shadow-brutal-hover transition-all duration-300 animate-fade-in backface-hidden p-8">
                    <div className="flex items-center gap-8">
                      <div className="flex-shrink-0">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary border-2 border-foreground shadow-brutal-small mb-4">
                          <feature.icon className="w-8 h-8 text-primary-foreground" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                        <p className="text-lg text-muted-foreground mb-4">
                          {feature.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <RotateCcw className="w-4 h-4" />
                          Click to see dashboard preview
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Back of card - Dashboard UI Preview */}
                  <Card className="absolute inset-0 bg-accent/10 border-2 border-accent shadow-brutal hover:shadow-brutal-hover transition-all duration-300 rotate-y-180 backface-hidden p-8">
                    <div className="flex items-center gap-8 h-full">
                      <div className="flex-shrink-0">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-accent border-2 border-foreground shadow-brutal-small mb-4">
                          <feature.icon className="w-8 h-8 text-accent-foreground" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-4 text-accent-foreground">{feature.title} Dashboard</h3>
                        <div className="bg-background rounded border-2 border-foreground p-1 mb-4">
                          {feature.uiPreview}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <RotateCcw className="w-4 h-4" />
                          Click to go back
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your marketing journey
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PRICING_PLANS.map((plan, index) => (
            <Card key={index} className={`bg-gradient-card border-2 border-foreground shadow-brutal hover:shadow-brutal-hover transition-all duration-300 relative ${plan.popular ? 'scale-105' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-accent text-accent-foreground px-4 py-2 border-2 border-foreground shadow-brutal-small text-sm font-bold uppercase tracking-wide">
                    Most Popular
                  </div>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center gap-1 mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-success flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full mt-6" 
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                  asChild
                >
                  <a href="/auth">{plan.cta}</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-primary border-0 shadow-glow text-primary-foreground max-w-4xl mx-auto">
          <CardContent className="text-center p-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to build your marketing habit?
            </h3>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Founders who've made marketing a consistent part of their routines are more likely to succeed.
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <a href="/auth">Start Your Journey</a>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">MB</span>
              </div>
              <span className="font-semibold">Marketing Buddy</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Marketing Buddy. Built for indie hackers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
