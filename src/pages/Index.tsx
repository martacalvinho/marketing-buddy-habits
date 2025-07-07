import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, Users, Calendar } from "lucide-react";

const FEATURES = [
  {
    icon: Check,
    title: "Daily Tasks",
    description: "Get personalized marketing tasks tailored to your business type and goals"
  },
  {
    icon: Star,
    title: "Streak Tracking",
    description: "Build consistent marketing habits with our visual streak tracker"
  },
  {
    icon: Users,
    title: "Strategy Library",
    description: "Access proven marketing strategies with step-by-step guides"
  },
  {
    icon: Calendar,
    title: "Experiment Tracking",
    description: "Test new ideas and track what works for your unique business"
  }
];

const Index = () => {
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature, index) => (
            <Card key={index} className="bg-gradient-card border-0 shadow-soft hover:shadow-glow transition-all duration-300 animate-fade-in">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-2xl mb-4 mx-auto">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base">
                  {feature.description}
                </CardDescription>
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
              Join thousands of founders who've made marketing a consistent part of their routine
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
              © 2024 Marketing Buddy. Built for indie hackers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
