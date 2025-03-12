
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Calendar as CalendarIcon, Plus, X, Save } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DailyOutcome, Task } from '@/components/tasks/types';
import { ProductivityService } from '@/services/ProductivityService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { TaskService } from '@/services/TaskService';

interface DailyOutcomesProps {}

const DailyOutcomes: React.FC<DailyOutcomesProps> = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [outcome, setOutcome] = useState<Partial<DailyOutcome>>({
    today_focus: [],
    accomplishments: [],
    performance_rating: 5,
    lessons_learned: ''
  });
  const [focusInput, setFocusInput] = useState('');
  const [accomplishmentInput, setAccomplishmentInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [yesterdayTasks, setYesterdayTasks] = useState<Task[]>([]);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Function to get yesterday's date
  const getYesterday = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
  };
  
  // Load daily outcome for the selected date
  useEffect(() => {
    const loadDailyOutcome = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const result = await ProductivityService.getDailyOutcome(user.id, selectedDate);
        
        if (result) {
          setOutcome({
            id: result.id,
            date: result.date,
            prev_day_tasks: result.prev_day_tasks,
            today_focus: result.today_focus,
            accomplishments: result.accomplishments,
            performance_rating: result.performance_rating,
            lessons_learned: result.lessons_learned
          });
        } else {
          // Reset form for new entry
          setOutcome({
            today_focus: [],
            accomplishments: [],
            performance_rating: 5,
            lessons_learned: ''
          });
        }
        
        // Load yesterday's tasks
        const yesterday = getYesterday();
        const tasks = await TaskService.fetchTasks(user.id);
        const filteredTasks = tasks.filter(task => {
          if (!task.dueDate) return false;
          const taskDate = new Date(task.dueDate);
          return taskDate.getDate() === yesterday.getDate() &&
                taskDate.getMonth() === yesterday.getMonth() &&
                taskDate.getFullYear() === yesterday.getFullYear();
        });
        
        setYesterdayTasks(filteredTasks);
      } catch (error) {
        console.error('Error loading daily outcome:', error);
        toast({
          title: "Error",
          description: "Failed to load daily outcome data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadDailyOutcome();
  }, [user, selectedDate, toast]);
  
  const handleAddFocus = () => {
    if (focusInput.trim()) {
      setOutcome(prev => ({
        ...prev,
        today_focus: [...(prev.today_focus || []), focusInput.trim()]
      }));
      setFocusInput('');
    }
  };
  
  const handleRemoveFocus = (index: number) => {
    setOutcome(prev => ({
      ...prev,
      today_focus: (prev.today_focus || []).filter((_, i) => i !== index)
    }));
  };
  
  const handleAddAccomplishment = () => {
    if (accomplishmentInput.trim()) {
      setOutcome(prev => ({
        ...prev,
        accomplishments: [...(prev.accomplishments || []), accomplishmentInput.trim()]
      }));
      setAccomplishmentInput('');
    }
  };
  
  const handleRemoveAccomplishment = (index: number) => {
    setOutcome(prev => ({
      ...prev,
      accomplishments: (prev.accomplishments || []).filter((_, i) => i !== index)
    }));
  };
  
  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save your daily outcomes.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const result = await ProductivityService.saveDailyOutcome(user.id, {
        ...outcome as DailyOutcome,
        date: selectedDate,
        prev_day_tasks: yesterdayTasks
      });
      
      if (result) {
        toast({
          title: "Daily Outcomes Saved",
          description: "Your daily outcomes have been saved successfully."
        });
        
        setOutcome({
          id: result.id,
          date: result.date,
          prev_day_tasks: result.prev_day_tasks,
          today_focus: result.today_focus,
          accomplishments: result.accomplishments,
          performance_rating: result.performance_rating,
          lessons_learned: result.lessons_learned
        });
      }
    } catch (error) {
      console.error('Error saving daily outcome:', error);
      toast({
        title: "Error",
        description: "Failed to save daily outcomes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Daily Intended Outcomes</CardTitle>
            <CardDescription>Track your daily focus, accomplishments, and lessons</CardDescription>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-auto pl-3 text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Yesterday's Tasks Section */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Yesterday's Tasks</h3>
          {yesterdayTasks.length > 0 ? (
            <div className="space-y-2">
              {yesterdayTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between border p-2 rounded">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      task.status === 'complete' ? 'bg-green-500' : 
                      task.status === 'in-progress' ? 'bg-blue-500' : 'bg-amber-500'
                    }`} />
                    <span className="text-sm">{task.title}</span>
                  </div>
                  <Badge variant={task.status === 'complete' ? 'default' : 'outline'}>
                    {task.status === 'complete' ? 'Completed' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No tasks from yesterday.</p>
          )}
        </div>
        
        {/* Today's Focus Areas */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Today's Focus Areas</h3>
          <div className="flex space-x-2">
            <Input 
              placeholder="What will you focus on today?"
              value={focusInput}
              onChange={(e) => setFocusInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddFocus()}
            />
            <Button size="icon" onClick={handleAddFocus}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {outcome.today_focus?.map((focus, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {focus}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleRemoveFocus(index)}
                />
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Today's Accomplishments */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Today's Accomplishments</h3>
          <div className="flex space-x-2">
            <Input 
              placeholder="What have you accomplished today?"
              value={accomplishmentInput}
              onChange={(e) => setAccomplishmentInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddAccomplishment()}
            />
            <Button size="icon" onClick={handleAddAccomplishment}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {outcome.accomplishments?.map((accomplishment, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {accomplishment}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleRemoveAccomplishment(index)}
                />
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Performance Rating */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Today's Performance Rating</Label>
            <span className="font-medium">{outcome.performance_rating}/10</span>
          </div>
          <Slider
            value={[outcome.performance_rating || 5]}
            min={1}
            max={10}
            step={1}
            onValueChange={(values) => setOutcome(prev => ({ ...prev, performance_rating: values[0] }))}
          />
        </div>
        
        {/* Lessons Learned */}
        <div className="space-y-2">
          <Label htmlFor="lessons-learned">Lessons Learned</Label>
          <Textarea
            id="lessons-learned"
            placeholder="What did you learn today? What would you do differently?"
            value={outcome.lessons_learned || ''}
            onChange={(e) => setOutcome(prev => ({ ...prev, lessons_learned: e.target.value }))}
            rows={3}
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
          {loading ? 'Saving...' : 'Save Daily Outcomes'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DailyOutcomes;
