
import React from 'react';
import { CalendarClock, Bell, CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Task } from './types';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskDateIndicator } from './TaskDateIndicator';
import { TaskActions } from './TaskActions';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
  onSetReminder?: (id: string, reminderTime: string) => void;
  onUpdateProgress?: (id: string, progress: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onEdit,
  onDelete,
  onStatusChange,
  onSetReminder,
  onUpdateProgress
}) => {
  const { toast } = useToast();
  
  const getPriorityClass = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  const handleStatusChange = (id: string, status: Task['status']) => {
    onStatusChange(id, status);
    
    let statusMessage = '';
    switch (status) {
      case 'pending':
        statusMessage = 'marked as pending';
        break;
      case 'in-progress':
        statusMessage = 'marked as in progress';
        break;
      case 'complete':
        statusMessage = 'completed';
        break;
    }
    
    toast({
      title: `Task ${statusMessage}`,
      description: `"${task.title}" has been ${statusMessage}.`,
    });
  };

  return (
    <div className={cn(
      'task-card', 
      getPriorityClass(task.priority), 
      "p-4 border rounded-lg shadow-sm hover:shadow transition-shadow", 
      task.status === 'complete' ? "opacity-75" : ""
    )}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-card-foreground truncate">{task.title}</h3>
        <TaskActions
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={handleStatusChange}
          onSetReminder={onSetReminder}
        />
      </div>
      
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{task.description}</p>
      
      {task.progress !== undefined && task.status !== 'complete' && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span>Progress</span>
            <span>{task.progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={task.status === 'complete' ? 'bg-receipts-success h-2 rounded-full' : 'bg-primary h-2 rounded-full'}
              style={{ width: `${task.status === 'complete' ? 100 : task.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarClock className="h-4 w-4" />
          <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
          {task.dueTime && <span className="text-xs">{task.dueTime}</span>}
        </div>
        <TaskStatusBadge status={task.status} />
      </div>
      
      <div className="flex justify-between items-center mb-3">
        <TaskDateIndicator dueDate={new Date(task.dueDate)} status={task.status} />
        
        {task.reminderSet && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Bell className="h-3 w-3" />
            <span>Reminder: {task.reminderTime}</span>
          </div>
        )}
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      
      {task.assignedTo && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assignedTo.avatar} />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">{task.assignedTo.initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{task.assignedTo.name}</span>
          </div>
          
          {task.status === 'complete' && (
            <CheckCircle2 className="h-4 w-4 text-receipts-success" />
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
