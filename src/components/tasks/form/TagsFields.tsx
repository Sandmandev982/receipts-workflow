
import React, { useState, useRef, KeyboardEvent } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Tag, X } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

interface TagsFieldsProps {
  form: UseFormReturn<any>;
}

const TagsFields: React.FC<TagsFieldsProps> = ({ form }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Get current tags as array
  const currentTags = form.watch('tags') ? form.watch('tags').split(',').map((t: string) => t.trim()).filter(Boolean) : [];
  
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;
    
    // Get current tags, avoid duplicates
    const updatedTags = [...new Set([...currentTags, trimmedTag])];
    form.setValue('tags', updatedTags.join(', '), { shouldValidate: true });
    setInputValue('');
  };
  
  const removeTag = (tagToRemove: string) => {
    const updatedTags = currentTags.filter(tag => tag !== tagToRemove);
    form.setValue('tags', updatedTags.join(', '), { shouldValidate: true });
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    }
  };
  
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <FormSection>
      <FormField
        control={form.control}
        name="tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tags</FormLabel>
            <FormControl>
              <div className="space-y-2">
                <div className="flex">
                  <Input
                    ref={inputRef}
                    placeholder="Add tag and press Enter"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    className="ml-2"
                    onClick={() => {
                      addTag(inputValue);
                      focusInput();
                    }}
                  >
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
                
                {currentTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {currentTags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="rounded-full p-0.5 hover:bg-secondary/80"
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove {tag} tag</span>
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Hidden input field to store the comma-separated tags */}
                <input type="hidden" {...field} />
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
