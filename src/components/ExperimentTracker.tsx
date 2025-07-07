import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Star } from "lucide-react";

// Mock data - would come from Supabase in real app
const MOCK_EXPERIMENTS = [
  {
    id: 1,
    title: "TikTok Content Sprint",
    strategy: "Social Video",
    startDate: "2024-01-01",
    endDate: "2024-01-07",
    status: "completed",
    description: "Create 5 TikTok videos showcasing different features",
    result: "Gained 200 followers, 15K views total",
    rating: 4,
    notes: "Videos with trending sounds performed better"
  },
  {
    id: 2,
    title: "Cold Email Campaign A",
    strategy: "Cold Email",
    startDate: "2024-01-08",
    endDate: "2024-01-14",
    status: "active",
    description: "Test personalized subject lines vs generic ones",
    result: "",
    rating: 0,
    notes: ""
  },
  {
    id: 3,
    title: "SEO Content Cluster",
    strategy: "SEO",
    startDate: "2023-12-15",
    endDate: "2023-12-31",
    status: "completed",
    description: "Write 5 interconnected blog posts about SaaS analytics",
    result: "Increased organic traffic by 30%",
    rating: 5,
    notes: "Excellent results, creating more clusters"
  }
];

const STRATEGY_OPTIONS = [
  "SEO",
  "Social Video",
  "Cold Email",
  "LinkedIn",
  "Twitter",
  "Email Marketing",
  "Directories",
  "Other"
];

export default function ExperimentTracker() {
  const [experiments, setExperiments] = useState(MOCK_EXPERIMENTS);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newExperiment, setNewExperiment] = useState({
    title: "",
    strategy: "",
    description: "",
    startDate: "",
    endDate: ""
  });

  const handleCreateExperiment = () => {
    const experiment = {
      id: experiments.length + 1,
      ...newExperiment,
      status: "active" as const,
      result: "",
      rating: 0,
      notes: ""
    };
    
    setExperiments([experiment, ...experiments]);
    setNewExperiment({
      title: "",
      strategy: "",
      description: "",
      startDate: "",
      endDate: ""
    });
    setIsCreateDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground";
      case "active":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const activeExperiments = experiments.filter(e => e.status === "active");
  const completedExperiments = experiments.filter(e => e.status === "completed");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Experiment Tracker</h1>
              <p className="text-muted-foreground">
                Test marketing ideas and track what works
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <a href="/dashboard">Back to Dashboard</a>
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero">
                    <Star className="w-4 h-4 mr-2" />
                    New Experiment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Experiment</DialogTitle>
                    <DialogDescription>
                      Set up a marketing experiment to test and track
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Experiment Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., TikTok Content Sprint"
                        value={newExperiment.title}
                        onChange={(e) => setNewExperiment({...newExperiment, title: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="strategy">Strategy Type</Label>
                      <Select onValueChange={(value) => setNewExperiment({...newExperiment, strategy: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select strategy" />
                        </SelectTrigger>
                        <SelectContent>
                          {STRATEGY_OPTIONS.map((strategy) => (
                            <SelectItem key={strategy} value={strategy}>
                              {strategy}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="What are you testing?"
                        value={newExperiment.description}
                        onChange={(e) => setNewExperiment({...newExperiment, description: e.target.value})}
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={newExperiment.startDate}
                          onChange={(e) => setNewExperiment({...newExperiment, startDate: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={newExperiment.endDate}
                          onChange={(e) => setNewExperiment({...newExperiment, endDate: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleCreateExperiment}
                      className="w-full"
                      variant="hero"
                      disabled={!newExperiment.title || !newExperiment.strategy}
                    >
                      Create Experiment
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="active">
              Active ({activeExperiments.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedExperiments.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-8">
            {activeExperiments.length === 0 ? (
              <Card className="bg-gradient-card border-0 shadow-soft">
                <CardContent className="text-center py-12">
                  <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No active experiments</h3>
                  <p className="text-muted-foreground mb-6">
                    Start experimenting with new marketing ideas to grow your business
                  </p>
                  <Button variant="hero" onClick={() => setIsCreateDialogOpen(true)}>
                    Create Your First Experiment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeExperiments.map((experiment) => (
                  <Card key={experiment.id} className="bg-gradient-card border-0 shadow-soft hover:shadow-glow transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getStatusColor(experiment.status)}>
                          {experiment.status}
                        </Badge>
                        <Badge variant="outline">{experiment.strategy}</Badge>
                      </div>
                      <CardTitle className="text-lg">{experiment.title}</CardTitle>
                      <CardDescription>{experiment.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {experiment.startDate} to {experiment.endDate}
                        </div>
                        <Button variant="outline" className="w-full">
                          Log Results
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedExperiments.map((experiment) => (
                <Card key={experiment.id} className="bg-gradient-card border-0 shadow-soft">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getStatusColor(experiment.status)}>
                        completed
                      </Badge>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < experiment.rating 
                                ? "fill-warning text-warning" 
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{experiment.title}</CardTitle>
                    <CardDescription>{experiment.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-1">Results:</h4>
                        <p className="text-sm text-muted-foreground">{experiment.result}</p>
                      </div>
                      {experiment.notes && (
                        <div>
                          <h4 className="font-medium text-sm mb-1">Notes:</h4>
                          <p className="text-sm text-muted-foreground">{experiment.notes}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {experiment.startDate} to {experiment.endDate}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}