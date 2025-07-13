import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lightbulb, Clock, Target, CheckCircle, XCircle, Edit3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  estimated_time: string;
  status?: string;
  suggested_approach?: string;
}

interface TaskStartModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskStarted: (taskId: string) => void;
}

export default function TaskStartModal({ task, isOpen, onClose, onTaskStarted }: TaskStartModalProps) {
  const [isGeneratingApproach, setIsGeneratingApproach] = useState(false);
  const [suggestedApproach, setSuggestedApproach] = useState<string>("");
  const [userApproach, setUserApproach] = useState<string>("");
  const [showUserInput, setShowUserInput] = useState(false);
  const [isStartingTask, setIsStartingTask] = useState(false);
  const { toast } = useToast();

  const generateApproach = async () => {
    if (!task) return;

    setIsGeneratingApproach(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('generate-task-approach', {
        body: { taskId: task.id },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate approach');
      }

      if (response.data?.success) {
        setSuggestedApproach(response.data.suggestedApproach);
        toast({
          title: "AI Approach Generated! 🤖",
          description: "Review the suggested approach and decide if you want to use it.",
        });
      } else {
        throw new Error(response.data?.error || 'Failed to generate approach');
      }
    } catch (error) {
      console.error('Error generating approach:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI approach. You can still start the task manually.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingApproach(false);
    }
  };

  const startTask = async (acceptedAI: boolean) => {
    if (!task) return;

    setIsStartingTask(true);
    try {
      const approach = acceptedAI ? suggestedApproach : userApproach;
      
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'started',
          started_at: new Date().toISOString(),
          suggested_approach: suggestedApproach || null,
          accepted_approach: acceptedAI,
          user_approach: approach
        })
        .eq('id', task.id);

      if (error) throw error;

      toast({
        title: "Task Started! 🚀",
        description: `"${task.title}" is now in progress. Good luck!`,
      });

      onTaskStarted(task.id);
      onClose();
      resetModal();
    } catch (error) {
      console.error('Error starting task:', error);
      toast({
        title: "Error",
        description: "Failed to start task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsStartingTask(false);
    }
  };

  const resetModal = () => {
    setSuggestedApproach("");
    setUserApproach("");
    setShowUserInput(false);
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  if (!task) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Start Task: {task.title}
          </DialogTitle>
          <DialogDescription>
            Get AI-powered suggestions or define your own approach to complete this task effectively.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Details */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Task Details</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {task.estimated_time}
                  </Badge>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                  <Badge variant="secondary">{task.category}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{task.description}</p>
            </CardContent>
          </Card>

          {/* AI Approach Generation */}
          {!suggestedApproach && !showUserInput && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Get AI Suggestions
                </CardTitle>
                <CardDescription>
                  Let our AI analyze your task and website to suggest the best approach.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button 
                    onClick={generateApproach} 
                    disabled={isGeneratingApproach}
                    className="flex-1"
                  >
                    {isGeneratingApproach ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Approach...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="mr-2 h-4 w-4" />
                        Generate AI Approach
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUserInput(true)}
                    className="flex-1"
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Write My Own
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Generated Approach */}
          {suggestedApproach && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Lightbulb className="h-5 w-5" />
                  AI Suggested Approach
                </CardTitle>
                <CardDescription className="text-blue-600">
                  Based on your website analysis and task details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-lg border border-blue-200 mb-4 max-h-96 overflow-y-auto">
                  <div className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                    {suggestedApproach}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => startTask(true)}
                    disabled={isStartingTask}
                    className="flex-1"
                  >
                    {isStartingTask ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Accept & Start Task
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUserInput(true)}
                    className="flex-1"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Use My Own Approach
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Input Approach */}
          {showUserInput && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Edit3 className="h-5 w-5" />
                  Your Approach
                </CardTitle>
                <CardDescription className="text-green-600">
                  Describe how you plan to complete this task
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Describe your approach to completing this task..."
                  value={userApproach}
                  onChange={(e) => setUserApproach(e.target.value)}
                  className="min-h-[120px] mb-4 bg-white border-green-200"
                />
                <div className="flex gap-3">
                  <Button 
                    onClick={() => startTask(false)}
                    disabled={!userApproach.trim() || isStartingTask}
                    className="flex-1"
                  >
                    {isStartingTask ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Start Task
                  </Button>
                  {suggestedApproach && (
                    <Button 
                      variant="outline" 
                      onClick={() => setShowUserInput(false)}
                      className="flex-1"
                    >
                      Back to AI Suggestion
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
