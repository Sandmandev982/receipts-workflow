
import React, { useState, useMemo } from 'react';
import { Task } from './types';
import TaskHeaderBar from './TaskHeaderBar';
import TaskListFilters from './TaskListFilters';
import TaskGridView from './TaskGridView';
import TaskEditDialog from './TaskEditDialog';
import { useToast } from '@/hooks/use-toast';
import { isToday, isTomorrow, isThisWeek, isThisMonth, isBefore } from 'date-fns';
import { TaskFilters } from './TaskFilter';

interface TaskListProps {
  title: string;
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
  onSetReminder?: (id: string, reminderTime: string) => void;
  loading?: boolean;
  teamMembers?: Array<{ id: string; name: string }>;
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
  teamMembers = [],
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<TaskFilters>({
    status: [],
    priority: [],
    tags: [],
    dueDate: 'all',
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Helper function to safely check if an assignedTo is an object with an ID
  const isAssignedToObject = (assigned: any): assigned is { id: string; name: string; initials?: string; avatar?: string } => {
    return typeof assigned === 'object' && assigned !== null && 'id' in assigned;
  };
  
  // Process all unique tags from tasks
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach(task => {
      if (task.tags) {
        task.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet);
  }, [tasks]);
  
  // Filter tasks based on search term and filters
  const filteredTasks = useMemo(() => {
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
      
      // Assignee filter
      if (filters.assignedTo && filters.assignedTo.length > 0) {
        if (!task.assignedTo) return false;
        
        const assignedId = isAssignedToObject(task.assignedTo) 
          ? task.assignedTo.id 
          : task.assignedTo;
          
        if (!filters.assignedTo.includes(assignedId)) {
          return false;
        }
      }
      
      // Due date filter
      if (filters.dueDate !== 'all' || filters.dateRange?.from || filters.dateRange?.to) {
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        if (!dueDate) return filters.dueDate === 'all' && !filters.dateRange?.from && !filters.dateRange?.to;
        
        // Check date range if specified
        if (filters.dateRange?.from || filters.dateRange?.to) {
          const isAfterFrom = !filters.dateRange.from || dueDate >= filters.dateRange.from;
          const isBeforeTo = !filters.dateRange.to || dueDate <= filters.dateRange.to;
          if (!isAfterFrom || !isBeforeTo) return false;
        }
        
        // Check predefined date filters
        if (filters.dueDate !== 'all') {
          switch (filters.dueDate) {
            case 'today':
              return isToday(dueDate);
            case 'tomorrow':
              return isTomorrow(dueDate);
            case 'this-week':
              return isThisWeek(dueDate, { weekStartsOn: 1 });
            case 'this-month':
              return isThisMonth(dueDate);
            case 'overdue':
              return isBefore(dueDate, new Date()) && task.status !== 'complete';
            default:
              return true;
          }
        }
      }
      
      return true;
    });
  }, [tasks, searchTerm, filters]);
  
  const handleTaskUpdate = (data: any) => {
    onAddTask(data);
    
    toast({
      title: "Task Created",
      description: "Your task has been successfully created.",
    });
  };
  
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setEditDialogOpen(true);
  };
  
  const handleEditSubmit = (taskData: Omit<Task, 'id'> & { id?: string }) => {
    if (taskData.id) {
      onEditTask({ ...taskData, id: taskData.id } as Task);
      toast({
        title: "Task Updated",
        description: "Your task has been successfully updated.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <TaskHeaderBar 
        title={title}
        open={open}
        setOpen={setOpen}
        onAddTask={handleTaskUpdate}
        teamMembers={teamMembers}
      />
      
      <TaskListFilters 
        availableTags={availableTags}
        teamMembers={teamMembers}
        onFilteredTasksChange={setFilters}
        onSearchTermChange={setSearchTerm}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TaskGridView
          tasks={tasks}
          filteredTasks={filteredTasks}
          loading={loading}
          onEditTask={handleEditTask}
          onDeleteTask={onDeleteTask}
          onStatusChange={onStatusChange}
        />
      </div>
      
      <TaskEditDialog
        task={selectedTask}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditSubmit}
        teamMembers={teamMembers}
      />
    </div>
  );
};

export default TaskList;
