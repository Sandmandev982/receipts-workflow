
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BellRing } from 'lucide-react';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import FormSection from './FormSection';

interface ReminderFieldsProps {
  form: UseFormReturn<any>;
}

const ReminderFields: React.FC<ReminderFieldsProps> = ({ form }) => {
  // Watch the reminderEnabled value to conditionally show the reminder time field
  const reminderEnabled = form.watch('reminderEnabled');

  return (
    <FormSection title="Reminder Settings">
      <FormField
        control={form.control}
        name="reminderEnabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <FormLabel>Set Reminder</FormLabel>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      {reminderEnabled && (
        <FormField
          control={form.control}
          name="reminderTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remind me</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || '1 hour before'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select when to be reminded" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="5 minutes before">5 minutes before</SelectItem>
                  <SelectItem value="15 minutes before">15 minutes before</SelectItem>
                  <SelectItem value="30 minutes before">30 minutes before</SelectItem>
                  <SelectItem value="1 hour before">1 hour before</SelectItem>
                  <SelectItem value="3 hours before">3 hours before</SelectItem>
                  <SelectItem value="1 day before">1 day before</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </FormSection>
  );
};

export default ReminderFields;
