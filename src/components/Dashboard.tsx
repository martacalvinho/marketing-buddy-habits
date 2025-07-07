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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Check, Star, Users, PlayCircle, Clock, Target } from "lucide-react";

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
}

interface WeeklyStat {
  platform: string;
  posts_count: number;
  target_count: number;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskApproach, setTaskApproach] = useState("");
  const [taskResult, setTaskResult] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

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

      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStartStr)
        .order('created_at');

      setTasks(tasksData || []);

      // Load weekly stats
      const { data: statsData } = await supabase
        .from('weekly_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStartStr);

      setWeeklyStats(statsData || []);

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
        const today = new Date().toISOString().split('T')[0];
        if (profile.last_activity_date !== today) {
          const newStreak = profile.current_streak + 1;
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

      toast({
        title: task.completed ? "Task unmarked" : "Task completed! 🎉",
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
      <header className="border-b-4 border-foreground bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-primary border-4 border-foreground shadow-brutal-small">
                <span className="text-lg font-black text-primary-foreground">MB</span>
              </div>
              <div>
                <h1 className="text-2xl font-black uppercase">Good morning! 👋</h1>
                <p className="text-sm font-bold uppercase tracking-wide">
                  {profile.current_streak} day streak • {profile.goal}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="font-black uppercase">
                <Calendar className="w-4 h-4 mr-2" />
                Week View
              </Button>
              <Button variant="hero" size="sm" asChild className="font-black uppercase">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-primary/10 border-4 border-foreground shadow-brutal">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                    <div className="w-3 h-3 bg-success border-2 border-foreground animate-pulse"></div>
                    Current Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black">{profile.current_streak} DAYS</div>
                  <p className="text-sm font-bold uppercase">Keep it going!</p>
                </CardContent>
              </Card>

              <Card className="bg-secondary/10 border-4 border-foreground shadow-brutal">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-black uppercase">Week Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black">{completedTasks}/{tasks.length}</div>
                  <Progress value={weekProgress} className="mt-2 h-3 border-2 border-foreground" />
                  <p className="text-sm font-bold uppercase mt-1">{Math.round(weekProgress)}% complete</p>
                </CardContent>
              </Card>

              <Card className="bg-accent/10 border-4 border-foreground shadow-brutal">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-black uppercase">Today's Focus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black">{pendingTasks.length}</div>
                  <p className="text-sm font-bold uppercase">tasks remaining</p>
                </CardContent>
              </Card>
            </div>

            {/* Tasks */}
            <Card className="border-4 border-foreground shadow-brutal">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-xl font-black uppercase">
                  This Week's Tasks
                  <Badge variant="outline" className="border-2 border-foreground font-black">
                    {completedTasks}/{tasks.length} COMPLETED
                  </Badge>
                </CardTitle>
                <CardDescription className="font-bold uppercase tracking-wide">
                  Tailored marketing tasks for your {profile.product_type}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 border-2 border-foreground">
                    <TabsTrigger value="all" className="font-black uppercase">All</TabsTrigger>
                    <TabsTrigger value="pending" className="font-black uppercase">Pending</TabsTrigger>
                    <TabsTrigger value="completed" className="font-black uppercase">Completed</TabsTrigger>
                    <TabsTrigger value="high" className="font-black uppercase">High Priority</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-4 mt-6">
                    {tasks.map((task) => (
                      <div 
                        key={task.id}
                        className="flex items-start gap-4 p-4 border-4 border-foreground bg-card shadow-brutal-small hover:shadow-brutal transition-all duration-150"
                      >
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => toggleTask(task.id)}
                          className="mt-1 border-2 border-foreground"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className={`font-black text-base ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </h4>
                            <Badge 
                              variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                              className="text-xs font-black uppercase border-2 border-foreground"
                            >
                              {task.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm font-bold">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-primary border border-foreground"></span>
                              {task.category}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.estimated_time}
                            </span>
                          </div>
                          {task.ai_suggestion && (
                            <p className="text-sm mt-2 p-2 bg-muted border-2 border-foreground font-medium">
                              💡 {task.ai_suggestion}
                            </p>
                          )}
                        </div>
                        <Button 
                          variant="hero" 
                          size="sm"
                          className="font-black uppercase"
                          onClick={() => {
                            setSelectedTask(task);
                            setTaskApproach(task.user_approach || "");
                            setTaskResult(task.result_notes || "");
                          }}
                        >
                          <PlayCircle className="w-4 h-4 mr-2" />
                          START TASK
                        </Button>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="pending" className="space-y-4 mt-6">
                    {pendingTasks.map((task) => (
                      <div 
                        key={task.id}
                        className="flex items-start gap-4 p-4 border-4 border-foreground bg-card shadow-brutal-small"
                      >
                        {/* Same structure as above but filtered */}
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => toggleTask(task.id)}
                          className="mt-1 border-2 border-foreground"
                        />
                        <div className="flex-1">
                          <h4 className="font-black text-base">{task.title}</h4>
                          <p className="text-sm font-medium mt-1">{task.description}</p>
                        </div>
                        <Button 
                          variant="hero" 
                          size="sm"
                          className="font-black uppercase"
                          onClick={() => setSelectedTask(task)}
                        >
                          START
                        </Button>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="completed" className="space-y-4 mt-6">
                    {tasks.filter(t => t.completed).map((task) => (
                      <div 
                        key={task.id}
                        className="flex items-start gap-4 p-4 border-4 border-foreground bg-success/10 shadow-brutal-small"
                      >
                        <Check className="w-5 h-5 text-success mt-1" />
                        <div className="flex-1">
                          <h4 className="font-black text-base line-through">{task.title}</h4>
                          {task.result_notes && (
                            <p className="text-sm font-medium mt-1 text-success">✅ {task.result_notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="high" className="space-y-4 mt-6">
                    {tasks.filter(t => t.priority === 'high').map((task) => (
                      <div 
                        key={task.id}
                        className="flex items-start gap-4 p-4 border-4 border-destructive bg-destructive/10 shadow-brutal-small"
                      >
                        <Target className="w-5 h-5 text-destructive mt-1" />
                        <div className="flex-1">
                          <h4 className="font-black text-base">{task.title}</h4>
                          <p className="text-sm font-medium mt-1">{task.description}</p>
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="font-black uppercase"
                          onClick={() => setSelectedTask(task)}
                        >
                          HIGH PRIORITY
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
            <Card className="border-4 border-foreground shadow-brutal">
              <CardHeader>
                <CardTitle className="text-lg font-black uppercase">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="hero" className="w-full justify-start font-black uppercase" asChild>
                  <a href="/experiments">
                    <Star className="w-4 h-4 mr-2" />
                    Start Experiment
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start font-black uppercase">
                  <Users className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start font-black uppercase">
                  <Check className="w-4 h-4 mr-2" />
                  Weekly Recap
                </Button>
              </CardContent>
            </Card>

            {/* Weekly Stats */}
            <Card className="border-4 border-foreground shadow-brutal">
              <CardHeader>
                <CardTitle className="text-lg font-black uppercase">This Week's Activity</CardTitle>
                <CardDescription className="font-bold uppercase tracking-wide">
                  Your posting frequency
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {weeklyStats.length > 0 ? (
                  weeklyStats.map((stat) => (
                    <div 
                      key={stat.platform}
                      className="flex items-center justify-between p-3 border-2 border-foreground bg-background"
                    >
                      <span className="font-black uppercase">{stat.platform}</span>
                      <Badge className="font-black">
                        {stat.posts_count}/{stat.target_count}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm font-medium text-center p-4 border-2 border-foreground">
                    Complete tasks to track your activity!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Streak Motivation */}
            <Card className="bg-success/20 border-4 border-success shadow-brutal text-success-foreground">
              <CardHeader>
                <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
                  <div className="w-3 h-3 bg-success border border-foreground"></div>
                  Amazing Progress!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-bold">
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
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl border-4 border-foreground shadow-brutal-hover">
            <CardHeader>
              <CardTitle className="text-xl font-black uppercase">
                START TASK: {selectedTask.title}
              </CardTitle>
              <CardDescription className="font-bold">
                {selectedTask.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedTask.ai_suggestion && (
                <div className="p-4 bg-primary/10 border-4 border-foreground">
                  <h4 className="font-black uppercase mb-2">AI Suggestion:</h4>
                  <p className="font-medium">{selectedTask.ai_suggestion}</p>
                </div>
              )}
              
              <div>
                <Label className="font-black uppercase">Your Approach:</Label>
                <Textarea
                  placeholder="Describe how you plan to complete this task..."
                  value={taskApproach}
                  onChange={(e) => setTaskApproach(e.target.value)}
                  className="border-4 border-foreground font-medium mt-2"
                />
              </div>

              <div>
                <Label className="font-black uppercase">Results & Notes:</Label>
                <Textarea
                  placeholder="What were the results? What did you learn?"
                  value={taskResult}
                  onChange={(e) => setTaskResult(e.target.value)}
                  className="border-4 border-foreground font-medium mt-2"
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedTask(null)}
                  className="font-black uppercase"
                >
                  Cancel
                </Button>
                <Button 
                  variant="hero" 
                  onClick={saveTaskDetails}
                  className="font-black uppercase flex-1"
                >
                  Save Details
                </Button>
                <Button 
                  variant="success" 
                  onClick={() => {
                    toggleTask(selectedTask.id);
                    saveTaskDetails();
                  }}
                  className="font-black uppercase"
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