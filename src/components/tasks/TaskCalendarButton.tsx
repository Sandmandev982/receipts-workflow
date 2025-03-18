
import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarPlus, Check, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCalendarIntegration } from '@/hooks/useCalendarIntegration';
import { Task } from '@/components/tasks/types';

interface TaskCalendarButtonProps {
  task: Task;
}

const TaskCalendarButton: React.FC<TaskCalendarButtonProps> = ({ task }) => {
  const { syncingTasks, connected, syncTasks } = useCalendarIntegration();
  
  // If task has no due date or is already synced or not connected, disable button
  const disableSync = !task.dueDate || !!task.calendar_event_id || !connected || syncingTasks;
  
  const handleSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await syncTasks([task.id]);
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleSync}
            disabled={disableSync}
          >
            {syncingTasks ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : task.calendar_event_id ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <CalendarPlus className="h-4 w-4" />
            )}
            <span className="sr-only">
              {task.calendar_event_id ? 'Synced to calendar' : 'Add to calendar'}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {task.calendar_event_id ? (
            'Task is synced to your calendar'
          ) : !connected ? (
            'Connect Google Calendar first'
          ) : !task.dueDate ? (
            'Task needs a due date to sync'
          ) : (
            'Add to Google Calendar'
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TaskCalendarButton;
