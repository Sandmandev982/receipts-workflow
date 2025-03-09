
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
  teamMembers?: Array<{ id: string; name: string }>;
}

const TaskEditDialog: React.FC<TaskEditDialogProps> = ({
  task,
  open,
  onOpenChange,
  onSubmit,
  teamMembers = [],
}) => {
  const handleSubmit = (data: any) => {
    // Process the tags into an array if they exist
    const tags = data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [];
    
    // Find the assigned team member if there's an assignedTo value
    const assignedTeamMember = data.assignedTo 
      ? teamMembers.find(m => m.id === data.assignedTo) 
      : undefined;
    
    onSubmit({
      ...(task?.id ? { id: task.id } : {}),
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate,
      dueTime: data.dueTime,
      reminderSet: data.reminderEnabled,
      reminderTime: data.reminderEnabled ? data.reminderTime : null,
      progress: parseInt(data.progress, 10),
      tags: tags.length > 0 ? tags : null,
      assignedTo: assignedTeamMember ? {
        id: assignedTeamMember.id,
        name: assignedTeamMember.name,
        initials: assignedTeamMember.name.substring(0, 2).toUpperCase()
      } : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task?.id ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        </DialogHeader>
        {task && <TaskForm task={task} onSubmit={handleSubmit} teamMembers={teamMembers} />}
      </DialogContent>
    </Dialog>
  );
};

export default TaskEditDialog;
