
import React from 'react';

interface TaskEmptyStateProps {
  hasTasksTotal: boolean;
  isFiltered: boolean;
}

const TaskEmptyState: React.FC<TaskEmptyStateProps> = ({ 
  hasTasksTotal,
  isFiltered
}) => {
  return (
    <p className="text-muted-foreground col-span-full text-center py-8">
      {hasTasksTotal 
        ? 'No tasks match your filters. Try adjusting your search or filter criteria.' 
        : 'No tasks available. Click "Add Task" to create a new task.'}
    </p>
  );
};

export default TaskEmptyState;
