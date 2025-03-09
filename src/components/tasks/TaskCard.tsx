import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, Clock, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task, TaskPriority, TaskStatus } from './types';
import TaskStatusBadge from './TaskStatusBadge';
import TaskDateIndicator from './TaskDateIndicator';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  className?: string;
}

const getStatusClass = (status: TaskStatus) => {
  switch (status) {
    case 'pending':
      return 'border-l-yellow-500';
    case 'in-progress':
      return 'border-l-blue-500';
    case 'complete':
      return 'border-l-green-500';
    default:
      return 'border-l-gray-300';
  }
};

const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-orange-100 text-orange-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  className,
}) => {
  const statusClass = getStatusClass(task.status);
  const priorityColor = getPriorityColor(task.priority);
  const isComplete = task.status === 'complete';

  return (
    <div className={`bg-card rounded-md shadow-sm border ${statusClass} ${className}`}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{task.title}</h3>
            <p className="text-sm text-muted-foreground">{task.description}</p>
            <div className="flex items-center space-x-2">
              <Badge className={priorityColor}>{task.priority}</Badge>
              {task.dueDate && (
                <TaskDateIndicator dueDate={task.dueDate} />
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onStatusChange(task.id, isComplete ? 'pending' : 'complete')}
            >
              {isComplete ? <Clock className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {task.dueDate && (
              <>
                Due {formatDistanceToNow(task.dueDate, { addSuffix: true })}
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(task.id)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <TaskStatusBadge status={task.status} />
    </div>
  );
};

export default TaskCard;
