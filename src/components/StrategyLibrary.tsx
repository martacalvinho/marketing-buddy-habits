import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STRATEGY_SUMMARIES } from "@/data/strategies";

export default function StrategyLibrary() {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  const strategies = Object.entries(STRATEGY_SUMMARIES);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Strategy Library</h1>
              <p className="text-muted-foreground">
                Proven marketing strategies with actionable guides
              </p>
            </div>
            <Button variant="outline" asChild>
              <a href="/dashboard">Back to Dashboard</a>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategies.map(([key, strategy]) => (
            <Card key={key} className="bg-gradient-card border-0 shadow-soft hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-4 h-4 rounded-full ${strategy.color}`}></div>
                  <CardTitle className="text-lg">{strategy.title}</CardTitle>
                </div>
                <CardDescription>{strategy.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Sample Tasks:</h4>
                    <ul className="space-y-1">
                      {strategy.tasks.slice(0, 3).map((task, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                          <div className="w-1 h-1 bg-primary rounded-full"></div>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="hero" className="w-full">
                        View Full Guide
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${strategy.color}`}></div>
                          {strategy.title}
                        </DialogTitle>
                        <DialogDescription>
                          {strategy.description}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="tasks">Action Items</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="overview" className="mt-6">
                          <div className="prose prose-sm max-w-none">
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                              {strategy.content}
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="tasks" className="mt-6">
                          <div className="space-y-3">
                            <h4 className="font-medium">Recommended Tasks for This Week:</h4>
                            {strategy.tasks.map((task, index) => (
                              <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-medium mt-0.5">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm">{task}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}