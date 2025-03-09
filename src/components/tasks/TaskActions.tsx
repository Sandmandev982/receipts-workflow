
import React from 'react';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Task } from './types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

interface TaskActionsProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
  onSetReminder?: (id: string, reminderTime: string) => void;
}

export const TaskActions: React.FC<TaskActionsProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onSetReminder
}) => {
  const handleStatusChange = (status: Task['status']) => {
    onStatusChange(task.id, status);
  };

  const handleSetReminder = () => {
    if (onSetReminder) {
      onSetReminder(task.id, '1 hour');
    }
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      onDelete(task.id);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(task)}>Edit</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleStatusChange('pending')}>
          Mark as Pending
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange('in-progress')}>
          Mark as In Progress
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange('complete')}>
          Mark as Complete
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {onSetReminder && !task.reminderSet && (
          <DropdownMenuItem onClick={handleSetReminder}>
            Set Reminder
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
