
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ProductivityService } from '@/services/ProductivityService';
import { TimerSession } from '@/components/tasks/types';

type TimerMode = 'work' | 'break' | 'idle';

interface UseTimerProps {
  defaultWorkMinutes?: number;
  defaultBreakMinutes?: number;
  taskId?: string;
}

export const useTimer = ({
  defaultWorkMinutes = 50,
  defaultBreakMinutes = 10,
  taskId
}: UseTimerProps = {}) => {
  const [mode, setMode] = useState<TimerMode>('idle');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<TimerSession | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Convert minutes to seconds
  const workDuration = defaultWorkMinutes * 60;
  const breakDuration = defaultBreakMinutes * 60;
  
  const startWorkSession = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use the timer feature.",
        variant: "destructive"
      });
      return;
    }
    
    setMode('work');
    setSecondsLeft(workDuration);
    setIsActive(true);
    
    try {
      const session = await ProductivityService.startTimerSession(
        user.id,
        taskId,
        defaultWorkMinutes,
        defaultBreakMinutes
      );
      
      if (session) {
        setCurrentSession(session);
        toast({
          title: "Work Session Started",
          description: `${defaultWorkMinutes} minute focus session started.`
        });
      }
    } catch (error) {
      console.error('Error starting timer session:', error);
      toast({
        title: "Error",
        description: "Failed to start timer session. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, workDuration, taskId, defaultWorkMinutes, defaultBreakMinutes, toast]);
  
  const startBreakSession = useCallback(() => {
    setMode('break');
    setSecondsLeft(breakDuration);
    setIsActive(true);
    
    toast({
      title: "Break Time!",
      description: `Time for a ${defaultBreakMinutes} minute break.`
    });
  }, [breakDuration, defaultBreakMinutes, toast]);
  
  const pauseTimer = useCallback(() => {
    setIsActive(false);
  }, []);
  
  const resumeTimer = useCallback(() => {
    setIsActive(true);
  }, []);
  
  const resetTimer = useCallback(async () => {
    setIsActive(false);
    setMode('idle');
    setSecondsLeft(0);
    
    // Complete the current session if it exists
    if (currentSession && user) {
      try {
        await ProductivityService.completeTimerSession(currentSession.id);
        setCurrentSession(null);
        
        toast({
          title: "Session Reset",
          description: "Timer session has been reset."
        });
      } catch (error) {
        console.error('Error completing timer session:', error);
      }
    }
  }, [currentSession, user, toast]);
  
  const finishSession = useCallback(async (notes?: string) => {
    if (currentSession && user) {
      try {
        await ProductivityService.completeTimerSession(currentSession.id, notes);
        setCurrentSession(null);
        
        toast({
          title: "Session Completed",
          description: `Great job! You've completed your session.`
        });
      } catch (error) {
        console.error('Error completing timer session:', error);
      }
    }
  }, [currentSession, user, toast]);
  
  // Format time as MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);
  
  // Effect for the countdown timer
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            // Timer has reached zero
            if (mode === 'work') {
              // Work session completed, start break
              startBreakSession();
            } else if (mode === 'break') {
              // Break completed, reset timer
              resetTimer();
              
              toast({
                title: "Break Completed",
                description: "Your break is over. Start another session when you're ready!"
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, mode, startBreakSession, resetTimer, toast]);
  
  return {
    mode,
    isActive,
    secondsLeft,
    formattedTime: formatTime(secondsLeft),
    progress: mode === 'work' 
      ? 100 - (secondsLeft / workDuration * 100)
      : mode === 'break' 
        ? 100 - (secondsLeft / breakDuration * 100)
        : 0,
    startWorkSession,
    pauseTimer,
    resumeTimer,
    resetTimer,
    finishSession
  };
};
