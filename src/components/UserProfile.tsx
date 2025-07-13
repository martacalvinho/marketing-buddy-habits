import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  User,
  Settings,
  Shield,
  CreditCard,
  Crown,
  Target, 
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  LogOut,
} from 'lucide-react';

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
      const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      
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
          subscription_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
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
    <div>
      {profile.is_premium ? (
        <div className="space-y-4">
          {isOnTrial ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-orange-600">Free Trial Active</span>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm font-medium text-orange-800">
                  {daysLeft > 0 ? `${daysLeft} days left` : 'Trial expired'}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Upgrade now to continue premium access
                </p>
              </div>
              <div className="space-y-2">
                <Button 
                  size="sm" 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  onClick={() => handleUpgrade('basic')}
                  disabled={isUpdating}
                >
                  Upgrade to Basic - $8/month
                </Button>
                <Button 
                  size="sm" 
                  className="w-full bg-purple-600 hover:bg-purple-700" 
                  onClick={() => handleUpgrade('pro')}
                  disabled={isUpdating}
                >
                  Upgrade to Pro - $18/month
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-semibold">Premium Active</span>
              </div>
              <p className="text-sm text-gray-600">
                Plan: {profile.subscription_id?.includes('basic') ? 'Basic ($8/month)' : 'Pro ($18/month)'}
              </p>
              <p className="text-sm text-gray-600">
                Next billing: {profile.subscription_ends_at ? new Date(profile.subscription_ends_at).toLocaleDateString() : 'N/A'}
              </p>
              <Button variant="outline" size="sm" className="w-full" onClick={handleDowngrade} disabled={isUpdating}>
                {isUpdating ? 'Processing...' : 'Downgrade to Free'}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <Crown className="h-8 w-8 mx-auto text-purple-500 mb-2" />
            <h4 className="font-semibold">Try Premium Free</h4>
            <p className="text-sm text-gray-600 mb-4">
              Start your 7-day free trial today!
            </p>
          </div>
          
          <Button 
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 font-bold" 
            onClick={handleStartTrial}
            disabled={isUpdating}
          >
            {isUpdating ? 'Starting...' : 'Start 7-Day Free Trial'}
          </Button>
          
          <div className="text-center text-sm text-gray-500">
            Or choose a plan:
          </div>
          
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              onClick={() => handleUpgrade('basic')}
              disabled={isUpdating}
            >
              Basic Plan - $8/month
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              onClick={() => handleUpgrade('pro')}
              disabled={isUpdating}
            >
              Pro Plan - $18/month
            </Button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>AI Content Generator</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Advanced Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Priority Support</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface PasswordChangeSectionProps {
}

const PasswordChangeSection: React.FC<PasswordChangeSectionProps> = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdating(true);
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password changed successfully!",
      });

      // Clear form
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: "Failed to change password.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="oldPassword">Current Password</Label>
        <Input
          id="oldPassword"
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="Enter your current password"
        />
      </div>
      <div>
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter your new password"
        />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your new password"
        />
      </div>
      <Button 
        onClick={handlePasswordChange} 
        disabled={isUpdating || !newPassword || !confirmPassword}
        className="w-full"
      >
        {isUpdating ? 'Updating...' : 'Change Password'}
      </Button>
    </div>
  );
};

interface DeleteAccountDialogProps {
}

const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Sign out the user
      await supabase.auth.signOut();

      toast({
        title: "Success",
        description: "Account deleted successfully!",
      });

      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete your account? This action is irreversible.
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function UserProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form states
  const [productName, setProductName] = useState('');
  const [email, setEmail] = useState('');
  const [goal, setGoal] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      setUser(user);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setProfile(profile);
      setProductName(profile.product_name || '');
      setEmail(profile.email || user.email || '');
      setGoal(profile.goal || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setIsUpdating(true);
      const { data, error } = await supabase
        .from('profiles')
        .update({
          product_name: productName,
          email: email,
          goal: goal,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  }) : 'Unknown';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-full">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600">Manage your account and subscription</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="border-2 border-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="productName">Product/Business Name</Label>
                  <Input
                    id="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Enter your product or business name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                  />
                </div>
                
                <div>
                  <Label htmlFor="goal">Marketing Goal</Label>
                  <Input
                    id="goal"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="What's your main marketing goal?"
                  />
                </div>
                
                <Button 
                  onClick={updateProfile} 
                  disabled={isUpdating}
                  className="w-full"
                >
                  {isUpdating ? 'Updating...' : 'Update Profile'}
                </Button>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card className="border-2 border-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PasswordChangeSection />
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-2 border-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Sign Out</h3>
                    <p className="text-sm text-gray-600">Sign out of your account</p>
                  </div>
                  <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-red-600">Delete Account</h3>
                    <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                  </div>
                  <DeleteAccountDialog />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Status */}
            <Card className="border-2 border-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SubscriptionSection profile={profile} onUpdate={fetchProfile} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
