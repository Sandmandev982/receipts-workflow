
import React from 'react';
import { format, isToday, isTomorrow, isBefore, isAfter, addDays, differenceInDays } from 'date-fns';
import { Task } from './types';
import { Clock, Calendar, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TaskDateIndicatorProps {
  task: Task;
  showIcon?: boolean;
  className?: string;
}

export const TaskDateIndicator: React.FC<TaskDateIndicatorProps> = ({ 
  task, 
  showIcon = true,
  className 
}) => {
  if (!task.dueDate) {
    return (
      <span className={cn("text-xs text-muted-foreground flex items-center", className)}>
        {showIcon && <Calendar className="h-3 w-3 mr-1 opacity-70" />}
        No due date
      </span>
    );
  }

  const dueDate = new Date(task.dueDate);
  const now = new Date();
  const daysUntilDue = differenceInDays(dueDate, now);

  let dateString = format(dueDate, 'MMM d, yyyy');
  let timeString = task.dueTime ? task.dueTime : '';
  let displayClasses = "text-xs flex items-center";
  let icon = <Calendar className="h-3 w-3 mr-1" />;

  if (task.status === 'complete') {
    displayClasses = cn(displayClasses, "text-muted-foreground line-through", className);
  } else if (isBefore(dueDate, now)) {
    // Overdue
    displayClasses = cn(displayClasses, "text-destructive font-medium", className);
    icon = <AlertTriangle className="h-3 w-3 mr-1" />;
    
    const daysOverdue = differenceInDays(now, dueDate);
    if (daysOverdue === 0) {
      dateString = "Due today (overdue)";
    } else if (daysOverdue === 1) {
      dateString = "Due yesterday";
    } else {
      dateString = `Overdue by ${daysOverdue} days`;
    }
  } else if (isToday(dueDate)) {
    displayClasses = cn(displayClasses, "text-amber-500 font-medium", className);
    icon = <Clock className="h-3 w-3 mr-1" />;
    dateString = "Due today";
  } else if (isTomorrow(dueDate)) {
    displayClasses = cn(displayClasses, "text-amber-400", className);
    dateString = "Due tomorrow";
  } else if (daysUntilDue <= 3) {
    // Due soon (within 3 days)
    displayClasses = cn(displayClasses, "text-amber-300", className);
    dateString = `Due in ${daysUntilDue} days`;
  } else if (daysUntilDue <= 7) {
    // Due this week
    displayClasses = cn(displayClasses, "text-emerald-400", className);
    dateString = `Due in ${daysUntilDue} days`;
  } else {
    // Due in more than a week
    displayClasses = cn(displayClasses, "text-muted-foreground", className);
    dateString = format(dueDate, 'MMM d, yyyy');
  }

  return (
    <span className={displayClasses}>
      {showIcon && icon}
      {dateString} {timeString && `at ${timeString}`}
    </span>
  );
};
