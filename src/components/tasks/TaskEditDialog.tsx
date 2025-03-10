
import React, { useState, useEffect } from 'react';
import { Task } from './types';
import TaskForm from './TaskForm';
import { TaskFormValues } from './form/TaskFormSchema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TeamOption {
  id: string;
  name: string;
}

interface TaskEditDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: Task) => void;
  teamMembers?: Array<{ id: string; name: string }>;
}

const TaskEditDialog: React.FC<TaskEditDialogProps> = ({
  task,
  open,
  onOpenChange,
  onSubmit,
  teamMembers = [],
}) => {
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (open && user) {
      fetchUserTeams();
    }
  }, [open, user]);

  const fetchUserTeams = async () => {
    try {
      // Fetch team memberships
      const { data: membershipData, error: membershipError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user?.id);

      if (membershipError) throw membershipError;

      if (membershipData && membershipData.length > 0) {
        const teamIds = membershipData.map(item => item.team_id);
        
        // Fetch team details
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('id, name')
          .in('id', teamIds);

        if (teamsError) throw teamsError;
        
        setTeams(teamsData || []);
      } else {
        setTeams([]);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleSubmit = (data: TaskFormValues) => {
    // Process the tags into an array if they exist
    const tags = data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [];
    
    // Find the assigned team member if there's an assignedTo value
    const assignedTeamMember = data.assignedTo 
      ? teamMembers.find(m => m.id === data.assignedTo) 
      : undefined;
    
    const updatedTask: Task = {
      ...(task as Task), // We know task is non-null here because we check in the component
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate,
      dueTime: data.dueTime,
      reminderSet: data.reminderEnabled,
      reminderTime: data.reminderEnabled ? data.reminderTime : undefined,
      emailNotification: data.emailNotification,
      notificationEmail: data.emailNotification ? data.notificationEmail : undefined,
      progress: data.progress,
      tags: tags.length > 0 ? tags : undefined,
      assignedTo: assignedTeamMember ? {
        id: assignedTeamMember.id,
        name: assignedTeamMember.name,
        initials: assignedTeamMember.name.substring(0, 2).toUpperCase()
      } : undefined,
      teamId: data.teamId || undefined
    };
    
    onSubmit(updatedTask);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task?.id ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        </DialogHeader>
        {open && task && <TaskForm 
          task={task} 
          onSubmit={handleSubmit} 
          teamMembers={teamMembers}
          teams={teams} 
        />}
      </DialogContent>
    </Dialog>
  );
};

export default TaskEditDialog;
