import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle2, 
  CheckCircle,
  Circle, 
  Target, 
  TrendingUp, 
  Flame, 
  Calendar,
  ArrowRight,
  Sparkles,
  BookOpen,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  RefreshCw,
  Edit,
  User
} from "lucide-react";
import { getMotivationalMessage, getTimeBasedGreeting } from "@/utils/motivationalMessages";
import { MARKETING_STRATEGIES, getIcon } from "./EnhancedStrategyLibrary";
import { StrategyConfigurationModal } from "./StrategyConfigurationModal";

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  week_start_date: string;
  created_at: string;
}

interface Strategy {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  icon: string;
}

interface Profile {
  id: string;
  user_id: string;
  product_name: string;
  product_type: string;
  website_url: string;
  goal: string;
  email: string;
  platforms: string[];
  target_audience?: string;
  current_streak: number;
  last_activity_date: string;
  total_tasks_completed?: number;
  created_at: string;
  updated_at: string;
  selected_strategy_id?: string | null;
  strategy_config?: Record<string, any> | null;
  website_analysis: any;
  business_goals?: string[]; // Added for dashboard usage
}

export default function SimplifiedDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentStrategy, setCurrentStrategy] = useState<Strategy | null>(null);
  const [showStrategyPicker, setShowStrategyPicker] = useState(false);
  const [showStrategyConfig, setShowStrategyConfig] = useState(false);
  const [selectedStrategyForConfig, setSelectedStrategyForConfig] = useState<Strategy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [showContentGenerator, setShowContentGenerator] = useState(false);
  const [selectedTaskForContent, setSelectedTaskForContent] = useState<any>(null);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false); // TODO: Connect to actual subscription status
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // 0 = this week, 1 = next week, -1 = last week
  const { toast } = useToast();

  // Helper function to get week start date based on offset
  const getWeekStartDate = (weekOffset: number = 0) => {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() + (weekOffset * 7));
    return date;
  };

  // Helper function to format date range
  const formatWeekRange = (weekStart: Date) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
    const startStr = weekStart.toLocaleDateString('en-US', options);
    const endStr = weekEnd.toLocaleDateString('en-US', options);
    
    return `${startStr} - ${endStr}`;
  };

  // Helper function to get week number since user started
  const getWeekNumber = (weekOffset: number = 0) => {
    // For now, we'll calculate from current week. In a real app, you'd store the user's start date
    return Math.max(1, 1 + weekOffset);
  };

  const currentWeekStart = getWeekStartDate(currentWeekOffset);

  useEffect(() => {
    loadProfile();
    loadTasks();
    loadCurrentStrategy();
  }, [currentWeekOffset]); // Reload tasks when week changes

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const weekStart = currentWeekStart.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStart)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentStrategy = async () => {
    // For now, we'll use a simple approach - you could store this in user preferences
    const strategies = [
      {
        id: '1',
        name: 'Content Marketing',
        description: 'Create valuable content to attract and engage your audience',
        category: 'Content',
        difficulty: 'Medium',
        icon: '📝'
      },
      {
        id: '2', 
        name: 'Social Media Engagement',
        description: 'Build community and engage with your audience on social platforms',
        category: 'Social',
        difficulty: 'Easy',
        icon: '📱'
      },
      {
        id: '3',
        name: 'Email Marketing',
        description: 'Nurture leads and customers through targeted email campaigns',
        category: 'Email',
        difficulty: 'Medium',
        icon: '📧'
      }
    ];

    // For demo, set first strategy as current if no tasks exist
    if (tasks.length === 0) {
      setCurrentStrategy(strategies[0]);
    }
  };

  const toggleTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const { error } = await supabase
        .from('tasks')
        .update({ 
          completed: !task.completed,
          completed_at: !task.completed ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      setTasks(tasks.map(t => 
        t.id === taskId 
          ? { ...t, completed: !t.completed }
          : t
      ));

      // Update streak and task counter if completing a task
      if (!task.completed) {
        await updateDailyStreak();
        toast({
          title: "Great job! 🎉",
          description: "Task completed! Keep up the momentum!",
        });
      } else {
        // If uncompleting a task, decrement the counter
        if (profile) {
          const totalTasks = Math.max(0, (profile.total_tasks_completed || 0) - 1);
          const { error } = await supabase
            .from('profiles')
            .update({ total_tasks_completed: totalTasks })
            .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
          
          if (!error) {
            setProfile({ 
              ...profile, 
              total_tasks_completed: totalTasks
            });
          }
        }
      }

    } catch (error) {
      console.error('Error toggling task:', error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateDailyStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !profile) return;

      const today = new Date().toISOString().split('T')[0];
      const lastActivityDate = profile.last_activity_date;
      
      // Only update streak if this is the first task completed today
      if (lastActivityDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        // If last activity was yesterday, increment streak. Otherwise reset to 1.
        const newStreak = lastActivityDate === yesterdayStr ? profile.current_streak + 1 : 1;
        const totalTasks = (profile.total_tasks_completed || 0) + 1;
        
        const { error } = await supabase
          .from('profiles')
          .update({ 
            current_streak: newStreak,
            last_activity_date: today,
            total_tasks_completed: totalTasks
          })
          .eq('user_id', user.id);

        if (error) throw error;

        setProfile({ 
          ...profile, 
          current_streak: newStreak,
          last_activity_date: today,
          total_tasks_completed: totalTasks
        });
      } else {
        // Just increment total tasks if already active today
        const totalTasks = (profile.total_tasks_completed || 0) + 1;
        
        const { error } = await supabase
          .from('profiles')
          .update({ total_tasks_completed: totalTasks })
          .eq('user_id', user.id);

        if (error) throw error;

        setProfile({ 
          ...profile, 
          total_tasks_completed: totalTasks
        });
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const handleGenerateTasksClick = () => {
    // Check if strategy configuration questions are answered
    if (!profile?.strategy_config || Object.keys(profile.strategy_config).length === 0) {
      toast({
        title: "Strategy Configuration Required",
        description: "Please answer the strategy questions first to generate personalized tasks.",
        variant: "destructive"
      });
      setShowStrategyConfig(true);
      return;
    }
    generateWeeklyPlan();
  };

  const generateWeeklyPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke('generate-weekly-plan', {
        body: { 
          userId: user.id,
          selectedStrategy: currentStrategy,
          weekStartDate: currentWeekStart,
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Weekly Plan Generated! 🚀",
          description: `Generated ${data.tasksGenerated} new tasks for this week`,
        });
        
        await loadTasks();
      }
    } catch (error) {
      console.error('Error generating weekly plan:', error);
      toast({
        title: "Error",
        description: "Failed to generate weekly plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectStrategy = (strategy: Strategy) => {
    setSelectedStrategyForConfig(strategy);
    setShowStrategyPicker(false);
    setShowStrategyConfig(true);
  };

  const handleStrategyConfigComplete = async (strategy: Strategy, configuration: any) => {
    setCurrentStrategy(strategy);
    setShowStrategyConfig(false);
    setSelectedStrategyForConfig(null);
    
    // Update user profile with selected strategy
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ selected_strategy_id: strategy.id })
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error updating strategy:', error);
    }
    
    toast({
      title: "Strategy Configured! 🎯",
      description: `Now focusing on ${strategy.name} with your custom preferences`,
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newOffset = direction === 'next' ? currentWeekOffset + 1 : currentWeekOffset - 1;
    setCurrentWeekOffset(newOffset);
  };

  const addTask = async () => {
    if (!newTaskTitle.trim() || !profile) return;

    try {
      const weekStart = getWeekStartDate(currentWeekOffset);
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: newTaskTitle.trim(),
          description: newTaskDescription.trim() || 'Custom task',
          week_start_date: weekStart.toISOString().split('T')[0],
          user_id: profile.user_id,
          completed: false
        })
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [...prev, data]);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setShowAddTask(false);
      
      toast({
        title: "Task Added! ✅",
        description: "Your custom task has been added to this week's plan.",
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(t => t.id !== taskId));
      
      toast({
        title: "Task Deleted! 🗑️",
        description: "Task has been removed from your plan.",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateAIContent = async (task: any) => {
    if (!isPremiumUser) {
      toast({
        title: "Premium Feature 🌟",
        description: "AI Content Generator is available for premium users. Upgrade to generate complete, ready-to-use content!",
        variant: "default"
      });
      return;
    }

    setSelectedTaskForContent(task);
    setIsGeneratingContent(true);
    setShowContentGenerator(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-task-content', {
        body: {
          task: {
            title: task.title,
            description: task.description
          },
          strategy: currentStrategy?.name,
          websiteAnalysis: profile?.website_analysis,
          productName: profile?.product_name,
          targetAudience: profile?.target_audience,
          businessGoals: profile?.business_goals
        }
      });

      if (error) throw error;

      setGeneratedContent(data.content || 'Content generated successfully!');
      toast({
        title: "Content Generated! ✨",
        description: "Your AI-powered content is ready to use.",
      });
    } catch (error) {
      console.error('Error generating content:', error);
      // Fallback content generation
      const fallbackContent = generateFallbackContent(task);
      setGeneratedContent(fallbackContent);
      toast({
        title: "Content Generated! ✨",
        description: "Here's your personalized content template.",
      });
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const generateFallbackContent = (task: any) => {
    const productName = profile?.product_name || '[YOUR PRODUCT NAME]';
    const targetAudience = profile?.target_audience || '[YOUR TARGET AUDIENCE]';
    
    if (task.title.toLowerCase().includes('twitter') || task.title.toLowerCase().includes('social')) {
      return `🧵 TWITTER THREAD TEMPLATE:

1/ Problem: ${targetAudience} struggle with [SPECIFIC PROBLEM]

2/ Solution: ${productName} helps by [KEY BENEFIT]

3/ How it works:
   • [FEATURE 1]
   • [FEATURE 2] 
   • [FEATURE 3]

4/ Real results: "[CUSTOMER TESTIMONIAL OR METRIC]"

5/ Ready to try? [CALL TO ACTION]

---
📝 CUSTOMIZATION NOTES:
• Replace bracketed placeholders with your specific details
• Add relevant hashtags for your industry
• Include a compelling visual or GIF
• Post during peak engagement hours (9-10am, 7-9pm)`;
    }
    
    if (task.title.toLowerCase().includes('email') || task.title.toLowerCase().includes('newsletter')) {
      return `📧 EMAIL TEMPLATE:

Subject: [COMPELLING SUBJECT LINE]

Hi [FIRST NAME],

[OPENING HOOK - Reference recent event or pain point]

I wanted to share something that could help with [SPECIFIC CHALLENGE].

${productName} was designed specifically for ${targetAudience} who [DESCRIBE SITUATION].

Here's what makes it different:
• [UNIQUE BENEFIT 1]
• [UNIQUE BENEFIT 2]
• [UNIQUE BENEFIT 3]

[SOCIAL PROOF OR CASE STUDY]

Ready to [DESIRED ACTION]?

[CLEAR CALL TO ACTION BUTTON]

Best regards,
[YOUR NAME]

---
📝 CUSTOMIZATION NOTES:
• Personalize the opening based on subscriber segments
• A/B test different subject lines
• Include relevant visuals or screenshots
• Track open rates and click-through rates`;
    }
    
    if (task.title.toLowerCase().includes('blog') || task.title.toLowerCase().includes('content')) {
      return `📝 BLOG POST OUTLINE:

# [COMPELLING HEADLINE]

## Introduction
- Hook: [ATTENTION-GRABBING STATISTIC OR QUESTION]
- Problem: What ${targetAudience} are struggling with
- Promise: What they'll learn from this post

## Main Content
### Section 1: [MAIN POINT 1]
- Explanation
- Example or case study
- How ${productName} addresses this

### Section 2: [MAIN POINT 2]
- Explanation  
- Example or case study
- Actionable tip

### Section 3: [MAIN POINT 3]
- Explanation
- Example or case study
- Common mistake to avoid

## Conclusion
- Recap key points
- Call to action
- Next steps for readers

---
📝 CUSTOMIZATION NOTES:
• Research trending keywords in your niche
• Include internal links to related content
• Add relevant images and screenshots
• Optimize for SEO with meta description
• Share across social media channels`;
    }
    
    return `📋 TASK STRATEGY:

## Objective
${task.title}

## Context
${task.description}

## Step-by-Step Approach:
1. [PREPARATION STEP]
2. [EXECUTION STEP 1]
3. [EXECUTION STEP 2]
4. [REVIEW AND OPTIMIZE]

## Success Metrics:
• [METRIC 1]
• [METRIC 2]
• [METRIC 3]

## Tips for ${productName}:
• Highlight [KEY FEATURE]
• Focus on ${targetAudience} needs
• Emphasize [UNIQUE VALUE PROPOSITION]

---
📝 CUSTOMIZATION NOTES:
• Adapt timeline based on your schedule
• Track results for future optimization
• Document what works best for your audience`;
  };

  const regenerateTask = async (taskId: string) => {
    if (!currentStrategy || !profile) return;

    try {
      // Use the same comprehensive context as weekly task generation
      const { data, error } = await supabase.functions.invoke('generate-weekly-plan', {
        body: {
          strategy: currentStrategy.name,
          strategyDescription: currentStrategy.description,
          websiteAnalysis: profile.website_analysis,
          productName: profile.product_name,
          businessGoals: profile.business_goals,
          targetAudience: profile.target_audience,
          existingTasks: tasks.map(t => ({ title: t.title, description: t.description })),
          regenerateMode: true, // Flag to indicate we want just one new task
          taskCount: 1
        }
      });

      if (error) throw error;

      // Extract the first task from the generated plan
      const newTask = data.tasks && data.tasks.length > 0 ? data.tasks[0] : null;
      
      if (newTask) {
        const { error: updateError } = await supabase
          .from('tasks')
          .update({
            title: newTask.title,
            description: newTask.description
          })
          .eq('id', taskId);

        if (updateError) throw updateError;

        setTasks(prev => prev.map(t => 
          t.id === taskId 
            ? { ...t, title: newTask.title, description: newTask.description }
            : t
        ));
        
        toast({
          title: "Task Refreshed! 🔄",
          description: "AI generated a new task based on your website and strategy.",
        });
      } else {
        throw new Error('No task generated');
      }
    } catch (error) {
      console.error('Error regenerating task:', error);
      
      // Enhanced fallback with website context
      let websiteContext = '';
      try {
        websiteContext = profile.website_analysis ? 
          JSON.parse(profile.website_analysis).businessOverview || '' : '';
      } catch (parseError) {
        console.error('Error parsing website analysis:', parseError);
      }
      
      const contextualTasks = {
        'social-media': [
          { 
            title: `Create social media post about ${profile.product_name || 'your product'}`, 
            description: `Design and publish a post highlighting key benefits of ${profile.product_name || 'your product'} for ${profile.target_audience || 'your target audience'}` 
          },
          { 
            title: 'Share customer success story', 
            description: `Create a post featuring how ${profile.product_name || 'your product'} helped solve a real customer problem` 
          },
          { 
            title: 'Behind-the-scenes content', 
            description: `Share your development journey or company culture to build authentic connections with ${profile.target_audience || 'your audience'}` 
          }
        ],
        'email-marketing': [
          { 
            title: `Newsletter about ${profile.product_name || 'product'} updates`, 
            description: `Write valuable content about recent improvements or features for ${profile.target_audience || 'your subscribers'}` 
          },
          { 
            title: 'Segment email list by engagement', 
            description: `Organize subscribers based on their interaction with ${profile.product_name || 'your product'} content` 
          },
          { 
            title: 'A/B test email subject lines', 
            description: `Test different approaches to improve open rates for ${profile.target_audience || 'your audience'}` 
          }
        ],
        'content-marketing': [
          { 
            title: `Write blog post about ${profile.product_name || 'your product'} benefits`, 
            description: `Create educational content showing how ${profile.product_name || 'your solution'} solves problems for ${profile.target_audience || 'your target market'}` 
          },
          { 
            title: `Create how-to guide for ${profile.target_audience || 'your users'}`, 
            description: `Develop a step-by-step guide that helps ${profile.target_audience || 'your audience'} achieve their goals using ${profile.product_name || 'your product'}` 
          },
          { 
            title: 'Repurpose existing content', 
            description: `Transform your best-performing content about ${profile.product_name || 'your product'} into different formats (video, infographic, social posts)` 
          }
        ]
      };
      
      const strategyTasks = contextualTasks[currentStrategy.id as keyof typeof contextualTasks] || contextualTasks['content-marketing'];
      const randomTask = strategyTasks[Math.floor(Math.random() * strategyTasks.length)];
      
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, title: randomTask.title, description: randomTask.description }
          : t
      ));
      
      toast({
        title: "Task Refreshed! 🔄",
        description: "Generated a personalized task based on your profile and strategy.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your marketing dashboard...</p>
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const greeting = getTimeBasedGreeting();
  const motivationalMessageObj = getMotivationalMessage(new Date().getDay(), progressPercentage, completedTasks, totalTasks, profile?.current_streak || 0);
  const motivationalMessage = `${motivationalMessageObj.encouragement} ${motivationalMessageObj.actionCall}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {greeting}, {profile?.product_name || 'Marketer'}! 👋
              </h1>
              <p className="text-muted-foreground mt-1">{motivationalMessage}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span className="text-2xl font-bold">{profile?.current_streak || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold">{profile?.total_tasks_completed || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Tasks Done</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Quick Actions */}
        <Card className="mb-6 border-2 border-black">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Quick Actions
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2 text-xs bg-white border-2 border-black"
                  onClick={handleGenerateTasksClick}
                  disabled={!currentStrategy}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Tasks</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2 text-xs bg-white border-2 border-black"
                  onClick={() => window.location.href = '/website-analysis'}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Analysis</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2 text-xs bg-white border-2 border-black"
                  onClick={() => setShowStrategyPicker(true)}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Strategies</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2 text-xs bg-white border-2 border-black"
                  onClick={() => setShowAddTask(true)}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Task</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2 text-xs bg-white border-2 border-black"
                  onClick={() => window.location.href = '/profile'}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Strategy */}
        <Card className="mb-6 border-2 border-black">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  This Week's Focus
                </CardTitle>
                <CardDescription>
                  Your selected marketing strategy for maximum impact
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowStrategyPicker(true)}
              >
                Change Strategy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {currentStrategy ? (
              <div>
                <h3 className="font-semibold text-lg">{currentStrategy.name}</h3>
                <p className="text-muted-foreground">{currentStrategy.description}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{currentStrategy.category}</Badge>
                  <Badge variant="outline">{currentStrategy.difficulty}</Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Choose Your Strategy</h3>
                <p className="text-muted-foreground mb-4">
                  Select a marketing strategy to focus on this week
                </p>
                <Button onClick={() => setShowStrategyPicker(true)}>
                  Pick Strategy
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* This Week's Tasks */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Week {getWeekNumber(currentWeekOffset)} Tasks
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigateWeek('prev')}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigateWeek('next')}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {formatWeekRange(currentWeekStart)} • {completedTasks} of {totalTasks} tasks completed
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={progressPercentage} className="w-24" />
                <span className="text-sm font-medium">{Math.round(progressPercentage)}%</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="mt-0.5"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    <div className="flex-1">
                      <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </h4>
                      <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                        {task.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-purple-100"
                        onClick={() => generateAIContent(task)}
                        title="Generate AI content"
                      >
                        <Sparkles className="h-4 w-4 text-purple-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-blue-100"
                        onClick={() => regenerateTask(task.id)}
                        title="Refresh task with AI"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-100"
                        onClick={() => deleteTask(task.id)}
                        title="Delete task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No Tasks Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Generate your weekly marketing tasks to get started
                </p>
                <Button onClick={generateWeeklyPlan} disabled={!currentStrategy}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate This Week's Tasks
                </Button>
              </div>
            )}
          </CardContent>
        </Card>


      </div>

      {/* Strategy Picker Dialog */}
      <Dialog open={showStrategyPicker} onOpenChange={setShowStrategyPicker}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Choose Your Marketing Strategy</DialogTitle>
          </DialogHeader>
          <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid gap-4">
              {MARKETING_STRATEGIES.map((strategy) => (
                <Card 
                  key={strategy.id} 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => selectStrategy(strategy)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">{strategy.name}</h3>
                        <p className="text-sm text-muted-foreground">{strategy.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">{strategy.category}</Badge>
                          <Badge variant="outline">{strategy.difficulty}</Badge>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Task Modal */}
      <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Custom Task</DialogTitle>
            <DialogDescription>
              Add a custom marketing task to your weekly plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Task Title</label>
              <Input
                placeholder="e.g., Write blog post about product features"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (Optional)</label>
              <Textarea
                placeholder="Add more details about this task..."
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddTask(false);
                setNewTaskTitle('');
                setNewTaskDescription('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={addTask}
              disabled={!newTaskTitle.trim()}
            >
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Strategy Configuration Modal */}
      <StrategyConfigurationModal
        open={showStrategyConfig}
        onOpenChange={(open) => {
          setShowStrategyConfig(open);
          setSelectedStrategyForConfig(null);
        }}
        strategy={selectedStrategyForConfig}
        onComplete={handleStrategyConfigComplete}
      />

      {/* AI Content Generator Modal */}
      <Dialog open={showContentGenerator} onOpenChange={setShowContentGenerator}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Content Generator {!isPremiumUser && "🌟"}
            </DialogTitle>
            <DialogDescription>
              {isPremiumUser 
                ? "Generate complete, ready-to-use content for your marketing task."
                : "Premium feature: Get complete, ready-to-use content instead of just frameworks."
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedTaskForContent && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">{selectedTaskForContent.title}</h4>
                <p className="text-sm text-gray-600">{selectedTaskForContent.description}</p>
              </div>
              
              {isGeneratingContent ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="ml-3">Generating personalized content...</span>
                </div>
              ) : generatedContent ? (
                <div className="space-y-4">
                  <div className="bg-white border-2 border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-purple-800">Generated Content</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(generatedContent)}
                      >
                        Copy to Clipboard
                      </Button>
                    </div>
                    <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded border max-h-96 overflow-y-auto">
                      {generatedContent}
                    </pre>
                  </div>
                  
                  {!isPremiumUser && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-purple-600 text-white rounded-full p-2">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-purple-800">Upgrade to Premium</h4>
                          <p className="text-sm text-purple-600">Get AI-generated content for all your marketing tasks</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span>Complete blog posts & articles</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span>Ready-to-use email campaigns</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span>Social media content & threads</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span>Personalized marketing strategies</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                        Upgrade to Premium - $29/month
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 mx-auto text-purple-400 mb-4" />
                  <p className="text-gray-600">Click generate to create personalized content for this task.</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContentGenerator(false)}>
              Close
            </Button>
            {!isGeneratingContent && !generatedContent && selectedTaskForContent && (
              <Button 
                onClick={() => generateAIContent(selectedTaskForContent)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Content
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
