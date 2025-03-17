
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
  teamMembers?: Array<{ id: string; name: string; initials?: string; avatar?: string }>;
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
    if (!task) return;
    
    // Process the tags into an array if they exist
    const tags = data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [];
    
    // Find the assigned team member if there's an assignedTo value
    const assignedTeamMember = data.assignedTo 
      ? teamMembers.find(m => m.id === data.assignedTo) 
      : undefined;
    
    const updatedTask: Task = {
      ...task,
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
        initials: assignedTeamMember.initials,
        avatar: assignedTeamMember.avatar
      } : undefined,
      teamId: data.teamId || undefined,
      // SMART task fields
      specific: data.specific,
      measurable: data.measurable,
      achievable: data.achievable,
      relevant: data.relevant,
      time_bound: data.time_bound,
      // Additional fields
      start_date: data.start_date,
      has_subtasks: data.has_subtasks,
      has_reverse_plan: data.has_reverse_plan,
      // New SMART fields
      expected_outcome: data.expected_outcome,
      metrics: data.metrics,
      resources_needed: data.resources_needed,
      obstacles: data.obstacles,
      dependencies: data.dependencies
    };
    
    onSubmit(updatedTask);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto">
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
