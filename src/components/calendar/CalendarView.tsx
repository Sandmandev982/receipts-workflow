
import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/components/tasks/types';

interface CalendarViewProps {
  userId: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ userId }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch tasks for the current user
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks', userId, format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      if (!userId) return [];
      
      const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .gte('due_date', startDate)
        .lte('due_date', endDate);
        
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!userId,
  });
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const getDaysInMonth = (): CalendarDay[] => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    return daysInMonth.map(date => {
      // Find tasks for this day
      const dayTasks = tasks?.filter(task => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        return isSameDay(taskDate, date);
      }) || [];
      
      return {
        date,
        isCurrentMonth: isSameMonth(date, currentMonth),
        isToday: isToday(date),
        tasks: dayTasks,
      };
    });
  };
  
  if (error) {
    toast({
      title: "Error loading calendar",
      description: "Could not load your tasks for the calendar",
      variant: "destructive",
    });
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </div>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          View and manage your scheduled tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div 
                key={day} 
                className="h-10 flex items-center justify-center font-medium text-sm"
              >
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {getDaysInMonth().map((day, index) => (
              <div 
                key={index}
                className={`
                  h-24 border rounded-md p-1 overflow-hidden
                  ${day.isToday ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'}
                  ${!day.isCurrentMonth ? 'opacity-40' : ''}
                `}
              >
                <div className="text-xs font-medium">
                  {format(day.date, 'd')}
                </div>
                
                <div className="mt-1 space-y-1 overflow-y-auto max-h-[60px]">
                  {day.tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="text-xs rounded bg-primary/20 px-1 py-0.5 truncate">
                      {task.title}
                    </div>
                  ))}
                  
                  {day.tasks.length > 3 && (
                    <div className="text-xs text-muted-foreground pl-1">
                      + {day.tasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 border-t flex justify-between items-center text-xs text-muted-foreground">
        <div>
          Showing your tasks with due dates
        </div>
        
        {(tasks?.length === 0 && !isLoading) && (
          <div className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            No tasks scheduled for this month
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default CalendarView;
