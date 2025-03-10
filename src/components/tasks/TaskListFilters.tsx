
import React from 'react';
import TaskFilter, { TaskFilters } from './TaskFilter';
import { useToast } from '@/hooks/use-toast';

interface TaskListFiltersProps {
  availableTags: string[];
  teamMembers: Array<{ id: string; name: string }>;
  onFilteredTasksChange: (filteredTasks: TaskFilters) => void;
  onSearchTermChange: (term: string) => void;
}

const TaskListFilters: React.FC<TaskListFiltersProps> = ({
  availableTags,
  teamMembers,
  onFilteredTasksChange,
  onSearchTermChange
}) => {
  const { toast } = useToast();
  
  const handleSearch = (term: string) => {
    onSearchTermChange(term);
  };
  
  const handleFilterChange = (newFilters: TaskFilters) => {
    onFilteredTasksChange(newFilters);
  };
  
  const handleClearFilters = () => {
    onSearchTermChange('');
    onFilteredTasksChange({
      status: [],
      priority: [],
      tags: [],
      dueDate: 'all',
    });
  };

  return (
    <TaskFilter 
      onSearch={handleSearch} 
      onFilterChange={handleFilterChange} 
      onClearFilters={handleClearFilters}
      availableTags={availableTags}
      teamMembers={teamMembers}
    />
  );
};

export default TaskListFilters;
