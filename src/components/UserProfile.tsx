
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
import SubscriptionSection from './SubscriptionSection';

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
        <Label htmlFor="oldPassword" className="font-black uppercase tracking-wide">Current Password</Label>
        <Input
          id="oldPassword"
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="Enter your current password"
          className="border-4 border-foreground shadow-brutal-small"
        />
      </div>
      <div>
        <Label htmlFor="newPassword" className="font-black uppercase tracking-wide">New Password</Label>
        <Input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter your new password"
          className="border-4 border-foreground shadow-brutal-small"
        />
      </div>
      <div>
        <Label htmlFor="confirmPassword" className="font-black uppercase tracking-wide">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your new password"
          className="border-4 border-foreground shadow-brutal-small"
        />
      </div>
      <Button 
        onClick={handlePasswordChange} 
        disabled={isUpdating || !newPassword || !confirmPassword}
        className="w-full font-black border-4 border-foreground shadow-brutal hover:shadow-brutal-hover uppercase tracking-wide"
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

      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);

      if (profileError) throw profileError;

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
        <Button variant="destructive" size="sm" className="font-black uppercase tracking-wide">
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent className="border-4 border-foreground shadow-brutal">
        <DialogTitle className="font-black uppercase tracking-wide">Delete Account</DialogTitle>
        <DialogDescription className="font-bold">
          Are you sure you want to delete your account? This action is irreversible.
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} className="font-black uppercase tracking-wide border-2 border-foreground">
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteAccount} className="font-black uppercase tracking-wide">
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
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-foreground border-t-transparent animate-spin mx-auto"></div>
            <p className="mt-4 font-bold text-muted-foreground uppercase tracking-wide">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4 font-black uppercase tracking-wide"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary border-4 border-foreground shadow-brutal-small">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">Profile Settings</h1>
              <p className="font-bold text-muted-foreground uppercase tracking-wide">Manage your account and subscription</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-4 border-foreground shadow-brutal">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-black uppercase tracking-wide">
                  <Settings className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="productName" className="font-black uppercase tracking-wide">Product/Business Name</Label>
                  <Input
                    id="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Enter your product or business name"
                    className="border-4 border-foreground shadow-brutal-small"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="font-black uppercase tracking-wide">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="border-4 border-foreground shadow-brutal-small"
                  />
                </div>
                
                <div>
                  <Label htmlFor="goal" className="font-black uppercase tracking-wide">Marketing Goal</Label>
                  <Input
                    id="goal"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="What's your main marketing goal?"
                    className="border-4 border-foreground shadow-brutal-small"
                  />
                </div>
                
                <Button 
                  onClick={updateProfile} 
                  disabled={isUpdating}
                  className="w-full font-black border-4 border-foreground shadow-brutal hover:shadow-brutal-hover uppercase tracking-wide"
                >
                  {isUpdating ? 'Updating...' : 'Update Profile'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-4 border-foreground shadow-brutal">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-black uppercase tracking-wide">
                  <Shield className="h-5 w-5" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PasswordChangeSection />
              </CardContent>
            </Card>

            <Card className="border-4 border-destructive shadow-brutal">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive font-black uppercase tracking-wide">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-black uppercase tracking-wide">Sign Out</h3>
                    <p className="text-sm font-bold text-muted-foreground uppercase">Sign out of your account</p>
                  </div>
                  <Button variant="outline" onClick={handleSignOut} className="font-black uppercase tracking-wide border-2 border-foreground">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
                
                <Separator className="border-2 border-muted" />
                
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-destructive uppercase tracking-wide">Delete Account</h3>
                    <p className="text-sm font-bold text-muted-foreground uppercase">Permanently delete your account and all data</p>
                  </div>
                  <DeleteAccountDialog />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-4 border-foreground shadow-brutal">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-black uppercase tracking-wide">
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
