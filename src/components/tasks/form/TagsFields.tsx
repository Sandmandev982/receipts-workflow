
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Tag } from 'lucide-react';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FormSection from './FormSection';

interface TagsFieldsProps {
  form: UseFormReturn<any>;
}

const TagsFields: React.FC<TagsFieldsProps> = ({ form }) => {
  return (
    <FormSection>
      <FormField
        control={form.control}
        name="tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tags (comma separated)</FormLabel>
            <FormControl>
              <div className="flex">
                <Input placeholder="work, important, project" {...field} />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  className="ml-2"
                >
                  <Tag className="h-4 w-4" />
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
};

export default TagsFields;
