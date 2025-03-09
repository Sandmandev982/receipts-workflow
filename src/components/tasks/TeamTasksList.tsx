
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Task } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import TaskCard from './TaskCard';
import TaskFilter from './TaskFilter';
import TaskEditDialog from './TaskEditDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import TaskForm from './TaskForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface TeamTasksListProps {
  teamId: string;
}

// Convert Date to string format for Supabase
const formatDateForSupabase = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

const TeamTasksList: React.FC<TeamTasksListProps> = ({ teamId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const { session, user } = useAuth();

  useEffect(() => {
    fetchTeamTasks();
  }, [teamId, session]);

  const fetchTeamTasks = async () => {
    setLoading(true);
    try {
      // For now, we'll use sample tasks but in a real app we'd fetch from Supabase
      setTimeout(() => {
        setTasks(sampleTasks);
        setLoading(false);
      }, 1000);
      
      // This insert functionality is removed as it's just sample data
      // Instead we'll add proper error handling
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch team tasks');
      setLoading(false);
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditDialogOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    // Simulate deleting a task
    setTasks(tasks.filter((task) => task.id !== taskId));
    toast.success('Task deleted successfully');
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    // Simulate updating task status
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    toast.success(`Task status updated to ${newStatus}`);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(
      tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    setIsEditDialogOpen(false);
    toast.success('Task updated successfully');
  };

  const handleTaskCreate = (newTask: Omit<Task, 'id'> & { id?: string }) => {
    // Generate a random ID for the sample task
    const taskWithId: Task = {
      ...newTask,
      id: newTask.id || Math.random().toString(36).substring(2, 11)
    } as Task;
    
    setTasks([...tasks, taskWithId]);
    setIsTaskFormOpen(false);
    toast.success('Task created successfully');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Team Tasks</h2>
        <Button onClick={() => setIsTaskFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* We'll implement a proper TaskFilter component later */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">All Tasks</Button>
          <Button variant="outline" size="sm">My Tasks</Button>
          <Button variant="outline" size="sm">Pending</Button>
          <Button variant="outline" size="sm">In Progress</Button>
          <Button variant="outline" size="sm">Completed</Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border rounded-md p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => handleEditTask(task)}
              onDelete={() => handleDeleteTask(task.id)}
              onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus)}
            />
          ))}
        </div>
      )}

      <TaskEditDialog
        task={selectedTask}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleTaskUpdate}
        teamMembers={[]}
      />

      <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <TaskForm 
            onSubmit={handleTaskCreate}
            teamMembers={[]} 
            teams={[]}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Sample tasks data
const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Design Sprint',
    description: 'Plan and execute design sprint for new feature',
    priority: 'high',
    status: 'in-progress',
    dueDate: new Date('2024-08-10'),
    dueTime: '10:00',
    reminderSet: true,
    reminderTime: '09:30',
    progress: 50,
    tags: ['design', 'sprint'],
  },
  {
    id: '2',
    title: 'Code Review',
    description: 'Review code for performance and security issues',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date('2024-08-15'),
    dueTime: '14:00',
    reminderSet: false,
    progress: 0,
    tags: ['code', 'review'],
  },
  {
    id: '3',
    title: 'Client Meeting',
    description: 'Prepare and conduct client meeting',
    priority: 'low',
    status: 'complete',
    dueDate: new Date('2024-08-20'),
    dueTime: '16:00',
    reminderSet: true,
    reminderTime: '15:30',
    progress: 100,
    tags: ['client', 'meeting'],
  },
];

export default TeamTasksList;
