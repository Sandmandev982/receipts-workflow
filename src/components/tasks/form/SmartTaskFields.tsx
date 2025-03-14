
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import FormSection from './FormSection';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SmartTaskFieldsProps {
  form: UseFormReturn<any>;
}

const SmartTaskFields: React.FC<SmartTaskFieldsProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>SMART Task Framework</AlertTitle>
        <AlertDescription>
          Using the SMART framework helps create more effective and achievable tasks.
          Each field helps define specific aspects of your task.
        </AlertDescription>
      </Alert>
      
      <FormSection title="Specific">
        <FormField
          control={form.control}
          name="specific"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What exactly needs to be accomplished?</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Define the task clearly and precisely" 
                  className="min-h-24"
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                A specific task has a clear, unambiguous objective.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="expected_outcome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected Outcome</FormLabel>
              <FormControl>
                <Input 
                  placeholder="What will success look like?" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>
      
      <FormSection title="Measurable">
        <FormField
          control={form.control}
          name="measurable"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How will progress be measured?</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Define criteria for measuring progress" 
                  {...field}
                  value={field.value || ''} 
                />
              </FormControl>
              <FormDescription>
                Measurable tasks have clear criteria to track progress and completion.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="metrics"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Key Metrics</FormLabel>
              <FormControl>
                <Input 
                  placeholder="E.g., 'Increase sales by 10%', '5 new clients'" 
                  {...field}
                  value={field.value || ''} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>
      
      <FormSection title="Achievable">
        <div className="grid grid-cols-1 gap-4">
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
                    Is this task realistic with available resources?
                  </FormLabel>
                  <FormDescription>
                    Achievable tasks can be completed with the resources, time, and skills available.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="resources_needed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resources Needed</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="List any resources, tools, or support needed" 
                    {...field}
                    value={field.value || ''} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="obstacles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Potential Obstacles</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Identify any potential challenges" 
                    {...field}
                    value={field.value || ''} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>
      
      <FormSection title="Relevant">
        <FormField
          control={form.control}
          name="relevant"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Why is this task important?</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Explain how this task aligns with broader goals" 
                  {...field}
                  value={field.value || ''} 
                />
              </FormControl>
              <FormDescription>
                Relevant tasks align with your wider objectives and move you toward important goals.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="dependencies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dependencies</FormLabel>
              <FormControl>
                <Input 
                  placeholder="List any tasks this depends on" 
                  {...field}
                  value={field.value || ''} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>
      
      <FormSection title="Time-bound">
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
                  Has a defined deadline or timeframe
                </FormLabel>
                <FormDescription>
                  Time-bound tasks have clear deadlines to create urgency and prevent procrastination.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field}
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} 
                    onChange={(e) => {
                      if (e.target.value) {
                        field.onChange(new Date(e.target.value));
                      } else {
                        field.onChange(undefined);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex flex-col space-y-2">
            <FormField
              control={form.control}
              name="has_subtasks"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="m-0">Has Subtasks</FormLabel>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="has_reverse_plan"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="m-0">Use Reverse Planning</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>
      </FormSection>
    </div>
  );
};

export default SmartTaskFields;
