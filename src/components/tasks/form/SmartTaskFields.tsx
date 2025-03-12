
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription,
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import FormSection from './FormSection';

interface SmartTaskFieldsProps {
  form: UseFormReturn<any>;
}

const SmartTaskFields: React.FC<SmartTaskFieldsProps> = ({ form }) => {
  return (
    <FormSection>
      <h3 className="text-sm font-medium mb-2">S.M.A.R.T. Criteria</h3>
      
      <FormField
        control={form.control}
        name="specific"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Specific</FormLabel>
            <FormControl>
              <Input 
                placeholder="What exactly needs to be accomplished?" 
                {...field} 
                value={field.value || ''}
              />
            </FormControl>
            <FormDescription>
              Define the task clearly and precisely.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="measurable"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Measurable</FormLabel>
            <FormControl>
              <Input 
                placeholder="How will you measure success?" 
                {...field}
                value={field.value || ''} 
              />
            </FormControl>
            <FormDescription>
              Identify metrics to track progress and completion.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="achievable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Achievable
                </FormLabel>
                <FormDescription>
                  Is this task realistic with available resources?
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="time_bound"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Time-bound
                </FormLabel>
                <FormDescription>
                  Has a defined deadline or timeframe
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="relevant"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Relevant</FormLabel>
            <FormControl>
              <Input 
                placeholder="Why is this task important?" 
                {...field}
                value={field.value || ''} 
              />
            </FormControl>
            <FormDescription>
              Explain how this task aligns with your broader goals.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
};

export default SmartTaskFields;
