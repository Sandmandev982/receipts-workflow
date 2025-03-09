
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Task } from './TaskCard';
import TaskCard from './TaskCard';
import TaskFilter, { TaskFilters } from './TaskFilter';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import TaskForm from './TaskForm';
import { isToday, isTomorrow, isThisWeek, isThisMonth, format } from 'date-fns';

interface TaskListProps {
  title: string;
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
  onSetReminder?: (id: string, reminderTime: string) => void;
  loading?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  title,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onSetReminder,
  loading = false,
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<TaskFilters>({
    status: [],
    priority: [],
    tags: [],
    dueDate: 'all',
  });
  
  // Process all unique tags from tasks
  const availableTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach(task => {
      if (task.tags) {
        task.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet);
  }, [tasks]);
  
  // Filter tasks based on search term and filters
  const filteredTasks = React.useMemo(() => {
    return tasks.filter(task => {
      // Search term filter
      if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !task.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(task.status)) {
        return false;
      }
      
      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
        return false;
      }
      
      // Tags filter
      if (filters.tags.length > 0 && (!task.tags || !filters.tags.some(tag => task.tags?.includes(tag)))) {
        return false;
      }
      
      // Due date filter
      if (filters.dueDate !== 'all') {
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        if (!dueDate) return filters.dueDate === 'all';
        
        switch (filters.dueDate) {
          case 'today':
            return isToday(dueDate);
          case 'tomorrow':
            return isTomorrow(dueDate);
          case 'this-week':
            return isThisWeek(dueDate, { weekStartsOn: 1 });
          case 'this-month':
            return isThisMonth(dueDate);
          default:
            return true;
        }
      }
      
      return true;
    });
  }, [tasks, searchTerm, filters]);
  
  const handleSubmit = (data: any) => {
    // Process tags
    const tags = data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [];
    
    onAddTask({
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate,
      dueTime: data.dueTime,
      reminderSet: data.reminderEnabled,
      reminderTime: data.reminderEnabled ? data.reminderTime : null,
      progress: parseInt(data.progress, 10),
      tags: tags.length > 0 ? tags : null,
    });
    setOpen(false);
  };
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  const handleFilterChange = (newFilters: TaskFilters) => {
    setFilters(newFilters);
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({
      status: [],
      priority: [],
      tags: [],
      dueDate: 'all',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-1" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md md:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <TaskForm onSubmit={handleSubmit} />
          </DialogContent>
        </Dialog>
      </div>
      
      <TaskFilter 
        onSearch={handleSearch} 
        onFilterChange={handleFilterChange} 
        onClearFilters={handleClearFilters}
        availableTags={availableTags}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onStatusChange={onStatusChange}
              onSetReminder={onSetReminder}
            />
          ))
        ) : (
          <p className="text-muted-foreground col-span-full text-center py-8">
            {tasks.length > 0 
              ? 'No tasks match your filters. Try adjusting your search or filter criteria.' 
              : 'No tasks available. Click "Add Task" to create a new task.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default TaskList;
