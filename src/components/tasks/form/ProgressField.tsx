
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import FormSection from './FormSection';

interface ProgressFieldProps {
  form: UseFormReturn<any>;
}

const ProgressField: React.FC<ProgressFieldProps> = ({ form }) => {
  return (
    <FormSection>
      <FormField
        control={form.control}
        name="progress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Progress: {field.value}%</FormLabel>
            <FormControl>
              <Slider
                defaultValue={[field.value]}
                max={100}
                step={5}
                onValueChange={(vals) => field.onChange(vals[0])}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
};

export default ProgressField;
