
import React from 'react';
import { format, isToday, isTomorrow, isBefore, isAfter } from 'date-fns';
import { Task } from './types';

export interface TaskDateIndicatorProps {
  task: Task;
}

export const TaskDateIndicator: React.FC<TaskDateIndicatorProps> = ({ task }) => {
  if (!task.dueDate) {
    return <span className="text-xs text-muted-foreground">No due date</span>;
  }

  const dueDate = new Date(task.dueDate);
  const now = new Date();

  let dateString = format(dueDate, 'MMM d, yyyy');
  let timeString = task.dueTime ? task.dueTime : '';
  let className = 'text-xs';

  if (task.status === 'complete') {
    className += ' text-muted-foreground line-through';
  } else if (isBefore(dueDate, now) && task.status !== 'complete') {
    className += ' text-destructive font-medium';
    dateString = `Overdue: ${dateString}`;
  } else if (isToday(dueDate)) {
    className += ' text-amber-500 font-medium';
    dateString = `Today: ${dateString}`;
  } else if (isTomorrow(dueDate)) {
    className += ' text-amber-400';
    dateString = `Tomorrow: ${dateString}`;
  } else if (isAfter(dueDate, now) && isBefore(dueDate, new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000))) {
    className += ' text-amber-300';
  }

  return (
    <span className={className}>
      {dateString} {timeString && `at ${timeString}`}
    </span>
  );
};
