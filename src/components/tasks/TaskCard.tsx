
import React from 'react';
import { CalendarClock, Bell, Clock, MoreVertical, AlertCircle, CheckCircle2, Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { format, isPast, isToday } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'complete';
  dueDate: Date;
  dueTime?: string;
  reminderSet?: boolean;
  reminderTime?: string;
  progress?: number;
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
    initials: string;
  };
  tags?: string[];
}

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

  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-receipts-yellow/10 border-receipts-yellow text-receipts-yellow font-normal">Pending</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-receipts-blue/10 border-receipts-blue text-receipts-blue font-normal">In Progress</Badge>;
      case 'complete':
        return <Badge variant="outline" className="bg-receipts-success/10 border-receipts-success text-receipts-success font-normal">Complete</Badge>;
      default:
        return null;
    }
  };

  const isDueSoon = (dueDate: Date) => {
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);
    return diffDays <= 2 && diffDays > 0;
  };

  const getDateStatusIndicator = () => {
    const dueDate = new Date(task.dueDate);
    
    if (isPast(dueDate) && task.status !== 'complete') {
      return (
        <div className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          <span>Overdue</span>
        </div>
      );
    } else if (isToday(dueDate) && task.status !== 'complete') {
      return (
        <div className="flex items-center gap-1 text-xs text-receipts-yellow">
          <Clock3 className="h-3 w-3" />
          <span>Due today</span>
        </div>
      );
    } else if (isDueSoon(dueDate) && task.status !== 'complete') {
      return (
        <div className="flex items-center gap-1 text-xs text-amber-500">
          <Clock3 className="h-3 w-3" />
          <span>Due soon</span>
        </div>
      );
    }
    
    return null;
  };

  const formatDate = (date: Date) => {
    return format(date, 'MMM d, yyyy');
  };
  
  const handleStatusChange = (status: Task['status']) => {
    onStatusChange(task.id, status);
    
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
  
  const handleSetReminder = () => {
    if (onSetReminder) {
      onSetReminder(task.id, '1 hour');
      
      toast({
        title: "Reminder Set",
        description: `You'll be reminded about "${task.title}" 1 hour before it's due.`,
      });
    }
  };
  
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      onDelete(task.id);
      
      toast({
        title: "Task Deleted",
        description: `"${task.title}" has been deleted.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn('task-card', getPriorityClass(task.priority), "p-4 border rounded-lg shadow-sm hover:shadow transition-shadow", task.status === 'complete' ? "opacity-75" : "")}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-card-foreground truncate">{task.title}</h3>
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
              className={`${task.status === 'complete' ? 'bg-receipts-success' : 'bg-primary'} h-2 rounded-full`}
              style={{ width: `${task.status === 'complete' ? '100' : task.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarClock className="h-4 w-4" />
          <span>{formatDate(task.dueDate)}</span>
          {task.dueTime && <span className="text-xs">{task.dueTime}</span>}
        </div>
        {getStatusBadge(task.status)}
      </div>
      
      <div className="flex justify-between items-center mb-3">
        {getDateStatusIndicator()}
        
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
