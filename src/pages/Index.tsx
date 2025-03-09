
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import SummaryCards from '@/components/dashboard/SummaryCards';
import TaskList from '@/components/tasks/TaskList';
import TaskEditDialog from '@/components/tasks/TaskEditDialog';
import ProgressChart from '@/components/dashboard/ProgressChart';
import { Task } from '@/components/tasks/TaskCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TaskRow } from '@/types/database.types';

const Index = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch tasks from Supabase
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if (!user) return;
        
        setLoading(true);
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Transform Supabase data to match our Task interface
        const formattedTasks: Task[] = (data as TaskRow[]).map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          priority: task.priority as Task['priority'],
          status: task.status as Task['status'],
          dueDate: task.due_date ? new Date(task.due_date) : new Date(),
          assignedTo: {
            name: user.email?.split('@')[0] || 'User',
            initials: (user.email?.substring(0, 2) || 'U').toUpperCase(),
          },
        }));
        
        setTasks(formattedTasks);
      } catch (error: any) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  // Task counts for summary cards
  const taskCounts = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'complete').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    dueToday: tasks.filter(t => {
      const today = new Date();
      const taskDate = new Date(t.dueDate);
      return taskDate.getDate() === today.getDate() &&
        taskDate.getMonth() === today.getMonth() &&
        taskDate.getFullYear() === today.getFullYear();
    }).length,
  };

  // Data for progress chart
  const chartData = [
    { name: 'Completed', value: taskCounts.completed, color: '#28A745' },
    { name: 'In Progress', value: taskCounts.inProgress, color: '#007BFF' },
    { name: 'Pending', value: taskCounts.pending, color: '#FFC107' },
  ];

  const handleAddTask = async (newTask: Omit<Task, 'id'>) => {
    try {
      if (!user) return;
      
      // Insert task into Supabase
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          status: newTask.status,
          due_date: newTask.dueDate.toISOString(),
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Create task object with Supabase data
      const taskData = data as TaskRow;
      const task: Task = {
        id: taskData.id,
        title: taskData.title,
        description: taskData.description || '',
        priority: taskData.priority as Task['priority'],
        status: taskData.status as Task['status'],
        dueDate: new Date(taskData.due_date || Date.now()),
        assignedTo: {
          name: user.email?.split('@')[0] || 'User',
          initials: (user.email?.substring(0, 2) || 'U').toUpperCase(),
        },
      };
      
      setTasks([task, ...tasks]);
      toast.success('Task added successfully');
    } catch (error: any) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleDeleteTask = async (id: string) => {
    try {
      // Delete task from Supabase
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setTasks(tasks.filter(task => task.id !== id));
      toast.success('Task deleted successfully');
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (id: string, status: Task['status']) => {
    try {
      // Update task status in Supabase
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, status } : task
      ));
      toast.success(`Task marked as ${status}`);
    } catch (error: any) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const handleUpdateTask = async (updatedTask: Omit<Task, 'id'> & { id?: string }) => {
    try {
      if (!user) return;
      
      if (updatedTask.id) {
        // Update existing task in Supabase
        const { error } = await supabase
          .from('tasks')
          .update({
            title: updatedTask.title,
            description: updatedTask.description,
            priority: updatedTask.priority,
            status: updatedTask.status,
            due_date: updatedTask.dueDate.toISOString(),
          })
          .eq('id', updatedTask.id);
        
        if (error) throw error;
        
        // Update task in state
        setTasks(tasks.map(task => 
          task.id === updatedTask.id ? { ...task, ...updatedTask } as Task : task
        ));
        toast.success('Task updated successfully');
      } else {
        // Add new task
        await handleAddTask(updatedTask);
      }
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        <SummaryCards tasks={taskCounts} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProgressChart data={chartData} />
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            {loading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks
                  .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
                  .slice(0, 3)
                  .map(task => (
                    <div key={task.id} className="bg-card p-3 rounded-md border border-border flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="text-sm text-muted-foreground">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        task.status === 'complete' ? 'bg-receipts-success/10 text-receipts-success' :
                        task.status === 'in-progress' ? 'bg-receipts-blue/10 text-receipts-blue' :
                        'bg-receipts-yellow/10 text-receipts-yellow'
                      }`}>
                        {task.status.replace('-', ' ')}
                      </div>
                    </div>
                  ))
                }
              </div>
            ) : (
              <div className="text-center p-6 bg-card rounded-md border border-border">
                <p className="text-muted-foreground">No tasks found. Add a task to get started.</p>
              </div>
            )}
          </div>
        </div>
        
        <TaskList
          title="All Tasks"
          tasks={tasks}
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onStatusChange={handleStatusChange}
          loading={loading}
        />
        
        <TaskEditDialog
          task={editingTask}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleUpdateTask}
        />
      </div>
    </Layout>
  );
};

export default Index;
