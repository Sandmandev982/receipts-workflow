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

interface TeamTasksListProps {
  teamId: string;
}

// Sample tasks data (replace with your actual data fetching logic)
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
  const { session } = useAuth();

  useEffect(() => {
    fetchTeamTasks();
  }, [teamId, session]);

  const fetchTeamTasks = async () => {
    setLoading(true);
    try {
      // Simulate fetching tasks from Supabase
      setTimeout(async () => {
        setTasks(sampleTasks);
        setLoading(false);
      }, 1000);
      
      // Convert task due_date from Date to string when inserting into Supabase
      const tasksWithStringDates = sampleTasks.map(task => ({
        ...task,
        due_date: formatDateForSupabase(task.due_date)
      }));
      
      // Insert tasks one by one instead of as an array
      for (const task of tasksWithStringDates) {
        const { error } = await supabase
          .from('tasks')
          .insert(task);
          
        if (error) {
          console.error("Error inserting task:", error);
        }
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
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
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    // Simulate updating task status
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(
      tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    setIsEditDialogOpen(false);
  };

  const handleTaskCreate = (newTask: Task) => {
    setTasks([...tasks, newTask]);
    setIsTaskFormOpen(false);
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

      <TaskFilter />

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
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        task={selectedTask}
        onUpdate={handleTaskUpdate}
      />

      <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <TaskForm onCreate={handleTaskCreate} onClose={() => setIsTaskFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamTasksList;
