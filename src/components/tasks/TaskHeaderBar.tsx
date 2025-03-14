
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import TaskForm from './TaskForm';

interface TaskHeaderBarProps {
  title: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  onAddTask: (task: any) => void;
  teamMembers: Array<{ id: string; name: string }>;
}

const TaskHeaderBar: React.FC<TaskHeaderBarProps> = ({ 
  title, 
  open, 
  setOpen, 
  onAddTask,
  teamMembers
}) => {
  const handleSubmit = (data: any) => {
    // Process tags
    const tags = data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [];
    
    onAddTask({
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
      assignedTo: data.assignedTo,
    });
    
    setOpen(false);
  };

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold">{title}</h2>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-1" /> Add Task
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <TaskForm onSubmit={handleSubmit} teamMembers={teamMembers} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskHeaderBar;
