import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Check, Star, Users } from "lucide-react";

// Mock data - would come from Supabase in real app
const MOCK_USER = {
  name: "Alex",
  productType: "SaaS",
  goal: "Get 100 signups",
  streak: 7,
  tasksThisWeek: 12,
  completedThisWeek: 8
};

const MOCK_TASKS = [
  {
    id: 1,
    title: "Write 3 SEO-optimized blog posts",
    category: "SEO",
    completed: false,
    priority: "high",
    estimatedTime: "2 hours"
  },
  {
    id: 2,
    title: "Submit to 5 SaaS directories",
    category: "Directories",
    completed: true,
    priority: "medium",
    estimatedTime: "1 hour"
  },
  {
    id: 3,
    title: "Send 20 cold emails to potential customers",
    category: "Cold Email",
    completed: false,
    priority: "high",
    estimatedTime: "45 minutes"
  },
  {
    id: 4,
    title: "Post 2 LinkedIn articles about your niche",
    category: "LinkedIn",
    completed: false,
    priority: "medium",
    estimatedTime: "1.5 hours"
  },
  {
    id: 5,
    title: "Create 5 TikTok videos showcasing product",
    category: "TikTok",
    completed: true,
    priority: "low",
    estimatedTime: "3 hours"
  }
];

const STRATEGIES = [
  {
    id: "seo",
    name: "SEO Strategy",
    description: "Long-term, compounding growth through organic traffic",
    color: "bg-blue-500"
  },
  {
    id: "social_video",
    name: "Social Video",
    description: "Virality and awareness through short-form video",
    color: "bg-pink-500"
  },
  {
    id: "cold_email",
    name: "Cold Email",
    description: "Direct outbound lead generation",
    color: "bg-green-500"
  },
  {
    id: "directories",
    name: "Directories",
    description: "Credibility and discoverability",
    color: "bg-purple-500"
  }
];

export default function Dashboard() {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  const toggleTask = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const weekProgress = (MOCK_USER.completedThisWeek / MOCK_USER.tasksThisWeek) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-xl">
                <span className="text-lg font-bold text-primary-foreground">MB</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Good morning, {MOCK_USER.name}! 👋</h1>
                <p className="text-sm text-muted-foreground">
                  {MOCK_USER.streak} day streak • {MOCK_USER.goal}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Week View
              </Button>
              <Button variant="hero" size="sm" asChild>
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
              <Card className="bg-gradient-card border-0 shadow-soft">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse-glow"></div>
                    Current Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{MOCK_USER.streak} days</div>
                  <p className="text-sm text-muted-foreground">Keep it going!</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0 shadow-soft">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Week Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{MOCK_USER.completedThisWeek}/{MOCK_USER.tasksThisWeek}</div>
                  <Progress value={weekProgress} className="mt-2" />
                  <p className="text-sm text-muted-foreground mt-1">{Math.round(weekProgress)}% complete</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0 shadow-soft">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Today's Focus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tasks.filter(t => !t.completed).length}</div>
                  <p className="text-sm text-muted-foreground">tasks remaining</p>
                </CardContent>
              </Card>
            </div>

            {/* Tasks */}
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  This Week's Tasks
                  <Badge variant="secondary">{completedTasks}/{tasks.length} completed</Badge>
                </CardTitle>
                <CardDescription>
                  Tailored marketing tasks for your {MOCK_USER.productType}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="high">High Priority</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-4 mt-6">
                    {tasks.map((task) => (
                      <div 
                        key={task.id}
                        className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-soft transition-all duration-200"
                      >
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => toggleTask(task.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </h4>
                            <Badge 
                              variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {task.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-primary rounded-full"></span>
                              {task.category}
                            </span>
                            <span>{task.estimatedTime}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          View Guide
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
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="hero" className="w-full justify-start" asChild>
                  <a href="/experiments">
                    <Star className="w-4 h-4 mr-2" />
                    Start Experiment
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Check className="w-4 h-4 mr-2" />
                  Weekly Recap
                </Button>
              </CardContent>
            </Card>

            {/* Active Strategies */}
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Active Strategies</CardTitle>
                <CardDescription>
                  Based on your {MOCK_USER.productType} and goals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {STRATEGIES.map((strategy) => (
                  <div 
                    key={strategy.id}
                    className="p-3 rounded-lg border bg-card hover:shadow-soft transition-all duration-200 cursor-pointer"
                    onClick={() => setSelectedStrategy(strategy.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${strategy.color}`}></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{strategy.name}</h4>
                        <p className="text-xs text-muted-foreground">{strategy.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Weekly Streak */}
            <Card className="bg-gradient-success border-0 shadow-soft text-success-foreground">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-2 h-2 bg-success-foreground rounded-full"></div>
                  Amazing Progress!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm opacity-90">
                  You've completed {MOCK_USER.completedThisWeek} tasks this week. 
                  You're building a solid marketing habit! 🚀
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}