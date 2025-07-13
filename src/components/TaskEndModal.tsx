import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Clock, CheckCircle, BarChart3, Target, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Task {
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

interface TaskEndModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskCompleted: (taskId: string) => void;
}

interface MetricInput {
  name: string;
  value: string;
  unit: string;
}

export default function TaskEndModal({ task, isOpen, onClose, onTaskCompleted }: TaskEndModalProps) {
  const [notes, setNotes] = useState("");
  const [actualTimeMinutes, setActualTimeMinutes] = useState<number>(0);
  const [metrics, setMetrics] = useState<MetricInput[]>([
    { name: "Followers Gained", value: "", unit: "followers" },
    { name: "Engagement Rate", value: "", unit: "%" },
    { name: "Conversions", value: "", unit: "conversions" },
    { name: "Traffic Generated", value: "", unit: "visits" }
  ]);
  const [isCompleting, setIsCompleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (task?.started_at) {
      const startTime = new Date(task.started_at);
      const currentTime = new Date();
      const diffMinutes = Math.round((currentTime.getTime() - startTime.getTime()) / (1000 * 60));
      setActualTimeMinutes(Math.max(1, diffMinutes));
    }
  }, [task]);

  const addCustomMetric = () => {
    setMetrics([...metrics, { name: "", value: "", unit: "" }]);
  };

  const updateMetric = (index: number, field: keyof MetricInput, value: string) => {
    const updatedMetrics = [...metrics];
    updatedMetrics[index][field] = value;
    setMetrics(updatedMetrics);
  };

  const removeMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };

  const completeTask = async () => {
    if (!task) return;

    setIsCompleting(true);
    try {
      // Filter out empty metrics
      const validMetrics = metrics.filter(m => m.name.trim() && m.value.trim());
      const metricsData = validMetrics.reduce((acc, metric) => {
        acc[metric.name] = {
          value: metric.value,
          unit: metric.unit
        };
        return acc;
      }, {} as Record<string, { value: string; unit: string }>);

      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed: true,
          ended_at: new Date().toISOString(),
          actual_time_minutes: actualTimeMinutes,
          task_results: notes ? { notes } : null,
          metrics_tracked: Object.keys(metricsData).length > 0 ? metricsData : null
        })
        .eq('id', task.id);

      if (error) throw error;

      toast({
        title: "Task Completed! 🎉",
        description: `Great job completing "${task.title}". Your progress has been tracked.`,
      });

      onTaskCompleted(task.id);
      onClose();
      resetModal();
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const resetModal = () => {
    setNotes("");
    setActualTimeMinutes(0);
    setMetrics([
      { name: "Followers Gained", value: "", unit: "followers" },
      { name: "Engagement Rate", value: "", unit: "%" },
      { name: "Conversions", value: "", unit: "conversions" },
      { name: "Traffic Generated", value: "", unit: "visits" }
    ]);
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  if (!task) return null;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const estimatedMinutes = parseInt(task.estimated_time?.replace(/\D/g, '') || '30');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Complete Task: {task.title}
          </DialogTitle>
          <DialogDescription>
            Record your results and track the time spent on this task.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Task Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-500">Category</Label>
                  <Badge variant="secondary" className="mt-1">{task.category}</Badge>
                </div>
                <div>
                  <Label className="text-gray-500">Priority</Label>
                  <Badge variant="outline" className="mt-1">{task.priority}</Badge>
                </div>
                <div>
                  <Label className="text-gray-500">Estimated Time</Label>
                  <p className="font-medium">{task.estimated_time}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Started At</Label>
                  <p className="font-medium">
                    {task.started_at ? new Date(task.started_at).toLocaleTimeString() : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Time Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-sm text-gray-500">Estimated Time</Label>
                    <p className="font-medium">{formatTime(estimatedMinutes)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Actual Time</Label>
                    <p className="font-medium text-blue-600">{formatTime(actualTimeMinutes)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Difference</Label>
                    <p className={`font-medium ${actualTimeMinutes <= estimatedMinutes ? 'text-green-600' : 'text-orange-600'}`}>
                      {actualTimeMinutes <= estimatedMinutes ? '-' : '+'}{Math.abs(actualTimeMinutes - estimatedMinutes)}m
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="actual-time">Adjust Actual Time (minutes)</Label>
                  <Input
                    id="actual-time"
                    type="number"
                    value={actualTimeMinutes}
                    onChange={(e) => setActualTimeMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    className="mt-1"
                    min="1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results & Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Results & Notes
              </CardTitle>
              <CardDescription>
                What did you accomplish? Any insights or learnings?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Describe what you accomplished, any challenges faced, insights gained, or next steps..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* Metrics Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Track Metrics
              </CardTitle>
              <CardDescription>
                Record any measurable outcomes from this task
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.map((metric, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label className="text-sm">Metric Name</Label>
                      <Input
                        placeholder="e.g., Followers Gained"
                        value={metric.name}
                        onChange={(e) => updateMetric(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="w-24">
                      <Label className="text-sm">Value</Label>
                      <Input
                        placeholder="0"
                        value={metric.value}
                        onChange={(e) => updateMetric(index, 'value', e.target.value)}
                      />
                    </div>
                    <div className="w-20">
                      <Label className="text-sm">Unit</Label>
                      <Input
                        placeholder="unit"
                        value={metric.unit}
                        onChange={(e) => updateMetric(index, 'unit', e.target.value)}
                      />
                    </div>
                    {metrics.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeMetric(index)}
                        className="mb-0"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addCustomMetric}
                  className="w-full"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Add Custom Metric
                </Button>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={completeTask}
              disabled={isCompleting}
              className="flex-1"
            >
              {isCompleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing Task...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Task
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
