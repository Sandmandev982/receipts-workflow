
import React, { useState } from 'react';
import TaskList from '@/components/tasks/TaskList';
import TaskEditDialog from '@/components/tasks/TaskEditDialog';
import { Task } from '@/components/tasks/types';

interface TaskManagerProps {
  tasks: Task[];
  loading: boolean;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
  onSetReminder: (id: string, reminderTime: string) => void;
  teamMembers: Array<{ id: string; name: string }>;
}

const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  loading,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onSetReminder,
  teamMembers,
}) => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTask = (updatedTask: Omit<Task, 'id'> & { id?: string }) => {
    if (updatedTask.id) {
      onEditTask({ ...updatedTask, id: updatedTask.id } as Task);
    } else {
      onAddTask(updatedTask);
    }
  };

  return (
    <>
      <TaskList
        title="All Tasks"
        tasks={tasks}
        onAddTask={onAddTask}
        onEditTask={handleEditTask}
        onDeleteTask={onDeleteTask}
        onStatusChange={onStatusChange}
        onSetReminder={onSetReminder}
        loading={loading}
        teamMembers={teamMembers}
      />
      
      <TaskEditDialog
        task={editingTask}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdateTask}
        teamMembers={teamMembers}
      />
    </>
  );
};

export default TaskManager;
