
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TaskSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const TaskSearchBar: React.FC<TaskSearchBarProps> = ({ 
  searchTerm, 
  onSearchChange 
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
      <Input
        placeholder="Search tasks..."
        className="pl-9"
        value={searchTerm}
        onChange={handleSearchChange}
      />
    </div>
  );
};

export default TaskSearchBar;
