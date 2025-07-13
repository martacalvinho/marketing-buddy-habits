import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Square, Timer, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import TaskEndModal from "./TaskEndModal";

interface StartedTask {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  estimated_time: string;
  started_at?: string;
  suggested_approach?: string;
  accepted_approach?: boolean;
}

interface StartedTasksViewProps {
  onTaskCompleted: () => void;
}

export default function StartedTasksView({ onTaskCompleted }: StartedTasksViewProps) {
  const [startedTasks, setStartedTasks] = useState<StartedTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<StartedTask | null>(null);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStartedTasks();
  }, []);

  const loadStartedTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, description, category, priority, estimated_time, started_at, suggested_approach, accepted_approach')
        .eq('user_id', user.id)
        .eq('status', 'started')
        .order('started_at', { ascending: false });

      if (error) throw error;
      setStartedTasks(data || []);
    } catch (error) {
      console.error('Error loading started tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndTask = (task: StartedTask) => {
    setSelectedTask(task);
    setIsEndModalOpen(true);
  };

  const handleTaskCompleted = () => {
    loadStartedTasks();
    onTaskCompleted();
  };

  const formatTimeElapsed = (startedAt: string) => {
    const start = new Date(startedAt);
    const now = new Date();
    const diffMinutes = Math.round((now.getTime() - start.getTime()) / (1000 * 60));
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-blue-600" />
            Started Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (startedTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-blue-600" />
            Started Tasks
          </CardTitle>
          <CardDescription>
            Tasks you've started will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Timer className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tasks in progress</p>
            <p className="text-sm">Start a task to see it here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-blue-600" />
            Started Tasks ({startedTasks.length})
          </CardTitle>
          <CardDescription>
            Tasks currently in progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {startedTasks.map((task) => (
              <Card key={task.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{task.title}</h4>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge variant="secondary">{task.category}</Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Started: {new Date(task.started_at).toLocaleTimeString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Timer className="h-4 w-4" />
                          Elapsed: {formatTimeElapsed(task.started_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          Est: {task.estimated_time}
                        </div>
                      </div>

                      {task.suggested_approach && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-blue-800">
                              {task.accepted_approach ? 'Using AI Approach' : 'Custom Approach'}
                            </span>
                          </div>
                          <p className="text-sm text-blue-700 line-clamp-2">
                            {task.suggested_approach.substring(0, 150)}...
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => handleEndTask(task)}
                      variant="outline"
                      size="sm"
                      className="ml-4 flex-shrink-0"
                    >
                      <Square className="mr-2 h-4 w-4" />
                      End Task
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <TaskEndModal
        task={selectedTask}
        isOpen={isEndModalOpen}
        onClose={() => {
          setIsEndModalOpen(false);
          setSelectedTask(null);
        }}
        onTaskCompleted={handleTaskCompleted}
      />
    </>
  );
}
