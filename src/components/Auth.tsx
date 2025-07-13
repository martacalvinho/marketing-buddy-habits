import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auto-redirect if user already logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // check profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('product_name')
          .eq('user_id', session.user.id)
          .single();
        navigate(profile?.product_name ? '/dashboard' : '/onboarding');
      }
    };
    checkLoggedIn();
  }, [navigate]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent, isSignUp: boolean) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = isSignUp 
        ? await supabase.auth.signUp({ 
            email, 
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/`
            }
          })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      if (isSignUp && data.user && !data.session) {
        toast({
          title: "Check your email!",
          description: "We sent you a confirmation link to complete your signup.",
        });
      } else if (data.session) {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
        
        // Check if user has completed onboarding
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('product_name')
          .eq('user_id', data.user.id)
          .maybeSingle();
        
        // Navigate based on profile completion
        if (profile?.product_name) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      }
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async (isSignUp: boolean) => {
    setGoogleLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/onboarding`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Google authentication failed",
        description: error.message,
        variant: "destructive",
      });
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4 shadow-glow">
            <span className="text-2xl font-bold text-primary-foreground">MB</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Marketing Buddy
          </h1>
          <p className="text-muted-foreground mt-2">
            Your consistent marketing companion
          </p>
        </div>

        <Card className="shadow-soft border-0 bg-gradient-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Join thousands of founders growing their businesses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    variant="hero"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
                
                <div className="mt-4 text-center">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4 flex items-center gap-2"
                    onClick={() => handleGoogleAuth(false)}
                    disabled={googleLoading}
                  >
                    <Mail className="w-4 h-4" />
                    {googleLoading ? "Signing in..." : "Sign in with Google"}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    variant="hero"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
                
                <div className="mt-4 text-center">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4 flex items-center gap-2"
                    onClick={() => handleGoogleAuth(true)}
                    disabled={googleLoading}
                  >
                    <Mail className="w-4 h-4" />
                    {googleLoading ? "Creating account..." : "Sign up with Google"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}