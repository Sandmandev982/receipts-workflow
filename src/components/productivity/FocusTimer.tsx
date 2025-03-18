
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, BellOff, Pause, Play, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { NotificationService } from '@/services/NotificationService';

interface FocusTimerProps {
  taskId?: string;
  taskTitle?: string;
}

const FocusTimer: React.FC<FocusTimerProps> = ({ taskId, taskTitle }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(50 * 60); // 50 minutes in seconds
  const [isBreak, setIsBreak] = useState(false);
  const [use5010Mode, setUse5010Mode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Calculate work and break durations based on mode
  const workDuration = use5010Mode ? 50 * 60 : 25 * 60; // 50 or 25 minutes in seconds
  const breakDuration = use5010Mode ? 10 * 60 : 5 * 60; // 10 or 5 minutes in seconds

  // For progress bar
  const totalDuration = isBreak ? breakDuration : workDuration;
  const progress = 100 - (timeRemaining / totalDuration) * 100;

  useEffect(() => {
    // Reset timer when switching modes
    if (!isRunning) {
      setTimeRemaining(workDuration);
    }
  }, [use5010Mode, workDuration]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to use the timer",
        variant: "destructive"
      });
      return;
    }

    if (isPaused) {
      setIsPaused(false);
      setIsRunning(true);
    } else {
      // Create a new timer session in the database
      try {
        const { data, error } = await supabase
          .from('timer_sessions')
          .insert({
            user_id: user.id,
            task_id: taskId,
            start_time: new Date().toISOString(),
            work_duration: workDuration / 60, // Store in minutes
            break_duration: breakDuration / 60, // Store in minutes
            completed: false
          })
          .select()
          .single();

        if (error) throw error;
        
        setSessionId(data.id);
        startTimeRef.current = new Date();
        setIsRunning(true);
        setTimeRemaining(workDuration);
        setIsBreak(false);

        toast({
          title: "Timer started",
          description: `Focus mode activated. ${use5010Mode ? '50/10' : '25/5'} timer started.`
        });
      } catch (error) {
        console.error('Error starting timer session:', error);
        toast({
          title: "Error",
          description: "Could not start the timer session",
          variant: "destructive"
        });
      }
    }
  };

  const pauseTimer = () => {
    setIsPaused(true);
    setIsRunning(false);
  };

  const resetTimer = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(workDuration);
    setIsBreak(false);
    
    // Update the session as incomplete if it exists
    if (sessionId && user) {
      try {
        await supabase
          .from('timer_sessions')
          .update({
            completed: false,
            end_time: new Date().toISOString()
          })
          .eq('id', sessionId);
          
        setSessionId(null);
      } catch (error) {
        console.error('Error updating timer session:', error);
      }
    }
  };

  const completeSession = async () => {
    if (sessionId && user) {
      try {
        await supabase
          .from('timer_sessions')
          .update({
            completed: true,
            end_time: new Date().toISOString()
          })
          .eq('id', sessionId);
          
        setSessionId(null);
        
        // Notify the user
        if (notificationsEnabled) {
          await NotificationService.createNotification({
            userId: user.id,
            title: "Focus Session Completed",
            message: `You've completed a ${use5010Mode ? '50/10' : '25/5'} focus session${taskTitle ? ` for "${taskTitle}"` : ''}.`,
            type: 'system',
            taskId
          });
        }
      } catch (error) {
        console.error('Error completing timer session:', error);
      }
    }
  };

  // Start the timer interval when running
  useEffect(() => {
    if (isRunning && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up
            clearInterval(timerRef.current!);
            timerRef.current = null;
            
            if (isBreak) {
              // Break is over, start new work session
              if (notificationsEnabled && user) {
                // Notification for break end
                NotificationService.createNotification({
                  userId: user.id,
                  title: "Break Finished",
                  message: "Time to get back to work!",
                  type: 'system',
                  taskId
                });
              }
              
              setIsBreak(false);
              setTimeRemaining(workDuration);
              startTimeRef.current = new Date();
              
              // Start new work interval
              timerRef.current = setInterval(() => {
                setTimeRemaining(p => p > 0 ? p - 1 : 0);
              }, 1000);
              
              return workDuration;
            } else {
              // Work session is over, either start break or complete
              completeSession();
              
              if (notificationsEnabled && user) {
                // Notification for work session end
                NotificationService.createNotification({
                  userId: user.id,
                  title: "Work Session Completed",
                  message: `Great job! Time for a ${breakDuration / 60} minute break.`,
                  type: 'system',
                  taskId
                });
              }
              
              setIsBreak(true);
              setTimeRemaining(breakDuration);
              
              // Start break interval
              timerRef.current = setInterval(() => {
                setTimeRemaining(p => p > 0 ? p - 1 : 0);
              }, 1000);
              
              return breakDuration;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isRunning && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, isBreak, workDuration, breakDuration, notificationsEnabled, user, taskId]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{isBreak ? 'Break Time' : 'Focus Timer'}</span>
          <div className="flex items-center space-x-2">
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
            <Label htmlFor="notifications" className="sr-only">Notifications</Label>
            {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          </div>
        </CardTitle>
        <CardDescription>
          {taskTitle && <span>Working on: {taskTitle}</span>}
          {isBreak 
            ? "Take a break and recharge" 
            : "Stay focused on your current task"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          {/* Timer display */}
          <div className="text-5xl font-bold tabular-nums">
            {formatTime(timeRemaining)}
          </div>
          
          {/* Progress bar */}
          <Progress value={progress} className="w-full h-2" />
          
          {/* Mode selector - only enabled when timer is not running */}
          <div className="flex items-center space-x-2 mt-4">
            <Switch
              id="timerMode"
              checked={use5010Mode}
              onCheckedChange={setUse5010Mode}
              disabled={isRunning || isPaused}
            />
            <Label htmlFor="timerMode">
              {use5010Mode ? '50/10 Mode' : '25/5 Mode'}
            </Label>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center space-x-2">
        {!isRunning && !isPaused ? (
          <Button onClick={startTimer} className="bg-green-600 hover:bg-green-700">
            <Play className="mr-2 h-4 w-4" />
            Start
          </Button>
        ) : isRunning ? (
          <Button onClick={pauseTimer} variant="outline">
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </Button>
        ) : (
          <Button onClick={startTimer} className="bg-green-600 hover:bg-green-700">
            <Play className="mr-2 h-4 w-4" />
            Resume
          </Button>
        )}
        
        <Button onClick={resetTimer} variant="destructive">
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FocusTimer;
