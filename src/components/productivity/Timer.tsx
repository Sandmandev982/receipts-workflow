
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Clock, Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTimer } from '@/hooks/useTimer';
import { Task } from '@/components/tasks/types';

interface TimerProps {
  tasks?: Task[];
}

const Timer: React.FC<TimerProps> = ({ tasks = [] }) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [notes, setNotes] = useState('');
  
  const {
    mode,
    isActive,
    formattedTime,
    progress,
    startWorkSession,
    pauseTimer,
    resumeTimer,
    resetTimer,
    finishSession
  } = useTimer({ taskId: selectedTaskId });
  
  const handleStartTimer = () => {
    startWorkSession();
  };
  
  const handlePauseResume = () => {
    if (isActive) {
      pauseTimer();
    } else {
      resumeTimer();
    }
  };
  
  const handleReset = () => {
    resetTimer();
    setNotes('');
  };
  
  const handleFinish = () => {
    finishSession(notes);
    setNotes('');
  };
  
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          50/10 Timer
        </CardTitle>
        <CardDescription>
          Focus for 50 minutes, then take a 10-minute break
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mode === 'idle' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-select">Select a task (optional)</Label>
              <Select
                value={selectedTaskId}
                onValueChange={setSelectedTaskId}
              >
                <SelectTrigger id="task-select">
                  <SelectValue placeholder="Select a task" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific task</SelectItem>
                  {tasks.map(task => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleStartTimer}
              className="w-full"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Focus Session
            </Button>
          </div>
        )}
        
        {mode !== 'idle' && (
          <>
            <div className="text-center space-y-2">
              <p className="text-sm font-medium">
                {mode === 'work' ? 'FOCUS TIME' : 'BREAK TIME'}
              </p>
              <div className="text-4xl font-bold">{formattedTime}</div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant={isActive ? "outline" : "default"}
                onClick={handlePauseResume}
                className="flex-1"
              >
                {isActive ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Resume
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="session-notes">Session notes</Label>
              <Textarea
                id="session-notes"
                placeholder="What did you accomplish in this session?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
            
            <Button 
              onClick={handleFinish}
              className="w-full"
              variant="secondary"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Complete Session
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Timer;
