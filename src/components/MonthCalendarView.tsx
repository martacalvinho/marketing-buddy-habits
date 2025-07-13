import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Plus, 
  CheckCircle, 
  Clock,
  Target,
  TrendingUp
} from "lucide-react";

interface DashboardTask {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  estimated_time: string;
  completed: boolean;
  completed_at: string | null;
  week_start_date: string;
  status?: string;
  timing?: string;
  results?: string;
  metrics?: string;
  approach?: string;
  user_id?: string;
}

interface MonthCalendarViewProps {
  tasks: DashboardTask[];
  onTaskToggle: (taskId: string) => void;
  onGenerateWeeklyPlan: (weekStartDate: string) => void;
  currentWeekStart: string;
  onWeekChange: (weekStartDate: string) => void;
}

export default function MonthCalendarView({ 
  tasks, 
  onTaskToggle, 
  onGenerateWeeklyPlan,
  currentWeekStart,
  onWeekChange
}: MonthCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedWeekStart, setSelectedWeekStart] = useState(currentWeekStart);
  const { toast } = useToast();

  // Get the start of the current week (Monday)
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  // Get the start of the month
  const getMonthStart = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  // Get the end of the month
  const getMonthEnd = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const monthStart = getMonthStart(currentDate);
    const monthEnd = getMonthEnd(currentDate);
    const startDate = getWeekStart(monthStart);
    
    const days = [];
    const currentDay = new Date(startDate);
    
    // Generate 6 weeks (42 days) to ensure full month coverage
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  // Get tasks for a specific date
  const getTasksForDate = (date: Date): DashboardTask[] => {
    const dateStr = date.toISOString().split('T')[0];
    const weekStart = getWeekStart(date);
    const weekStartStr = weekStart.toISOString().split('T')[0];
    
    return tasks.filter(task => {
      const taskWeekStart = new Date(task.week_start_date).toISOString().split('T')[0];
      return taskWeekStart === weekStartStr;
    });
  };

  // Check if a date is in the current week
  const isCurrentWeek = (date: Date): boolean => {
    const weekStart = getWeekStart(date);
    const weekStartStr = weekStart.toISOString().split('T')[0];
    return weekStartStr === selectedWeekStart;
  };

  // Check if a date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if a date is in the current month
  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const currentWeek = new Date(selectedWeekStart);
    currentWeek.setDate(currentWeek.getDate() - 7);
    const newWeekStart = currentWeek.toISOString().split('T')[0];
    setSelectedWeekStart(newWeekStart);
    onWeekChange(newWeekStart);
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const currentWeek = new Date(selectedWeekStart);
    currentWeek.setDate(currentWeek.getDate() + 7);
    const newWeekStart = currentWeek.toISOString().split('T')[0];
    setSelectedWeekStart(newWeekStart);
    onWeekChange(newWeekStart);
  };

  // Select a week by clicking on a date
  const selectWeek = (date: Date) => {
    const weekStart = getWeekStart(date);
    const weekStartStr = weekStart.toISOString().split('T')[0];
    setSelectedWeekStart(weekStartStr);
    onWeekChange(weekStartStr);
  };

  // Generate weekly plan for selected week
  const handleGenerateWeeklyPlan = () => {
    onGenerateWeeklyPlan(selectedWeekStart);
    toast({
      title: "Generating Weekly Plan",
      description: `Creating tasks for week of ${new Date(selectedWeekStart).toLocaleDateString()}`,
    });
  };

  // Format week range for display
  const getWeekRangeText = (weekStartStr: string): string => {
    const weekStart = new Date(weekStartStr);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    return `${startMonth} - ${endMonth}`;
  };

  const calendarDays = generateCalendarDays();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekRangeText = getWeekRangeText(selectedWeekStart);

  return (
    <div className="space-y-6">
      {/* Header with Month Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                {monthName}
              </CardTitle>
              <CardDescription>
                Current Week: {weekRangeText}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Week Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Week
              </Button>
              <div className="text-center">
                <div className="font-semibold">Selected Week</div>
                <div className="text-sm text-muted-foreground">{weekRangeText}</div>
              </div>
              <Button variant="outline" size="sm" onClick={goToNextWeek}>
                Next Week
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <Button onClick={handleGenerateWeeklyPlan} className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Generate Plan for This Week
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center font-semibold text-sm text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, index) => {
              const dayTasks = getTasksForDate(date);
              const completedTasks = dayTasks.filter(t => t.completed).length;
              const isCurrentWeekDay = isCurrentWeek(date);
              const isTodayDate = isToday(date);
              const isCurrentMonthDate = isCurrentMonth(date);

              return (
                <div
                  key={index}
                  className={`
                    min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md
                    ${isCurrentWeekDay ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500' : 'bg-background'}
                    ${isTodayDate ? 'bg-green-50 border-green-300' : ''}
                    ${!isCurrentMonthDate ? 'opacity-40' : ''}
                  `}
                  onClick={() => selectWeek(date)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isTodayDate ? 'text-green-700' : ''}`}>
                      {date.getDate()}
                    </span>
                    {isTodayDate && (
                      <Badge variant="secondary" className="text-xs">Today</Badge>
                    )}
                  </div>

                  {/* Task indicators */}
                  {dayTasks.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>{dayTasks.length} tasks</span>
                      </div>
                      {completedTasks > 0 && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          <span>{completedTasks} done</span>
                        </div>
                      )}
                      
                      {/* Show first few task titles */}
                      {dayTasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          className={`text-xs p-1 rounded truncate ${
                            task.completed 
                              ? 'bg-green-100 text-green-700 line-through' 
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {task.title}
                        </div>
                      ))}
                      
                      {dayTasks.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayTasks.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Week Tasks Summary */}
      {tasks.filter(task => {
        const taskWeekStart = new Date(task.week_start_date).toISOString().split('T')[0];
        return taskWeekStart === selectedWeekStart;
      }).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Tasks for Week of {weekRangeText}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks
                .filter(task => {
                  const taskWeekStart = new Date(task.week_start_date).toISOString().split('T')[0];
                  return taskWeekStart === selectedWeekStart;
                })
                .map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 border rounded-lg ${
                      task.completed ? 'bg-green-50 border-green-200' : 'bg-background'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => onTaskToggle(task.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <h4 className={`font-medium text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {task.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {task.estimated_time}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
