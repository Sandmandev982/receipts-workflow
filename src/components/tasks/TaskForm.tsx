
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Task, TaskFormValues } from './types';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { taskFormSchema } from './form/TaskFormSchema';
import { useAuth } from '@/hooks/useAuth';

// Import all the form component pieces
import BasicInfoFields from './form/BasicInfoFields';
import StatusPriorityFields from './form/StatusPriorityFields';
import DateTimeFields from './form/DateTimeFields';
import TeamAssignmentFields from './form/TeamAssignmentFields';
import TagsFields from './form/TagsFields';
import ProgressField from './form/ProgressField';
import ReminderFields from './form/ReminderFields';
import SmartTaskFields from './form/SmartTaskFields';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TeamOption {
  id: string;
  name: string;
}

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: TaskFormValues) => void;
  onTaskCreated?: (task: Task) => void;
  defaultValues?: Partial<TaskFormValues>;
  teamMembers?: Array<{ id: string; name: string; initials?: string; avatar?: string }>;
  teams?: TeamOption[];
}

const TaskForm: React.FC<TaskFormProps> = ({ 
  task,
  onSubmit,
  onTaskCreated,
  defaultValues = {}, 
  teamMembers = [], 
  teams = [] 
}) => {
  const { user } = useAuth();
  
  // Extract assignedTo ID if it's an object
  const assignedToId = task?.assignedTo 
    ? (typeof task.assignedTo === 'object' ? task.assignedTo.id : task.assignedTo) 
    : undefined;
  
  const formDefaultValues = {
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    status: task?.status || 'pending',
    dueDate: task?.dueDate || new Date(),
    dueTime: task?.dueTime || '',
    reminderEnabled: task?.reminderSet || false,
    reminderTime: task?.reminderTime || '1 hour before',
    emailNotification: task?.emailNotification || false,
    notificationEmail: task?.notificationEmail || user?.email || '',
    progress: task?.progress || 0,
    tags: task?.tags ? task.tags.join(', ') : '',
    assignedTo: assignedToId || '',
    teamId: task?.teamId || defaultValues.teamId || '',
    // SMART task fields
    specific: task?.specific || defaultValues.specific || '',
    measurable: task?.measurable || defaultValues.measurable || '',
    achievable: task?.achievable !== undefined ? task.achievable : true,
    relevant: task?.relevant || defaultValues.relevant || '',
    time_bound: task?.time_bound !== undefined ? task.time_bound : true,
    // Additional fields
    start_date: task?.start_date || defaultValues.start_date,
    has_subtasks: task?.has_subtasks || defaultValues.has_subtasks || false,
    has_reverse_plan: task?.has_reverse_plan || defaultValues.has_reverse_plan || false,
    // New SMART fields
    expected_outcome: task?.expected_outcome || defaultValues.expected_outcome || '',
    metrics: task?.metrics || defaultValues.metrics || '',
    resources_needed: task?.resources_needed || defaultValues.resources_needed || '',
    obstacles: task?.obstacles || defaultValues.obstacles || '',
    dependencies: task?.dependencies || defaultValues.dependencies || ''
  };
  
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: formDefaultValues,
  });

  const handleSubmit = (data: TaskFormValues) => {
    onSubmit(data);
    if (onTaskCreated && !task) {
      // Process tags from comma-separated string to array
      const newTask = {
        id: 'temp-id', // Will be replaced by the actual ID from the backend
        ...data,
        dueDate: data.dueDate,
        status: data.status,
        priority: data.priority,
        progress: data.progress,
        reminderSet: data.reminderEnabled,
        reminderTime: data.reminderTime,
        // Convert comma-separated string to array
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
      } as Task;
      
      onTaskCreated(newTask);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="smart">SMART Task</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
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
          </TabsContent>
          
          <TabsContent value="smart" className="space-y-4">
            {/* SMART Task Fields */}
            <SmartTaskFields form={form} />
          </TabsContent>
        </Tabs>
        
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
