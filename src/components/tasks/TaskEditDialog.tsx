
import React from 'react';
import { Task } from './TaskCard';
import TaskForm from './TaskForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TaskEditDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: Omit<Task, 'id'> & { id?: string }) => void;
}

const TaskEditDialog: React.FC<TaskEditDialogProps> = ({
  task,
  open,
  onOpenChange,
  onSubmit,
}) => {
  const handleSubmit = (data: any) => {
    onSubmit({
      ...(task?.id ? { id: task.id } : {}),
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate,
      assignedTo: task?.assignedTo,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task?.id ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        </DialogHeader>
        {task && <TaskForm task={task} onSubmit={handleSubmit} />}
      </DialogContent>
    </Dialog>
  );
};

export default TaskEditDialog;
