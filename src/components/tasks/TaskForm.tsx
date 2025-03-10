
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Task } from './types';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { taskFormSchema, TaskFormValues } from './form/TaskFormSchema';
import { useAuth } from '@/hooks/useAuth';

// Import all the form component pieces
import BasicInfoFields from './form/BasicInfoFields';
import StatusPriorityFields from './form/StatusPriorityFields';
import DateTimeFields from './form/DateTimeFields';
import TeamAssignmentFields from './form/TeamAssignmentFields';
import TagsFields from './form/TagsFields';
import ProgressField from './form/ProgressField';
import ReminderFields from './form/ReminderFields';

interface TeamOption {
  id: string;
  name: string;
}

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: TaskFormValues) => void;
  teamMembers?: Array<{ id: string; name: string }>;
  teams?: TeamOption[];
}

const TaskForm: React.FC<TaskFormProps> = ({ 
  task, 
  onSubmit, 
  teamMembers = [], 
  teams = [] 
}) => {
  const { user } = useAuth();
  
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: task ? {
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      dueTime: task.dueTime || '',
      reminderEnabled: task.reminderSet || false,
      reminderTime: task.reminderTime || '1 hour before',
      emailNotification: task.emailNotification || false,
      notificationEmail: task.notificationEmail || user?.email || '',
      progress: task.progress || 0,
      tags: task.tags ? task.tags.join(', ') : '',
      assignedTo: task.assignedTo?.id || '',
      teamId: task.teamId || '',
    } : {
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      dueDate: new Date(),
      dueTime: '',
      reminderEnabled: false,
      reminderTime: '1 hour before',
      emailNotification: false,
      notificationEmail: user?.email || '',
      progress: 0,
      tags: '',
      assignedTo: '',
      teamId: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Basic Info */}
        <BasicInfoFields form={form} />
        
        {/* Status and Priority */}
        <StatusPriorityFields form={form} />
        
        {/* Date and Time */}
        <DateTimeFields form={form} />
        
        {/* Team and Assignment */}
        <TeamAssignmentFields 
          form={form} 
          teams={teams} 
          teamMembers={teamMembers} 
        />
        
        {/* Tags */}
        <TagsFields form={form} />
        
        {/* Progress */}
        <ProgressField form={form} />
        
        {/* Reminder Settings */}
        <ReminderFields form={form} />
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" className="bg-primary text-primary-foreground">
            {task ? 'Update Task' : 'Add Task'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TaskForm;
