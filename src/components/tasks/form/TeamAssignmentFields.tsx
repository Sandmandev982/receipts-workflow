
import React from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { TaskFormValues } from '../types';

interface TeamOption {
  id: string;
  name: string;
}

interface TeamAssignmentFieldsProps {
  form: UseFormReturn<TaskFormValues>;
  teams?: TeamOption[];
  teamMembers: Array<{ id: string; name: string; initials?: string; avatar?: string }>;
}

const TeamAssignmentFields: React.FC<TeamAssignmentFieldsProps> = ({ form, teams = [], teamMembers = [] }) => {
  if ((!teams || teams.length === 0) && (!teamMembers || teamMembers.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-4">
      {teams.length > 0 && (
        <FormField
          control={form.control}
          name="teamId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team</FormLabel>
              <Select 
                value={field.value || ""} 
                onValueChange={(value) => field.onChange(value || undefined)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">No team</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Assign this task to a team
              </FormDescription>
            </FormItem>
          )}
        />
      )}

      {teamMembers.length > 0 && (
        <FormField
          control={form.control}
          name="assignedTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign To</FormLabel>
              <Select 
                value={field.value || ""} 
                onValueChange={(value) => field.onChange(value || undefined)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name || member.initials || member.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Assign this task to a team member
              </FormDescription>
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default TeamAssignmentFields;
