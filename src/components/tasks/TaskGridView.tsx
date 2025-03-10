
import React from 'react';
import { Task } from './types';
import TaskCard from './TaskCard';
import TaskEmptyState from './TaskEmptyState';

interface TaskGridViewProps {
  tasks: Task[];
  filteredTasks: Task[];
  loading: boolean;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
}

const TaskGridView: React.FC<TaskGridViewProps> = ({
  tasks,
  filteredTasks,
  loading,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}) => {
  if (loading) {
    return (
      <div className="col-span-full flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (filteredTasks.length === 0) {
    return <TaskEmptyState hasTasksTotal={tasks.length > 0} isFiltered={tasks.length !== filteredTasks.length} />;
  }

  return (
    <>
      {filteredTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={() => onEditTask(task)}
          onDelete={() => onDeleteTask(task.id)}
          onStatusChange={(newStatus) => onStatusChange(task.id, newStatus)}
        />
      ))}
    </>
  );
};

export default TaskGridView;
