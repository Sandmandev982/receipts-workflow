
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Plus, X, Save } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WeeklyOutcome } from '@/components/tasks/types';
import { ProductivityService } from '@/services/ProductivityService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, startOfWeek } from 'date-fns';

interface WeeklyOutcomesProps {}

const WeeklyOutcomes: React.FC<WeeklyOutcomesProps> = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [outcome, setOutcome] = useState<Partial<WeeklyOutcome>>({
    work_goals: [],
    work_steps: [],
    education_goals: [],
    education_steps: [],
    health_goals: [],
    health_steps: [],
    reflection: ''
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('work');
  const [goalInput, setGoalInput] = useState('');
  const [stepInput, setStepInput] = useState('');
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Load weekly outcome for the selected week
  useEffect(() => {
    const loadWeeklyOutcome = async () => {
      if (!user) return;
      
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      
      setLoading(true);
      try {
        const result = await ProductivityService.getWeeklyOutcome(user.id, weekStart);
        
        if (result) {
          setOutcome({
            id: result.id,
            week_start_date: result.week_start_date,
            work_goals: result.work_goals,
            work_steps: result.work_steps,
            education_goals: result.education_goals,
            education_steps: result.education_steps,
            health_goals: result.health_goals,
            health_steps: result.health_steps,
            reflection: result.reflection
          });
        } else {
          // Reset form for new entry
          setOutcome({
            work_goals: [],
            work_steps: [],
            education_goals: [],
            education_steps: [],
            health_goals: [],
            health_steps: [],
            reflection: ''
          });
        }
      } catch (error) {
        console.error('Error loading weekly outcome:', error);
        toast({
          title: "Error",
          description: "Failed to load weekly outcome data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadWeeklyOutcome();
  }, [user, selectedDate, toast]);
  
  const handleAddGoal = () => {
    if (goalInput.trim()) {
      setOutcome(prev => {
        const key = `${activeTab}_goals` as keyof WeeklyOutcome;
        const currentGoals = prev[key] as string[] || [];
        return {
          ...prev,
          [key]: [...currentGoals, goalInput.trim()]
        };
      });
      setGoalInput('');
    }
  };
  
  const handleRemoveGoal = (index: number) => {
    setOutcome(prev => {
      const key = `${activeTab}_goals` as keyof WeeklyOutcome;
      const currentGoals = prev[key] as string[] || [];
      return {
        ...prev,
        [key]: currentGoals.filter((_, i) => i !== index)
      };
    });
  };
  
  const handleAddStep = () => {
    if (stepInput.trim()) {
      setOutcome(prev => {
        const key = `${activeTab}_steps` as keyof WeeklyOutcome;
        const currentSteps = prev[key] as string[] || [];
        return {
          ...prev,
          [key]: [...currentSteps, stepInput.trim()]
        };
      });
      setStepInput('');
    }
  };
  
  const handleRemoveStep = (index: number) => {
    setOutcome(prev => {
      const key = `${activeTab}_steps` as keyof WeeklyOutcome;
      const currentSteps = prev[key] as string[] || [];
      return {
        ...prev,
        [key]: currentSteps.filter((_, i) => i !== index)
      };
    });
  };
  
  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save your weekly outcomes.",
        variant: "destructive"
      });
      return;
    }
    
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    
    setLoading(true);
    try {
      const result = await ProductivityService.saveWeeklyOutcome(user.id, {
        ...outcome as WeeklyOutcome,
        week_start_date: weekStart
      });
      
      if (result) {
        toast({
          title: "Weekly Outcomes Saved",
          description: "Your weekly outcomes have been saved successfully."
        });
        
        setOutcome({
          id: result.id,
          week_start_date: result.week_start_date,
          work_goals: result.work_goals,
          work_steps: result.work_steps,
          education_goals: result.education_goals,
          education_steps: result.education_steps,
          health_goals: result.health_goals,
          health_steps: result.health_steps,
          reflection: result.reflection
        });
      }
    } catch (error) {
      console.error('Error saving weekly outcome:', error);
      toast({
        title: "Error",
        description: "Failed to save weekly outcomes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getGoalsForActiveTab = () => {
    const key = `${activeTab}_goals` as keyof WeeklyOutcome;
    return (outcome[key] as string[]) || [];
  };
  
  const getStepsForActiveTab = () => {
    const key = `${activeTab}_steps` as keyof WeeklyOutcome;
    return (outcome[key] as string[]) || [];
  };
  
  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Weekly Intended Outcomes</CardTitle>
            <CardDescription>Set and track your weekly goals for work, education, and health</CardDescription>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-auto pl-3 text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Week of {format(selectedDate, "MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(startOfWeek(date, { weekStartsOn: 1 }))}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="work">Work</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
          </TabsList>
          
          <TabsContent value="work" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Work Goals for the Week</h3>
              <div className="flex space-x-2">
                <Input 
                  placeholder="What do you want to achieve in your work this week?"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                />
                <Button size="icon" onClick={handleAddGoal}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {getGoalsForActiveTab().map((goal, index) => (
                  <div key={index} className="flex items-center justify-between border p-2 rounded">
                    <span className="text-sm">{goal}</span>
                    <X 
                      className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" 
                      onClick={() => handleRemoveGoal(index)}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Steps to Achieve Work Goals</h3>
              <div className="flex space-x-2">
                <Input 
                  placeholder="What steps will you take to achieve these goals?"
                  value={stepInput}
                  onChange={(e) => setStepInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
                />
                <Button size="icon" onClick={handleAddStep}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {getStepsForActiveTab().map((step, index) => (
                  <div key={index} className="flex items-center justify-between border p-2 rounded">
                    <span className="text-sm">{step}</span>
                    <X 
                      className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" 
                      onClick={() => handleRemoveStep(index)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="education" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Education Goals for the Week</h3>
              <div className="flex space-x-2">
                <Input 
                  placeholder="What do you want to learn this week?"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                />
                <Button size="icon" onClick={handleAddGoal}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {getGoalsForActiveTab().map((goal, index) => (
                  <div key={index} className="flex items-center justify-between border p-2 rounded">
                    <span className="text-sm">{goal}</span>
                    <X 
                      className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" 
                      onClick={() => handleRemoveGoal(index)}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Steps to Achieve Education Goals</h3>
              <div className="flex space-x-2">
                <Input 
                  placeholder="What steps will you take to learn these things?"
                  value={stepInput}
                  onChange={(e) => setStepInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
                />
                <Button size="icon" onClick={handleAddStep}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {getStepsForActiveTab().map((step, index) => (
                  <div key={index} className="flex items-center justify-between border p-2 rounded">
                    <span className="text-sm">{step}</span>
                    <X 
                      className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" 
                      onClick={() => handleRemoveStep(index)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="health" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Health Goals for the Week</h3>
              <div className="flex space-x-2">
                <Input 
                  placeholder="What are your health goals this week?"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                />
                <Button size="icon" onClick={handleAddGoal}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {getGoalsForActiveTab().map((goal, index) => (
                  <div key={index} className="flex items-center justify-between border p-2 rounded">
                    <span className="text-sm">{goal}</span>
                    <X 
                      className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" 
                      onClick={() => handleRemoveGoal(index)}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Steps to Achieve Health Goals</h3>
              <div className="flex space-x-2">
                <Input 
                  placeholder="What steps will you take for better health?"
                  value={stepInput}
                  onChange={(e) => setStepInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
                />
                <Button size="icon" onClick={handleAddStep}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {getStepsForActiveTab().map((step, index) => (
                  <div key={index} className="flex items-center justify-between border p-2 rounded">
                    <span className="text-sm">{step}</span>
                    <X 
                      className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" 
                      onClick={() => handleRemoveStep(index)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Weekly Reflection */}
        <div className="space-y-2 pt-4">
          <Label htmlFor="weekly-reflection">Weekly Reflection</Label>
          <Textarea
            id="weekly-reflection"
            placeholder="Reflect on your progress, challenges, and learnings for the week"
            value={outcome.reflection || ''}
            onChange={(e) => setOutcome(prev => ({ ...prev, reflection: e.target.value }))}
            rows={4}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="w-full"
        >
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Saving...' : 'Save Weekly Outcomes'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WeeklyOutcomes;
