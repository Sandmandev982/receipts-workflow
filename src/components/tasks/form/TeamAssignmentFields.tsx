
import React from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { TaskFormValues } from '../types';

interface TeamAssignmentFieldsProps {
  form: UseFormReturn<TaskFormValues>;
  teamMembers: Array<{ id: string; name: string; initials?: string; avatar?: string }>;
}

const TeamAssignmentFields: React.FC<TeamAssignmentFieldsProps> = ({ form, teamMembers }) => {
  if (!teamMembers || teamMembers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="assignedTo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Assign To</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
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
    </div>
  );
};

export default TeamAssignmentFields;
