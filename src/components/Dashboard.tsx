import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Check, Star, Users, PlayCircle, Clock, Target, Globe, TrendingUp } from "lucide-react";
import WebsiteAnalysisStorage from "@/components/WebsiteAnalysisStorage";

interface Profile {
  id: string;
  user_id: string;
  product_name: string;
  product_type: string;
  goal: string;
  platforms: string[];
  current_streak: number;
  last_activity_date: string;
  website_analysis: any;
}

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  estimated_time: string;
  completed: boolean;
  completed_at: string | null;
  user_approach: string | null;
  result_notes: string | null;
  ai_suggestion: string | null;
  week_start_date: string;
  website_analysis_id: string | null;
}

interface WebsiteAnalysis {
  id: string;
  website_url: string;
  analysis_data: any;
  created_at: string;
}

interface WeeklyStat {
  platform: string;
  posts_count: number;
  target_count: number;
}

interface PlatformStreak {
  id: string;
  platform: string;
  current_streak: number;
  best_streak: number;
  last_activity_date: string;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);
  const [platformStreaks, setPlatformStreaks] = useState<PlatformStreak[]>([]);
  const [websiteAnalyses, setWebsiteAnalyses] = useState<WebsiteAnalysis[]>([]);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskApproach, setTaskApproach] = useState("");
  const [taskResult, setTaskResult] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  // Reload tasks when website selection changes
  useEffect(() => {
    if (profile) {
      loadTasksForWebsite();
    }
  }, [selectedWebsiteId]);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!profileData) {
        navigate("/onboarding");
        return;
      }

      setProfile(profileData);

      // Load website analyses
      const { data: analysesData } = await supabase
        .from('website_analyses')
        .select('id, website_url, analysis_data, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const websiteAnalyses = analysesData || [];
      setWebsiteAnalyses(websiteAnalyses);

      // Set default selected website to the first one if available
      if (websiteAnalyses.length > 0 && !selectedWebsiteId) {
        setSelectedWebsiteId(websiteAnalyses[0].id);
      }

      // Load current week's tasks (filtered by selected website if available)
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];

      let tasksQuery = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStartStr)
        .order('created_at');

      // Filter by selected website if one is selected
      if (selectedWebsiteId) {
        tasksQuery = tasksQuery.eq('website_analysis_id', selectedWebsiteId);
      }

      const { data: tasksData } = await tasksQuery;
      setTasks(tasksData || []);

      // Load weekly stats
      const { data: statsData } = await supabase
        .from('weekly_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStartStr);

      setWeeklyStats(statsData || []);

      // Load platform streaks
      const { data: streaksData } = await supabase
        .from('platform_streaks')
        .select('*')
        .eq('user_id', user.id);

      setPlatformStreaks(streaksData || []);

    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTasksForWebsite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];

      let tasksQuery = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStartStr)
        .order('created_at');

      // Filter by selected website if one is selected
      if (selectedWebsiteId) {
        tasksQuery = tasksQuery.eq('website_analysis_id', selectedWebsiteId);
      }

      const { data: tasksData } = await tasksQuery;
      setTasks(tasksData || []);

    } catch (error) {
      console.error('Error loading tasks for website:', error);
    }
  };

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          completed: !task.completed,
          completed_at: !task.completed ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(t => 
        t.id === taskId 
          ? { 
              ...t, 
              completed: !t.completed,
              completed_at: !t.completed ? new Date().toISOString() : null
            }
          : t
      ));

      // Update streak if completing a task
      if (!task.completed && profile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Update platform streak
          await updatePlatformStreak(task.category, user.id);
          
          // Update overall streak
          const today = new Date().toISOString().split('T')[0];
          const lastActivity = new Date(profile.last_activity_date);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          let newStreak = profile.current_streak;
          
          if (profile.last_activity_date !== today) {
            // Check if last activity was yesterday (consecutive streak)
            if (lastActivity.toDateString() === yesterday.toDateString()) {
              // Consecutive day - increment streak
              newStreak = profile.current_streak + 1;
            } else if (lastActivity.toDateString() !== new Date().toDateString()) {
              // Not consecutive - reset to 1
              newStreak = 1;
            }
            
            await supabase
              .from('profiles')
              .update({
                current_streak: newStreak,
                last_activity_date: today
              })
              .eq('user_id', profile.user_id);

            setProfile({ ...profile, current_streak: newStreak, last_activity_date: today });
          }
        }
      }

      toast({
        title: task.completed ? "Task unmarked" : "Task completed! ",
        description: task.completed ? "Task marked as incomplete" : "Great job! Keep up the streak!",
      });

    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const generateWeeklyPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke('generate-weekly-plan', {
        body: { 
          userId: user.id,
          websiteAnalysisId: selectedWebsiteId 
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Weekly Plan Generated! ",
          description: `Generated ${data.tasksGenerated} new tasks for next week`,
        });
        
        // Reload tasks to show the new ones
        loadTasksForWebsite();
      }
    } catch (error) {
      console.error('Error generating weekly plan:', error);
      toast({
        title: "Error",
        description: "Failed to generate weekly plan",
        variant: "destructive",
      });
    }
  };

  // Get dynamic dashboard message based on day and progress
  const getDynamicMessage = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = dayNames[dayOfWeek];
    
    const weekProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
    
    // Day-specific messages
    if (dayOfWeek === 1) { // Monday
      return "Happy Monday! Let's start the week strong. ";
    } else if (dayOfWeek === 5) { // Friday
      return "It's Friday! Let's finish the week with a win. ";
    } else if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
      return "Weekend vibes! Perfect time for strategic planning. ";
    }
    
    // Progress-based messages
    if (weekProgress >= 80) {
      return `Amazing! You're ${weekProgress}% done with this week's tasks. `;
    } else if (weekProgress >= 50) {
      return `Great progress! You're ${weekProgress}% through the week. Keep going! `;
    } else if (weekProgress >= 20) {
      return `You're ${weekProgress}% done this week. Building momentum! `;
    }
    
    return `${currentDay} energy! Time to tackle those marketing tasks. `;
  };

  // Update platform streak when completing tasks
  const updatePlatformStreak = async (taskCategory: string, userId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if platform streak exists
      let { data: existingStreak } = await supabase
        .from('platform_streaks')
        .select('*')
        .eq('user_id', userId)
        .eq('platform', taskCategory)
        .single();

      if (existingStreak) {
        // Check if last activity was yesterday (consecutive streak)
        const lastActivity = new Date(existingStreak.last_activity_date);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        let newStreak = existingStreak.current_streak;
        if (existingStreak.last_activity_date !== today) {
          if (lastActivity.toDateString() === yesterday.toDateString()) {
            // Consecutive day - increment streak
            newStreak = existingStreak.current_streak + 1;
          } else {
            // Gap in streak - reset to 1
            newStreak = 1;
          }

          await supabase
            .from('platform_streaks')
            .update({
              current_streak: newStreak,
              best_streak: Math.max(newStreak, existingStreak.best_streak),
              last_activity_date: today
            })
            .eq('id', existingStreak.id);
        }
      } else {
        // Create new platform streak
        await supabase
          .from('platform_streaks')
          .insert({
            user_id: userId,
            platform: taskCategory,
            current_streak: 1,
            best_streak: 1,
            last_activity_date: today
          });
      }

      // Reload platform streaks
      const { data: updatedStreaks } = await supabase
        .from('platform_streaks')
        .select('*')
        .eq('user_id', userId);

      setPlatformStreaks(updatedStreaks || []);

    } catch (error) {
      console.error('Error updating platform streak:', error);
    }
  };

  const saveTaskDetails = async () => {
    if (!selectedTask) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          user_approach: taskApproach,
          result_notes: taskResult
        })
        .eq('id', selectedTask.id);

      if (error) throw error;

      setTasks(tasks.map(t => 
        t.id === selectedTask.id 
          ? { ...t, user_approach: taskApproach, result_notes: taskResult }
          : t
      ));

      setSelectedTask(null);
      setTaskApproach("");
      setTaskResult("");

      toast({
        title: "Task details saved!",
        description: "Your approach and results have been recorded",
      });

    } catch (error) {
      console.error('Error saving task details:', error);
      toast({
        title: "Error",
        description: "Failed to save task details",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-2xl font-black uppercase">LOADING...</div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const completedTasks = tasks.filter(t => t.completed).length;
  const weekProgress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
  const pendingTasks = tasks.filter(t => !t.completed);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-xl shadow-lg">
                <span className="text-lg font-bold text-foreground">MB</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{getDynamicMessage()}</h1>
                <p className="text-sm text-foreground font-medium">
                  {profile.current_streak} day streak • {profile.goal}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="font-medium">
                <Calendar className="w-4 h-4 mr-2" />
                Week View
              </Button>
              <Button variant="default" size="sm" asChild className="font-medium">
                <a href="/strategies">Strategy Library</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-background to-background border-2 border-foreground shadow-brutal">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                    <div className="w-2 h-2 bg-foreground rounded-full"></div>
                    CURRENT STREAK
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black">{profile.current_streak} days</div>
                  <p className="text-sm font-medium">Keep it going!</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-25 border shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold">Week Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{completedTasks}/{tasks.length}</div>
                  <Progress value={weekProgress} className="mt-3 h-2" />
                  <p className="text-sm text-muted-foreground font-medium mt-2">{Math.round(weekProgress)}% complete</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-25 border shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold">Today's Focus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{pendingTasks.length}</div>
                  <p className="text-sm text-muted-foreground font-medium">tasks remaining</p>
                </CardContent>
              </Card>
            </div>

            {/* Website Selector & Analysis Hub */}
            <Card className="border shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Website Analysis Hub
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {websiteAnalyses.length > 0 && (
                      <Select 
                        value={selectedWebsiteId || ""} 
                        onValueChange={setSelectedWebsiteId}
                      >
                        <SelectTrigger className="w-64 font-medium">
                          <SelectValue placeholder="Select Website" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="" className="font-medium">All Websites</SelectItem>
                          {websiteAnalyses.map((analysis) => (
                            <SelectItem key={analysis.id} value={analysis.id} className="font-medium">
                              {analysis.website_url}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
                <CardDescription className="font-medium">
                  {selectedWebsiteId 
                    ? `Tasks for ${websiteAnalyses.find(w => w.id === selectedWebsiteId)?.website_url || 'Selected Website'}`
                    : `Managing ${websiteAnalyses.length} website${websiteAnalyses.length !== 1 ? 's' : ''}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="analyses" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="analyses" className="font-medium">Website Analyses</TabsTrigger>
                    <TabsTrigger value="new" className="font-medium">New Analysis</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="analyses" className="mt-6">
                    {profile && (
                      <WebsiteAnalysisStorage userId={profile.user_id} />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="new" className="mt-6">
                    <div className="text-center py-8">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <div className="text-lg font-semibold mb-2">Start New Website Analysis</div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Analyze a new website to generate personalized marketing tasks
                      </p>
                      <Button variant="default" size="lg" className="font-medium">
                        <Globe className="w-4 h-4 mr-2" />
                        Analyze Website
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Tasks */}
            <Card className="border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-xl font-semibold">
                  This Week's Tasks
                  <Badge variant="outline" className="font-medium">
                    {completedTasks}/{tasks.length} completed
                  </Badge>
                </CardTitle>
                <CardDescription className="font-medium">
                  Tailored marketing tasks for your {profile.product_type}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all" className="font-medium">All</TabsTrigger>
                    <TabsTrigger value="pending" className="font-medium">Pending</TabsTrigger>
                    <TabsTrigger value="completed" className="font-medium">Completed</TabsTrigger>
                    <TabsTrigger value="high" className="font-medium">High Priority</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-4 mt-6">
                    {tasks.map((task) => (
                      <div 
                        key={task.id}
                        className="flex items-start gap-4 p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
                      >
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => toggleTask(task.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className={`font-semibold text-base ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </h4>
                            <Badge 
                              variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                              className="text-xs font-medium"
                            >
                              {task.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-primary rounded-full"></span>
                              {task.category}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.estimated_time}
                            </span>
                          </div>
                          {task.ai_suggestion && (
                            <p className="text-sm mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md font-medium">
                              💡 {task.ai_suggestion}
                            </p>
                          )}
                        </div>
                        <Button 
                          variant="default" 
                          size="sm"
                          className="font-medium"
                          onClick={() => {
                            setSelectedTask(task);
                            setTaskApproach(task.user_approach || "");
                            setTaskResult(task.result_notes || "");
                          }}
                        >
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Start Task
                        </Button>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="pending" className="space-y-4 mt-6">
                    {pendingTasks.map((task) => (
                      <div 
                        key={task.id}
                        className="flex items-start gap-4 p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
                      >
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => toggleTask(task.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-base">{task.title}</h4>
                          <p className="text-sm font-medium mt-1 text-muted-foreground">{task.description}</p>
                        </div>
                        <Button 
                          variant="default" 
                          size="sm"
                          className="font-medium"
                          onClick={() => setSelectedTask(task)}
                        >
                          Start
                        </Button>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="completed" className="space-y-4 mt-6">
                    {tasks.filter(t => t.completed).map((task) => (
                      <div 
                        key={task.id}
                        className="flex items-start gap-4 p-4 border rounded-lg bg-green-50 border-green-200"
                      >
                        <Check className="w-5 h-5 text-green-600 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-base line-through text-muted-foreground">{task.title}</h4>
                          {task.result_notes && (
                            <p className="text-sm font-medium mt-1 text-green-700">✅ {task.result_notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="high" className="space-y-4 mt-6">
                    {tasks.filter(t => t.priority === 'high').map((task) => (
                      <div 
                        key={task.id}
                        className="flex items-start gap-4 p-4 border rounded-lg bg-red-50 border-red-200"
                      >
                        <Target className="w-5 h-5 text-red-600 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-base">{task.title}</h4>
                          <p className="text-sm font-medium mt-1 text-muted-foreground">{task.description}</p>
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="font-medium"
                          onClick={() => setSelectedTask(task)}
                        >
                          High Priority
                        </Button>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="default" 
                  className="w-full justify-start font-medium"
                  onClick={generateWeeklyPlan}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Generate Weekly Plan
                </Button>
                <Button variant="outline" className="w-full justify-start font-medium" asChild>
                  <a href="/experiments">
                    <Star className="w-4 h-4 mr-2" />
                    Start Experiment
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start font-medium">
                  <Users className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start font-medium">
                  <Check className="w-4 h-4 mr-2" />
                  Weekly Recap
                </Button>
              </CardContent>
            </Card>

            {/* Platform Streaks */}
            <Card className="border shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Platform Streaks</CardTitle>
                <CardDescription className="font-medium">
                  Your consistency across marketing channels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {platformStreaks.length > 0 ? (
                  platformStreaks.map((streak) => (
                    <div 
                      key={streak.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-foreground/20 bg-background"
                    >
                      <div>
                        <span className="font-medium">{streak.platform}</span>
                        <p className="text-xs text-muted-foreground">Best: {streak.best_streak} days</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">{streak.current_streak}</div>
                        <p className="text-xs text-muted-foreground">days</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm font-medium text-center p-4 text-muted-foreground">
                    Complete tasks to start building platform streaks!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Weekly Stats */}
            <Card className="border shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">This Week's Activity</CardTitle>
                <CardDescription className="font-medium">
                  Your posting frequency
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {weeklyStats.length > 0 ? (
                  weeklyStats.map((stat) => (
                    <div 
                      key={stat.platform}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <span className="font-medium">{stat.platform}</span>
                      <Badge className="font-medium">
                        {stat.posts_count}/{stat.target_count}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm font-medium text-center p-4 text-muted-foreground">
                    Complete tasks to track your activity!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Progress Motivation */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Amazing Progress!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-green-700">
                  You've completed {completedTasks} tasks this week. 
                  You're building a solid marketing habit! 🚀
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl border shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Start Task: {selectedTask.title}
              </CardTitle>
              <CardDescription className="font-medium">
                {selectedTask.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedTask.ai_suggestion && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold mb-2">💡 AI Suggestion:</h4>
                  <p className="font-medium text-blue-900">{selectedTask.ai_suggestion}</p>
                </div>
              )}
              
              <div>
                <Label className="font-semibold">Your Approach:</Label>
                <Textarea
                  placeholder="Describe how you plan to complete this task..."
                  value={taskApproach}
                  onChange={(e) => setTaskApproach(e.target.value)}
                  className="font-medium mt-2"
                />
              </div>

              <div>
                <Label className="font-semibold">Results & Notes:</Label>
                <Textarea
                  placeholder="What were the results? What did you learn?"
                  value={taskResult}
                  onChange={(e) => setTaskResult(e.target.value)}
                  className="font-medium mt-2"
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedTask(null)}
                  className="font-medium"
                >
                  Cancel
                </Button>
                <Button 
                  variant="default" 
                  onClick={saveTaskDetails}
                  className="font-medium flex-1"
                >
                  Save Details
                </Button>
                <Button 
                  variant="default"
                  onClick={() => {
                    toggleTask(selectedTask.id);
                    saveTaskDetails();
                  }}
                  className="font-medium bg-green-600 hover:bg-green-700"
                >
                  Mark Complete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}