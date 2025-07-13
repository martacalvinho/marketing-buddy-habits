import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StrategyConfigurationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strategy: any;
  onComplete: (strategy: any, configuration: any) => void;
}

const STRATEGY_CONFIGURATIONS = {
  'social-media': {
    title: 'Social Media Marketing Configuration',
    description: 'Choose which platforms you want to focus on and customize your approach',
    questions: [
      {
        id: 'platforms',
        type: 'multi-select',
        title: 'Which social media platforms do you want to focus on?',
        description: 'Select all platforms where you want to build your presence',
        options: [
          { id: 'instagram', label: 'Instagram', description: 'Visual content, stories, reels' },
          { id: 'twitter', label: 'Twitter/X', description: 'Real-time updates, engagement' },
          { id: 'linkedin', label: 'LinkedIn', description: 'Professional networking, B2B' },
          { id: 'facebook', label: 'Facebook', description: 'Community building, ads' },
          { id: 'tiktok', label: 'TikTok', description: 'Short-form video content' },
          { id: 'youtube', label: 'YouTube', description: 'Long-form video content' },
        ]
      },
      {
        id: 'content_types',
        type: 'multi-select',
        title: 'What types of content do you want to create?',
        description: 'Choose your preferred content formats',
        options: [
          { id: 'posts', label: 'Regular Posts', description: 'Text and image posts' },
          { id: 'stories', label: 'Stories', description: 'Temporary content' },
          { id: 'videos', label: 'Videos', description: 'Short and long-form videos' },
          { id: 'live', label: 'Live Streams', description: 'Real-time engagement' },
          { id: 'polls', label: 'Polls & Surveys', description: 'Interactive content' },
        ]
      },
      {
        id: 'posting_frequency',
        type: 'select',
        title: 'How often do you want to post?',
        description: 'Choose a realistic posting schedule',
        options: [
          { id: 'daily', label: 'Daily', description: '7 posts per week' },
          { id: 'weekdays', label: 'Weekdays Only', description: '5 posts per week' },
          { id: 'few-times', label: 'Few Times a Week', description: '3-4 posts per week' },
          { id: 'weekly', label: 'Weekly', description: '1-2 posts per week' },
        ]
      }
    ]
  },
  'email-marketing': {
    title: 'Email Marketing Configuration',
    description: 'Set up your email marketing strategy and preferences',
    questions: [
      {
        id: 'email_types',
        type: 'multi-select',
        title: 'What types of emails do you want to send?',
        description: 'Select all email types that fit your strategy',
        options: [
          { id: 'newsletter', label: 'Newsletter', description: 'Regular updates and content' },
          { id: 'promotional', label: 'Promotional', description: 'Sales and offers' },
          { id: 'educational', label: 'Educational', description: 'Tips and tutorials' },
          { id: 'welcome', label: 'Welcome Series', description: 'Onboarding new subscribers' },
          { id: 'abandoned', label: 'Abandoned Cart', description: 'Recovery emails' },
        ]
      },
      {
        id: 'frequency',
        type: 'select',
        title: 'How often do you want to send emails?',
        description: 'Choose a frequency that works for your audience',
        options: [
          { id: 'daily', label: 'Daily', description: 'High engagement strategy' },
          { id: 'weekly', label: 'Weekly', description: 'Most common approach' },
          { id: 'biweekly', label: 'Bi-weekly', description: 'Every two weeks' },
          { id: 'monthly', label: 'Monthly', description: 'Less frequent, high value' },
        ]
      },
      {
        id: 'segments',
        type: 'multi-select',
        title: 'How do you want to segment your audience?',
        description: 'Choose segmentation strategies',
        options: [
          { id: 'behavior', label: 'Behavior-based', description: 'Based on actions taken' },
          { id: 'demographic', label: 'Demographics', description: 'Age, location, etc.' },
          { id: 'purchase', label: 'Purchase History', description: 'Past buying behavior' },
          { id: 'engagement', label: 'Engagement Level', description: 'How active they are' },
        ]
      }
    ]
  },
  'content-marketing': {
    title: 'Content Marketing Configuration',
    description: 'Define your content strategy and focus areas',
    questions: [
      {
        id: 'content_formats',
        type: 'multi-select',
        title: 'What content formats do you want to create?',
        description: 'Select your preferred content types',
        options: [
          { id: 'blog', label: 'Blog Posts', description: 'Written articles and guides' },
          { id: 'videos', label: 'Videos', description: 'Educational and promotional videos' },
          { id: 'podcasts', label: 'Podcasts', description: 'Audio content' },
          { id: 'infographics', label: 'Infographics', description: 'Visual data presentation' },
          { id: 'ebooks', label: 'E-books', description: 'Long-form guides' },
          { id: 'webinars', label: 'Webinars', description: 'Live educational sessions' },
        ]
      },
      {
        id: 'topics',
        type: 'text',
        title: 'What topics do you want to focus on?',
        description: 'List 3-5 main topics related to your business (comma-separated)',
        placeholder: 'e.g., productivity tips, business growth, marketing strategies'
      },
      {
        id: 'publishing_schedule',
        type: 'select',
        title: 'How often do you want to publish content?',
        description: 'Choose a realistic publishing schedule',
        options: [
          { id: 'daily', label: 'Daily', description: 'High-volume content strategy' },
          { id: 'weekly', label: 'Weekly', description: '1-2 pieces per week' },
          { id: 'biweekly', label: 'Bi-weekly', description: 'Every two weeks' },
          { id: 'monthly', label: 'Monthly', description: 'High-quality, in-depth content' },
        ]
      }
    ]
  }
};

export function StrategyConfigurationModal({ open, onOpenChange, strategy, onComplete }: StrategyConfigurationModalProps) {
  const [configuration, setConfiguration] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const strategyConfig = STRATEGY_CONFIGURATIONS[strategy?.id as keyof typeof STRATEGY_CONFIGURATIONS];

  if (!strategyConfig) {
    return null;
  }

  const handleAnswerChange = (questionId: string, value: any) => {
    setConfiguration(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleMultiSelectChange = (questionId: string, optionId: string, checked: boolean) => {
    setConfiguration(prev => ({
      ...prev,
      [questionId]: checked 
        ? [...(prev[questionId] || []), optionId]
        : (prev[questionId] || []).filter((id: string) => id !== optionId)
    }));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Save configuration to database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          strategy_config: configuration
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Configuration Saved! 🎉",
        description: "Your strategy preferences have been saved successfully.",
      });

      onComplete(strategy, configuration);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isConfigurationComplete = () => {
    return strategyConfig.questions.every(question => {
      const answer = configuration[question.id];
      if (question.type === 'multi-select') {
        return answer && answer.length > 0;
      }
      return answer && answer.length > 0;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5 cursor-pointer" onClick={() => onOpenChange(false)} />
            {strategyConfig.title}
          </DialogTitle>
          <p className="text-muted-foreground">{strategyConfig.description}</p>
        </DialogHeader>

        <div className="space-y-6">
          {strategyConfig.questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Badge variant="outline">{index + 1}</Badge>
                  {question.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{question.description}</p>
              </CardHeader>
              <CardContent>
                {question.type === 'multi-select' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {question.options?.map((option) => (
                      <div key={option.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                        <Checkbox
                          id={`${question.id}-${option.id}`}
                          checked={(configuration[question.id] || []).includes(option.id)}
                          onCheckedChange={(checked) => 
                            handleMultiSelectChange(question.id, option.id, checked as boolean)
                          }
                        />
                        <div className="flex-1">
                          <Label 
                            htmlFor={`${question.id}-${option.id}`}
                            className="font-medium cursor-pointer"
                          >
                            {option.label}
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {question.type === 'select' && (
                  <div className="grid grid-cols-1 gap-2">
                    {question.options?.map((option) => (
                      <div 
                        key={option.id} 
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          configuration[question.id] === option.id 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleAnswerChange(question.id, option.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{option.label}</p>
                            <p className="text-xs text-muted-foreground">{option.description}</p>
                          </div>
                          {configuration[question.id] === option.id && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {question.type === 'text' && (
                  <Textarea
                    placeholder={question.placeholder}
                    value={configuration[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="min-h-[100px]"
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleComplete}
            disabled={!isConfigurationComplete() || isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? 'Saving...' : 'Complete Setup'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
