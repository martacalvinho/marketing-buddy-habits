import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ChevronLeft, ChevronRight, CalendarDays, List, Target, Clock } from "lucide-react";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isSameDay, isToday } from "date-fns";

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  estimated_time: string;
  completed: boolean;
  completed_at: string | null;
  week_start_date: string;
  assigned_date?: string; // New field for calendar assignment
}

interface WeeklyPlanNavigatorProps {
  tasks: Task[];
  onTasksUpdate: (tasks: Task[]) => void;
  onGenerateWeeklyPlan: (weekStart: string) => void;
}

export default function WeeklyPlanNavigator({ tasks, onTasksUpdate, onGenerateWeeklyPlan }: WeeklyPlanNavigatorProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');
  
  // Get tasks for current week
  const currentWeekTasks = tasks.filter(task => task.week_start_date === weekStartStr);
  
  // Get days of the current week
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };
  
  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };
  
  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };
  
  const getTasksForDay = (date: Date) => {
    return currentWeekTasks.filter(task => {
      if (task.assigned_date) {
        return isSameDay(new Date(task.assigned_date), date);
      }
      // If no assigned date, distribute tasks evenly across weekdays
      const weekdayTasks = currentWeekTasks.filter(t => !t.assigned_date);
      const taskIndex = weekdayTasks.findIndex(t => t.id === task.id);
      const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1; // Convert to Monday=0 format
      return taskIndex % 5 === dayIndex && dayIndex < 5; // Only weekdays
    });
  };
  
  const getCompletionStats = () => {
    const completed = currentWeekTasks.filter(task => task.completed).length;
    const total = currentWeekTasks.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };
  
  const stats = getCompletionStats();
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Weekly Marketing Plan
            </CardTitle>
            <CardDescription>
              Week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={stats.percentage >= 80 ? "default" : stats.percentage >= 50 ? "secondary" : "destructive"}>
              {stats.completed}/{stats.total} completed ({stats.percentage}%)
            </Badge>
          </div>
        </div>
        
        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
              This Week
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'week' | 'month')}>
              <TabsList>
                <TabsTrigger value="week" className="flex items-center gap-1">
                  <List className="h-4 w-4" />
                  Week
                </TabsTrigger>
                <TabsTrigger value="month" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Calendar
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button 
              onClick={() => onGenerateWeeklyPlan(weekStartStr)}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              Generate Plan
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'week' | 'month')}>
          <TabsContent value="week" className="space-y-4">
            {/* Week List View */}
            {currentWeekTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No tasks for this week</h3>
                <p className="mb-4">Generate a weekly plan to get started with your marketing goals.</p>
                <Button onClick={() => onGenerateWeeklyPlan(weekStartStr)}>
                  Generate Weekly Plan
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {currentWeekTasks.map((task) => (
                  <Card key={task.id} className={`border-l-4 ${
                    task.completed 
                      ? 'border-l-green-500 bg-green-50' 
                      : task.priority === 'high' 
                        ? 'border-l-red-500' 
                        : task.priority === 'medium'
                          ? 'border-l-yellow-500'
                          : 'border-l-blue-500'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {task.category}
                            </Badge>
                            <Badge variant="secondary" className="text-xs flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {task.estimated_time}
                            </Badge>
                            <Badge 
                              variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                        {task.completed && (
                          <Badge variant="default" className="bg-green-500">
                            ✓ Completed
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="month" className="space-y-4">
            {/* Calendar View */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {weekDays.map((day) => {
                const dayTasks = getTasksForDay(day);
                const completedTasks = dayTasks.filter(task => task.completed).length;
                
                return (
                  <Card 
                    key={day.toISOString()} 
                    className={`min-h-[120px] p-2 ${
                      isToday(day) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                  >
                    <div className="text-sm font-medium mb-2">
                      {format(day, 'd')}
                      {isToday(day) && (
                        <Badge variant="default" className="ml-1 text-xs">Today</Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div 
                          key={task.id}
                          className={`text-xs p-1 rounded border-l-2 ${
                            task.completed 
                              ? 'bg-green-100 border-l-green-500 line-through' 
                              : task.priority === 'high'
                                ? 'bg-red-100 border-l-red-500'
                                : 'bg-blue-100 border-l-blue-500'
                          }`}
                        >
                          {task.title.length > 20 ? task.title.substring(0, 20) + '...' : task.title}
                        </div>
                      ))}
                      
                      {dayTasks.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                      
                      {dayTasks.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {completedTasks}/{dayTasks.length} done
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
            
            {currentWeekTasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No tasks scheduled</h3>
                <p className="mb-4">Generate a weekly plan to see your tasks in the calendar.</p>
                <Button onClick={() => onGenerateWeeklyPlan(weekStartStr)}>
                  Generate Weekly Plan
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
