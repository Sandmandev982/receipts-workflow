
import React from 'react';
import { Search, Filter, Calendar, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Task } from './TaskCard';
import { Badge } from '@/components/ui/badge';

interface TaskFilterProps {
  onSearch: (searchTerm: string) => void;
  onFilterChange: (filters: TaskFilters) => void;
  onClearFilters: () => void;
  availableTags: string[];
}

export interface TaskFilters {
  status: string[];
  priority: string[];
  tags: string[];
  dueDate: 'all' | 'today' | 'tomorrow' | 'this-week' | 'this-month';
}

const TaskFilter: React.FC<TaskFilterProps> = ({
  onSearch,
  onFilterChange,
  onClearFilters,
  availableTags,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filters, setFilters] = React.useState<TaskFilters>({
    status: [],
    priority: [],
    tags: [],
    dueDate: 'all',
  });
  const [activeFiltersCount, setActiveFiltersCount] = React.useState(0);

  // Count active filters for the filter badge
  React.useEffect(() => {
    let count = 0;
    if (filters.status.length) count++;
    if (filters.priority.length) count++;
    if (filters.tags.length) count++;
    if (filters.dueDate !== 'all') count++;
    
    setActiveFiltersCount(count);
  }, [filters]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  // Toggle filter values
  const toggleFilter = (type: keyof TaskFilters, value: string) => {
    setFilters(prev => {
      let newFilters;
      
      if (type === 'dueDate') {
        newFilters = {
          ...prev,
          [type]: value,
        };
      } else {
        const currentValues = prev[type] as string[];
        newFilters = {
          ...prev,
          [type]: currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value],
        };
      }
      
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      status: [],
      priority: [],
      tags: [],
      dueDate: 'all',
    });
    setSearchTerm('');
    onClearFilters();
  };

  return (
    <div className="mb-6 space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearchTerm('');
                onSearch('');
              }}
              className="absolute right-1 top-1 h-7 w-7"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex gap-1">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={filters.status.includes('pending')}
              onCheckedChange={() => toggleFilter('status', 'pending')}
            >
              Pending
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.status.includes('in-progress')}
              onCheckedChange={() => toggleFilter('status', 'in-progress')}
            >
              In Progress
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.status.includes('complete')}
              onCheckedChange={() => toggleFilter('status', 'complete')}
            >
              Complete
            </DropdownMenuCheckboxItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={filters.priority.includes('high')}
              onCheckedChange={() => toggleFilter('priority', 'high')}
            >
              High
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.priority.includes('medium')}
              onCheckedChange={() => toggleFilter('priority', 'medium')}
            >
              Medium
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.priority.includes('low')}
              onCheckedChange={() => toggleFilter('priority', 'low')}
            >
              Low
            </DropdownMenuCheckboxItem>
            
            {availableTags.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
                {availableTags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={filters.tags.includes(tag)}
                    onCheckedChange={() => toggleFilter('tags', tag)}
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))}
              </>
            )}
            
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel>Filter by Due Date</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={filters.dueDate === 'all'}
              onCheckedChange={() => toggleFilter('dueDate', 'all')}
            >
              All Dates
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.dueDate === 'today'}
              onCheckedChange={() => toggleFilter('dueDate', 'today')}
            >
              Due Today
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.dueDate === 'tomorrow'}
              onCheckedChange={() => toggleFilter('dueDate', 'tomorrow')}
            >
              Due Tomorrow
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.dueDate === 'this-week'}
              onCheckedChange={() => toggleFilter('dueDate', 'this-week')}
            >
              Due This Week
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.dueDate === 'this-month'}
              onCheckedChange={() => toggleFilter('dueDate', 'this-month')}
            >
              Due This Month
            </DropdownMenuCheckboxItem>
            
            <DropdownMenuSeparator />
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-left px-2 font-normal h-8"
              onClick={handleClearFilters}
            >
              Clear All Filters
            </Button>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Due Date</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuCheckboxItem
              checked={filters.dueDate === 'all'}
              onCheckedChange={() => toggleFilter('dueDate', 'all')}
            >
              All Dates
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.dueDate === 'today'}
              onCheckedChange={() => toggleFilter('dueDate', 'today')}
            >
              Today
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.dueDate === 'tomorrow'}
              onCheckedChange={() => toggleFilter('dueDate', 'tomorrow')}
            >
              Tomorrow
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.dueDate === 'this-week'}
              onCheckedChange={() => toggleFilter('dueDate', 'this-week')}
            >
              This Week
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.dueDate === 'this-month'}
              onCheckedChange={() => toggleFilter('dueDate', 'this-month')}
            >
              This Month
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Active filters display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {filters.status.map(status => (
            <Badge key={status} variant="secondary" className="px-2 py-1">
              {status}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleFilter('status', status)}
                className="h-4 w-4 ml-1 -mr-1"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
          
          {filters.priority.map(priority => (
            <Badge key={priority} variant="secondary" className="px-2 py-1">
              {priority} priority
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleFilter('priority', priority)}
                className="h-4 w-4 ml-1 -mr-1"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
          
          {filters.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="px-2 py-1">
              #{tag}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleFilter('tags', tag)}
                className="h-4 w-4 ml-1 -mr-1"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
          
          {filters.dueDate !== 'all' && (
            <Badge variant="secondary" className="px-2 py-1">
              Due: {filters.dueDate.replace('-', ' ')}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleFilter('dueDate', 'all')}
                className="h-4 w-4 ml-1 -mr-1"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-xs h-7"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskFilter;
