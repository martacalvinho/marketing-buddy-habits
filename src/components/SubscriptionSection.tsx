
import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';
import { Button } from './ui/button';
import { CheckCircle, Crown, AlertTriangle } from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  product_name: string | null;
  product_type: string | null;
  website_url: string | null;
  goal: string | null;
  email: string | null;
  platforms: string[] | null;
  current_streak: number | null;
  last_activity_date: string | null;
  total_tasks_completed: number | null;
  is_premium: boolean | null;
  subscription_status: string | null;
  subscription_id: string | null;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
  created_at: string;
  updated_at: string;
  website_analysis: any;
}

interface SubscriptionSectionProps {
  profile: Profile | null;
  onUpdate: () => void;
}

const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({ profile, onUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleStartTrial = async () => {
    try {
      setIsUpdating(true);
      const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          is_premium: true,
          subscription_status: 'trial',
          subscription_id: 'trial_7_days',
          trial_ends_at: trialEndDate.toISOString(),
          subscription_ends_at: null,
        })
        .eq('user_id', profile?.user_id);

      if (error) throw error;

      toast({
        title: "Free Trial Started! 🎉",
        description: "You now have 7 days of premium access!",
      });

      onUpdate();
    } catch (error) {
      console.error('Error starting trial:', error);
      toast({
        title: "Error",
        description: "Failed to start trial.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpgrade = async (planType: 'basic' | 'pro') => {
    try {
      setIsUpdating(true);
      const subscriptionId = planType === 'basic' ? 'basic_monthly' : 'pro_monthly';
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          is_premium: true,
          subscription_status: 'active',
          subscription_id: subscriptionId,
          trial_ends_at: null,
          subscription_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('user_id', profile?.user_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Upgraded to " + (planType === 'basic' ? 'Basic' : 'Pro') + " plan successfully!",
      });

      onUpdate();
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast({
        title: "Error",
        description: "Failed to upgrade subscription.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDowngrade = async () => {
    try {
      setIsUpdating(true);
      const { data, error } = await supabase
        .from('profiles')
        .update({
          is_premium: false,
          subscription_status: 'inactive',
          subscription_id: null,
          trial_ends_at: null,
          subscription_ends_at: null,
        })
        .eq('user_id', profile?.user_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription downgraded successfully!",
      });

      onUpdate();
    } catch (error) {
      console.error('Error downgrading subscription:', error);
      toast({
        title: "Error",
        description: "Failed to downgrade subscription.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!profile) return null;

  const isOnTrial = profile.subscription_status === 'trial';
  const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
  const daysLeft = trialEndsAt ? Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="space-y-4">
      {profile.is_premium ? (
        <div className="space-y-4">
          {isOnTrial ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-warning border-2 border-foreground animate-pulse"></div>
                <span className="font-black text-warning uppercase tracking-wide">Trial Active</span>
              </div>
              <div className="bg-warning/10 border-4 border-warning shadow-brutal-small p-4">
                <p className="text-sm font-black text-warning uppercase tracking-wide">
                  {daysLeft > 0 ? `${daysLeft} Days Left` : 'Trial Expired'}
                </p>
                <p className="text-xs font-bold text-warning/80 mt-1 uppercase">
                  Upgrade now to continue premium access
                </p>
              </div>
              <div className="space-y-3">
                <Button 
                  className="w-full font-black border-4 border-foreground shadow-brutal hover:shadow-brutal-hover uppercase tracking-wide bg-primary text-primary-foreground" 
                  onClick={() => handleUpgrade('basic')}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Processing...' : 'Basic - $8/month'}
                </Button>
                <Button 
                  className="w-full font-black border-4 border-foreground shadow-brutal hover:shadow-brutal-hover uppercase tracking-wide bg-secondary text-secondary-foreground" 
                  onClick={() => handleUpgrade('pro')}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Processing...' : 'Pro - $18/month'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-success border-2 border-foreground">
                  <CheckCircle className="w-3 h-3 text-background" />
                </div>
                <span className="font-black uppercase tracking-wide">Premium Active</span>
              </div>
              <div className="bg-success/10 border-4 border-success shadow-brutal-small p-4">
                <p className="text-sm font-black text-success uppercase tracking-wide">
                  Plan: {profile.subscription_id?.includes('basic') ? 'Basic ($8/month)' : 'Pro ($18/month)'}
                </p>
                <p className="text-xs font-bold text-success/80 mt-1 uppercase">
                  Next billing: {profile.subscription_ends_at ? new Date(profile.subscription_ends_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <Button 
                variant="outline" 
                className="w-full font-black border-4 border-foreground shadow-brutal hover:shadow-brutal-hover uppercase tracking-wide" 
                onClick={handleDowngrade} 
                disabled={isUpdating}
              >
                {isUpdating ? 'Processing...' : 'Downgrade to Free'}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-primary border-4 border-foreground shadow-brutal-small flex items-center justify-center mb-4">
              <Crown className="h-8 w-8 text-primary-foreground" />
            </div>
            <h4 className="font-black uppercase tracking-wide mb-2">Try Premium Free</h4>
            <p className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wide">
              Start your 7-day free trial today!
            </p>
          </div>
          
          <Button 
            className="w-full font-black border-4 border-foreground shadow-brutal hover:shadow-brutal-hover uppercase tracking-wide bg-gradient-primary text-primary-foreground" 
            onClick={handleStartTrial}
            disabled={isUpdating}
          >
            {isUpdating ? 'Starting...' : 'Start 7-Day Free Trial'}
          </Button>
          
          <div className="text-center text-sm font-bold text-muted-foreground uppercase tracking-wide">
            Or choose a plan:
          </div>
          
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full font-black border-4 border-foreground shadow-brutal hover:shadow-brutal-hover uppercase tracking-wide" 
              onClick={() => handleUpgrade('basic')}
              disabled={isUpdating}
            >
              Basic Plan - $8/month
            </Button>
            <Button 
              variant="outline" 
              className="w-full font-black border-4 border-foreground shadow-brutal hover:shadow-brutal-hover uppercase tracking-wide" 
              onClick={() => handleUpgrade('pro')}
              disabled={isUpdating}
            >
              Pro Plan - $18/month
            </Button>
          </div>
          
          <div className="space-y-3 text-sm bg-accent/10 border-4 border-accent shadow-brutal-small p-4">
            <div className="text-xs font-black text-accent uppercase tracking-wide mb-2">Premium Features:</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success border border-foreground"></div>
                <span className="font-bold text-xs uppercase">AI Content Generator</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success border border-foreground"></div>
                <span className="font-bold text-xs uppercase">Advanced Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success border border-foreground"></div>
                <span className="font-bold text-xs uppercase">Priority Support</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionSection;
