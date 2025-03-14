
import React from 'react';
import { Search, Calendar, Filter, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';

export interface TaskFilters {
  status: string[];
  priority: string[];
  tags: string[];
  dueDate: string;
  assignedTo?: string[];
  dateRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

export interface TaskFilterProps {
  onSearch: (term: string) => void;
  onFilterChange: (newFilters: TaskFilters) => void;
  onClearFilters: () => void;
  availableTags: string[];
  teamMembers?: Array<{ id: string; name: string }>;
}

const TaskFilter: React.FC<TaskFilterProps> = ({
  onSearch,
  onFilterChange,
  onClearFilters,
  availableTags,
  teamMembers = [],
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filters, setFilters] = React.useState<TaskFilters>({
    status: [],
    priority: [],
    tags: [],
    dueDate: 'all',
    assignedTo: [],
    dateRange: {
      from: undefined,
      to: undefined,
    },
  });
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = React.useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  const handleStatusChange = (value: string) => {
    const newStatus = value ? [value] : [];
    const newFilters = { ...filters, status: newStatus };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriorityChange = (value: string) => {
    const newPriority = value ? [value] : [];
    const newFilters = { ...filters, priority: newPriority };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDueDateChange = (value: string) => {
    const newFilters = { ...filters, dueDate: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTagSelect = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    const newFilters = { ...filters, tags: newTags };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateRangeSelect = (range: { from: Date | undefined; to: Date | undefined }) => {
    const newFilters = { ...filters, dateRange: range };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleAssigneeSelect = (memberId: string, isChecked: boolean) => {
    const newAssignees = isChecked
      ? [...(filters.assignedTo || []), memberId]
      : (filters.assignedTo || []).filter(id => id !== memberId);
    
    const newFilters = { ...filters, assignedTo: newAssignees };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      status: [],
      priority: [],
      tags: [],
      dueDate: 'all',
      assignedTo: [],
      dateRange: {
        from: undefined,
        to: undefined,
      },
    });
    onClearFilters();
  };

  const hasActiveFilters = searchTerm || 
    filters.status.length > 0 || 
    filters.priority.length > 0 || 
    filters.tags.length > 0 || 
    filters.dueDate !== 'all' ||
    (filters.assignedTo && filters.assignedTo.length > 0) ||
    (filters.dateRange?.from || filters.dateRange?.to);

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search tasks..."
            className="pl-9"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select
            value={filters.status[0] || ''}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-statuses">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={filters.priority[0] || ''}
            onValueChange={handlePriorityChange}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-priorities">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={filters.dueDate}
            onValueChange={handleDueDateChange}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Due Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Advanced Filters</h4>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="date-range">
                    <AccordionTrigger>Date Range</AccordionTrigger>
                    <AccordionContent>
                      <div className="p-2">
                        <CalendarComponent
                          mode="range"
                          selected={filters.dateRange as any}
                          onSelect={handleDateRangeSelect as any}
                          className="rounded-md border"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  {teamMembers.length > 0 && (
                    <AccordionItem value="assignees">
                      <AccordionTrigger>Assignees</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {teamMembers.map(member => (
                            <div key={member.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`assignee-${member.id}`} 
                                checked={filters.assignedTo?.includes(member.id)}
                                onCheckedChange={(checked) => 
                                  handleAssigneeSelect(member.id, checked as boolean)
                                }
                              />
                              <label htmlFor={`assignee-${member.id}`} className="text-sm">
                                {member.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => (
            <Badge
              key={tag}
              variant={filters.tags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleTagSelect(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
      
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-muted-foreground"
          >
            <Filter className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskFilter;
