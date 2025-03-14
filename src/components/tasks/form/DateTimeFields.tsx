
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import FormSection from './FormSection';

interface DateTimeFieldsProps {
  form: UseFormReturn<any>;
}

const TIME_OPTIONS = [
  "12:00 AM", "1:00 AM", "2:00 AM", "3:00 AM", "4:00 AM", "5:00 AM", 
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", 
  "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM"
];

const DateTimeFields: React.FC<DateTimeFieldsProps> = ({ form }) => {
  const [timePickerOpen, setTimePickerOpen] = useState(false);

  return (
    <FormSection>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="dueTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Time (Optional)</FormLabel>
              <FormControl>
                <div className="flex">
                  <Popover open={timePickerOpen} onOpenChange={setTimePickerOpen}>
                    <PopoverTrigger asChild>
                      <div className="flex-1 flex">
                        <Input 
                          placeholder="e.g., 3:00 PM" 
                          {...field} 
                          className="rounded-r-none"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon" 
                          className="rounded-l-none border-l-0"
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0" align="end">
                      <div className="max-h-[300px] overflow-y-auto p-1">
                        {TIME_OPTIONS.map((time) => (
                          <Button
                            key={time}
                            variant="ghost"
                            className="w-full justify-start text-left font-normal"
                            onClick={() => {
                              field.onChange(time);
                              setTimePickerOpen(false);
                            }}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormSection>
  );
};

export default DateTimeFields;
