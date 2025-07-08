import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, Users, Calendar, Globe, RotateCcw } from "lucide-react";

const FEATURES = [
  {
    icon: Globe,
    title: "Website Analysis",
    description: "AI-powered feedback and personalized marketing tasks",
    example: "Enter your URL and instantly get insights like 'Add customer testimonials to your homepage' and 'Create a case study for your pricing page'",
    preview: {
      title: "Website Analysis Dashboard",
      content: (
        <div className="bg-card border-4 border-foreground shadow-brutal p-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success border-2 border-foreground animate-pulse"></div>
            <span className="font-black uppercase text-sm">Analysis Complete</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-yellow-100 border-4 border-foreground shadow-brutal-small p-3">
              <div className="text-sm font-black uppercase mb-2">🔍 Insights</div>
              <div className="text-xs font-bold">9 IDENTIFIED</div>
            </div>
            <div className="bg-green-100 border-4 border-foreground shadow-brutal-small p-3">
              <div className="text-sm font-black uppercase mb-2">⚡ Action Items</div>
              <div className="text-xs font-bold">8 GENERATED</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-black uppercase">Key Insights:</div>
            <div className="bg-accent/10 border-2 border-foreground p-3">
              <div className="font-bold text-sm">💡 Limited social proof (no visible testimonials)</div>
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Marketing Opportunity</div>
            </div>
            <div className="bg-primary/10 border-2 border-foreground p-3">
              <div className="font-bold text-sm">📝 Add customer testimonials and case studies</div>
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Actionable Task</div>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    icon: Check,
    title: "Daily Tasks",
    description: "Get personalized marketing tasks tailored to your business and goals",
    example: "Your daily task: 'Write a LinkedIn post about your latest feature update' - estimated time: 15 minutes",
    preview: {
      title: "Daily Tasks Dashboard",
      content: (
        <div className="bg-card border-4 border-foreground shadow-brutal p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-black uppercase">This Week's Tasks</div>
            <div className="bg-accent border-2 border-foreground px-2 py-1 text-xs font-black uppercase">3/5 COMPLETED</div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-primary/10 border-4 border-foreground shadow-brutal-small">
              <div className="w-5 h-5 bg-success border-2 border-foreground flex items-center justify-center">
                <Check className="w-3 h-3 text-background" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-black">Write LinkedIn post about new feature</div>
                <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">CONTENT • 15 MIN • HIGH PRIORITY</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-secondary/10 border-4 border-foreground shadow-brutal-small">
              <div className="w-5 h-5 border-2 border-foreground bg-background"></div>
              <div className="flex-1">
                <div className="text-sm font-black">Share customer success story</div>
                <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">SOCIAL • 10 MIN • MEDIUM PRIORITY</div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    icon: Star,
    title: "Streak Tracking",
    description: "Build consistent marketing habits with our visual streak tracker",
    example: "🔥 7-day streak! You've completed 14 marketing tasks this week. Keep the momentum going!",
    preview: {
      title: "Streak Tracking Dashboard",
      content: (
        <div className="bg-card border-4 border-foreground shadow-brutal p-4 space-y-4">
          <div className="bg-primary/10 border-4 border-foreground shadow-brutal-small p-4 text-center">
            <div className="text-sm font-black uppercase mb-2 flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-success border-2 border-foreground animate-pulse"></div>
              Current Streak
            </div>
            <div className="text-3xl font-black">7 DAYS</div>
            <div className="text-sm font-bold uppercase">Keep it going!</div>
          </div>
          <div className="flex justify-center gap-1">
            {[1,2,3,4,5,6,7].map((day) => (
              <div key={day} className="w-6 h-6 bg-accent border border-foreground text-xs flex items-center justify-center font-bold">
                {day}
              </div>
            ))}
          </div>
          <div className="text-center text-sm bg-success/10 border border-success/20 p-2">
            14 tasks completed this week!
          </div>
        </div>
      )
    }
  },
  {
    icon: Users,
    title: "Strategy Library",
    description: "Access proven marketing strategies with step-by-step guides",
    example: "Browse strategies like 'Product Hunt Launch Guide' with detailed steps from pre-launch to post-launch follow-up",
    preview: {
      title: "Strategy Library Dashboard",
      content: (
        <div className="bg-card border-4 border-foreground shadow-brutal p-4 space-y-4">
          <div className="text-sm font-black uppercase mb-3">Featured Strategies</div>
          <div className="space-y-3">
            <div className="bg-primary/10 border-4 border-foreground shadow-brutal-small p-3">
              <div className="text-sm font-black">🚀 Product Hunt Launch Guide</div>
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">LAUNCH • 12 STEPS • ADVANCED</div>
            </div>
            <div className="bg-accent/10 border-4 border-foreground shadow-brutal-small p-3">
              <div className="text-sm font-black">📱 Social Media Content Calendar</div>
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">CONTENT • 8 STEPS • BEGINNER</div>
            </div>
            <div className="bg-secondary/10 border-4 border-foreground shadow-brutal-small p-3">
              <div className="text-sm font-black">📧 Email Marketing Automation</div>
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">EMAIL • 15 STEPS • INTERMEDIATE</div>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    icon: Calendar,
    title: "Experiment Tracking",
    description: "Test new ideas and track what works for your unique business",
    example: "Track experiments like 'A/B test pricing page copy' with conversion metrics and results analysis",
    preview: {
      title: "Experiment Tracking Dashboard",
      content: (
        <div className="bg-card border-4 border-foreground shadow-brutal p-4 space-y-4">
          <div className="text-sm font-black uppercase mb-3">Active Experiments</div>
          <div className="space-y-3">
            <div className="bg-warning/10 border-4 border-foreground shadow-brutal-small p-3">
              <div className="text-sm font-black">A/B Test: Pricing Page Copy</div>
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">RUNNING • 64% CONVERSION RATE</div>
              <div className="w-full bg-background border-2 border-foreground h-3 mt-2">
                <div className="bg-warning h-full w-3/5 border-r-2 border-foreground"></div>
              </div>
            </div>
            <div className="bg-success/10 border-4 border-foreground shadow-brutal-small p-3">
              <div className="text-sm font-black">Landing Page Headlines</div>
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">COMPLETED • +23% CONVERSION</div>
            </div>
          </div>
        </div>
      )
    }
  }
];

const PRICING_PLANS = [
  {
    name: "Starter",
    price: "$9",
    period: "per month",
    features: [
      "Website analysis",
      "5 daily tasks per week",
      "Basic streak tracking",
      "Strategy library access",
      "Community support"
    ],
    cta: "Start Starter Plan",
    popular: false
  },
  {
    name: "Pro",
    price: "$18",
    period: "per month",
    features: [
      "Everything in Starter",
      "Unlimited daily tasks",
      "Strategy library access & edit",
      "Campaign tracking",
      "Priority support"
    ],
    cta: "Start Pro Plan",
    popular: true
  },
  {
    name: "Teams",
    price: "$32",
    period: "per month",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Custom strategies",
      "Dedicated support",
      "Advanced analytics"
    ],
    cta: "Coming Soon",
    popular: false,
    disabled: true
  }
];

const Index = () => {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const toggleCard = (index: number) => {
    setExpandedCard(prev => prev === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-primary rounded-3xl mb-8 shadow-glow animate-pulse-glow border-4 border-foreground">
            <span className="text-4xl font-black text-primary-foreground">MB</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
            Stop{" "}
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Procrastinating
            </span>
            <br />
            Start{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Marketing
            </span>
          </h1>
          
          <p className="text-2xl md:text-3xl font-bold text-muted-foreground mb-4 max-w-3xl mx-auto">
            The AI-powered marketing companion that turns overwhelmed founders into consistent marketers
          </p>
          

          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" variant="hero" className="text-xl font-black uppercase px-12 py-8 border-4 border-foreground shadow-brutal hover:shadow-brutal-hover" asChild>
              <a href="/auth">Start Building Habits</a>
            </Button>
            <Button size="lg" variant="outline" className="text-xl font-black uppercase px-12 py-8 border-4 border-foreground shadow-brutal hover:shadow-brutal-hover">
              See How It Works
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
        
        <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
          {FEATURES.map((feature, index) => {
            const isExpanded = expandedCard === index;
            return (
              <div key={index} className="space-y-4 w-full max-w-[320px] flex-none md:w-[calc(33.333%-1rem)]">
                {/* Main Card */}
                <Card 
                  className="bg-gradient-card border-2 border-foreground shadow-brutal hover:shadow-brutal-hover transition-all duration-300 cursor-pointer hover:scale-105 h-72 flex flex-col group"
                  onClick={() => toggleCard(index)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary border-2 border-foreground shadow-brutal-small mb-4 mx-auto transition-transform duration-300 group-hover:-translate-y-1">
                      <feature.icon className="w-8 h-8 text-primary-foreground transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center flex-1 flex flex-col justify-between">
                    <CardDescription className="text-base mb-4">
                      {feature.description}
                    </CardDescription>
                    <div className="transition-all duration-300 ease-in-out">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={`text-sm transition-all duration-300 ${
                          isExpanded 
                            ? 'opacity-100 translate-y-0' 
                            : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0'
                        }`}
                      >
                        {isExpanded ? "Hide Preview" : "See Dashboard Preview"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Expanded Preview */}
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  {isExpanded && (
                    <Card className="bg-accent/5 border-2 border-accent shadow-brutal animate-fade-in">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-accent-foreground">
                          {feature.preview.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-auto max-h-[500px]">
                          {feature.preview.content}
                        </div>
                        <div className="mt-4 pt-3 border-t border-accent/20">
                          <p className="text-sm text-muted-foreground italic break-words">
                            "{feature.example}"
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
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
                  disabled={plan.disabled}
                  {...(plan.disabled ? {} : { asChild: true })}
                >
                  {plan.disabled ? plan.cta : <a href="/auth">{plan.cta}</a>}
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
              Founders who've make marketing a consistent part of their routines are more likely to succeed.
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
              © 2025 Marketing Buddy. Built for founders.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
