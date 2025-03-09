
import React from 'react';
import { AlertCircle, Clock3 } from 'lucide-react';
import { isPast, isToday } from 'date-fns';
import { TaskStatus } from './types';

interface TaskDateIndicatorProps {
  dueDate: Date;
  status: TaskStatus;
}

export const TaskDateIndicator: React.FC<TaskDateIndicatorProps> = ({ dueDate, status }) => {
  const isDueSoon = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);
    return diffDays <= 2 && diffDays > 0;
  };

  if (isPast(dueDate) && status !== 'complete') {
    return (
      <div className="flex items-center gap-1 text-xs text-destructive">
        <AlertCircle className="h-3 w-3" />
        <span>Overdue</span>
      </div>
    );
  }

  if (isToday(dueDate) && status !== 'complete') {
    return (
      <div className="flex items-center gap-1 text-xs text-receipts-yellow">
        <Clock3 className="h-3 w-3" />
        <span>Due today</span>
      </div>
    );
  }

  if (isDueSoon(dueDate) && status !== 'complete') {
    return (
      <div className="flex items-center gap-1 text-xs text-amber-500">
        <Clock3 className="h-3 w-3" />
        <span>Due soon</span>
      </div>
    );
  }

  return null;
};
