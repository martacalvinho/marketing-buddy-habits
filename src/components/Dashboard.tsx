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
import { 
  Calendar, 
  Check, 
  Star, 
  Users, 
  PlayCircle, 
  Clock, 
  Target, 
  Globe, 
  TrendingUp, 
  Plus, 
  BarChart3, 
  Zap, 
  Award, 
  ChevronRight, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Flame, 
  Trophy, 
  Lock, 
  BookOpen 
} from "lucide-react";
import { updatePlatformStreak, calculateDailyStreak, getPlatformStreaks, type PlatformStreak as PlatformStreakType } from "@/utils/streakManager";
import { getMotivationalMessage, getTimeBasedGreeting, getStreakMessage } from "@/utils/motivationalMessages";
import TaskStartModal from "./TaskStartModal";
import StartedTasksView from "./StartedTasksView";
import EnhancedStrategyLibrary, { type Strategy } from "./EnhancedStrategyLibrary";
import MonthCalendarView from "./MonthCalendarView";

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
  const [platformStreaks, setPlatformStreaks] = useState<PlatformStreakType[]>([]);
  const [dailyStreak, setDailyStreak] = useState<number>(0);
  const [motivationalMessage, setMotivationalMessage] = useState<any>(null);
  const [selectedTaskForStart, setSelectedTaskForStart] = useState<Task | null>(null);
  const [isTaskStartModalOpen, setIsTaskStartModalOpen] = useState(false);
  const [showStartedTasks, setShowStartedTasks] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [lockedStrategy, setLockedStrategy] = useState<Strategy | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'strategies' | 'calendar'>('dashboard');
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    // Get the start of the current week (Monday)
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(today.setDate(diff));
    return weekStart.toISOString().split('T')[0];
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleTaskCompleted = () => {
    loadUserData();
  };

  const handleTaskStarted = (taskId: string) => {
    loadUserData();
    setShowStartedTasks(true);
  };

  const handleTaskWorkflowCompleted = () => {
    loadUserData();
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // Load tasks when profile is loaded
  useEffect(() => {
    if (profile) {
      loadTasks();
    }
  }, [profile]);

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

      // Load current week's tasks 
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];

      let tasksQuery = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStartStr)
        .order('created_at');



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
      const streaksData = await getPlatformStreaks(user.id);
      setPlatformStreaks(streaksData);

      // Calculate daily streak
      const currentDailyStreak = await calculateDailyStreak(user.id);
      setDailyStreak(currentDailyStreak);

      // Generate motivational message
      const completedTasks = (tasksData || []).filter(task => task.completed).length;
      const totalTasks = (tasksData || []).length;
      const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      const dayOfWeek = new Date().getDay();
      
      const message = getMotivationalMessage(
        dayOfWeek,
        progressPercentage,
        completedTasks,
        totalTasks,
        currentDailyStreak
      );
      setMotivationalMessage(message);

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

  const loadTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStartStr)
        .order('created_at');

      setTasks(tasksData || []);

    } catch (error) {
      console.error('Error loading tasks:', error);
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

      // Update platform streak tracking
      if (profile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Update platform streak for this category
          await updatePlatformStreak(user.id, task.category);
          
          // Recalculate daily streak and refresh data
          const newDailyStreak = await calculateDailyStreak(user.id);
          setDailyStreak(newDailyStreak);
          
          // Refresh platform streaks
          const updatedStreaks = await getPlatformStreaks(user.id);
          setPlatformStreaks(updatedStreaks);
          
          // Update motivational message with new progress
          const updatedTasks = tasks.map(t => 
            t.id === taskId 
              ? { ...t, completed: !t.completed }
              : t
          );
          const completedCount = updatedTasks.filter(t => t.completed).length;
          const totalCount = updatedTasks.length;
          const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
          
          const message = getMotivationalMessage(
            new Date().getDay(),
            progressPercentage,
            completedCount,
            totalCount,
            newDailyStreak
          );
          setMotivationalMessage(message);
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

  // Strategy handlers
  const handleStrategySelect = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    generateWeeklyPlan(strategy);
  };

  const handleStrategyLock = (strategyId: string) => {
    if (strategyId === '') {
      setLockedStrategy(null);
    } else {
      // Find strategy by ID from the strategies data
      // For now, we'll handle this when we have the strategy data available
      const strategy = selectedStrategy; // Temporary - should find by ID
      setLockedStrategy(strategy);
    }
  };

  const generateWeeklyPlan = async (strategy?: Strategy, weekStartDate?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const targetWeekStart = weekStartDate || currentWeekStart;
      
      const { data, error } = await supabase.functions.invoke('generate-weekly-plan', {
        body: { 
          userId: user.id,
          selectedStrategy: strategy || lockedStrategy,
          weekStartDate: targetWeekStart,
        }
      });

      if (error) throw error;

      if (data.success) {
        const weekDate = new Date(targetWeekStart).toLocaleDateString();
        toast({
          title: "Weekly Plan Generated! ",
          description: `Generated ${data.tasksGenerated} new tasks for week of ${weekDate}`,
        });
        
        // Reload tasks to show the new ones
        loadTasks();
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

  const handleWeekChange = (weekStartDate: string) => {
    setCurrentWeekStart(weekStartDate);
  };

  const handleGenerateWeeklyPlanForWeek = (weekStartDate: string) => {
    generateWeeklyPlan(lockedStrategy, weekStartDate);
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
              {lockedStrategy && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  <Lock className="w-3 h-3 mr-1" />
                  {lockedStrategy.name}
                </Badge>
              )}
              <div className="flex items-center gap-2">
                <Button 
                  variant={currentView === 'dashboard' ? 'default' : 'outline'}
                  onClick={() => setCurrentView('dashboard')}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button 
                  variant={currentView === 'strategies' ? 'default' : 'outline'}
                  onClick={() => setCurrentView('strategies')}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Strategy Library
                </Button>
                <Button 
                  variant={currentView === 'calendar' ? 'default' : 'outline'}
                  onClick={() => setCurrentView('calendar')}
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Month View
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {currentView === 'strategies' ? (
          <EnhancedStrategyLibrary
            onStrategySelect={handleStrategySelect}
            onStrategyLock={handleStrategyLock}
            selectedStrategy={selectedStrategy}
            lockedStrategy={lockedStrategy}
          />
        ) : currentView === 'calendar' ? (
          <MonthCalendarView
            tasks={tasks}
            onTaskToggle={toggleTask}
            onGenerateWeeklyPlan={handleGenerateWeeklyPlanForWeek}
            currentWeekStart={currentWeekStart}
            onWeekChange={handleWeekChange}
          />
        ) : (
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



            {/* Tasks */}
            <Card className="border shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                      This Week's Tasks
                      <Badge variant="outline" className="font-medium">
                        {completedTasks}/{tasks.length} completed
                      </Badge>
                    </CardTitle>
                    <CardDescription className="font-medium mt-1">
                      Tailored marketing tasks for your {profile.product_type}
                    </CardDescription>
                  </div>
                  <Button
                    variant={showStartedTasks ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowStartedTasks(!showStartedTasks)}
                    className="flex items-center gap-2"
                  >
                    <PlayCircle className="h-4 w-4" />
                    {showStartedTasks ? "Hide" : "Show"} Started Tasks
                  </Button>
                </div>
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
                          onClick={() => {
                            setSelectedTaskForStart(task);
                            setIsTaskStartModalOpen(true);
                          }}
                          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                        >
                          <PlayCircle className="mr-2 h-4 w-4" />
                          START TASK
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
                          onClick={() => {
                            setSelectedTaskForStart(task);
                            setIsTaskStartModalOpen(true);
                          }}
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
                          onClick={() => {
                            setSelectedTaskForStart(task);
                            setIsTaskStartModalOpen(true);
                          }}
                        >
                          High Priority
                        </Button>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Started Tasks View */}
            {showStartedTasks && (
              <StartedTasksView onTaskCompleted={handleTaskWorkflowCompleted} />
            )}
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
                  onClick={() => generateWeeklyPlan()}
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
                <Button variant="outline" className="w-full justify-start font-medium" asChild>
                  <a href="/website-analysis">
                    <Search className="w-4 h-4 mr-2" />
                    Website Analysis
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
        )}
      </div>

      {/* Task Start Modal */}
      <TaskStartModal
        task={selectedTaskForStart}
        isOpen={isTaskStartModalOpen}
        onClose={() => {
          setIsTaskStartModalOpen(false);
          setSelectedTaskForStart(null);
        }}
        onTaskStarted={handleTaskStarted}
      />
    </div>
  );
}