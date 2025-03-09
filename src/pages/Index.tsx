
import React, { useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import Layout from '@/components/layout/Layout';
import SummaryCards from '@/components/dashboard/SummaryCards';
import TaskList from '@/components/tasks/TaskList';
import TaskEditDialog from '@/components/tasks/TaskEditDialog';
import ProgressChart from '@/components/dashboard/ProgressChart';
import { Task } from '@/components/tasks/TaskCard';
import { ThemeProvider } from '@/hooks/useTheme';

// Mock data for initial tasks
const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Implement dashboard design',
    description: 'Create the UI components for the main dashboard including summary cards and task lists.',
    priority: 'high',
    status: 'in-progress',
    dueDate: new Date(Date.now() + 86400000), // tomorrow
    assignedTo: {
      name: 'John Doe',
      initials: 'JD',
    },
  },
  {
    id: '2',
    title: 'Set up authentication',
    description: 'Integrate Supabase authentication for user login and registration.',
    priority: 'high',
    status: 'pending',
    dueDate: new Date(Date.now() + 172800000), // day after tomorrow
    assignedTo: {
      name: 'Alex Smith',
      initials: 'AS',
    },
  },
  {
    id: '3',
    title: 'Design team collaboration features',
    description: 'Sketch and wireframe the team collaboration interface including chat and task assignment.',
    priority: 'medium',
    status: 'complete',
    dueDate: new Date(Date.now() - 86400000), // yesterday
    assignedTo: {
      name: 'Sarah Johnson',
      initials: 'SJ',
    },
  },
];

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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

  const handleAddTask = (newTask: Omit<Task, 'id'>) => {
    const task: Task = {
      ...newTask,
      id: uuidv4(),
      assignedTo: {
        name: 'John Doe',
        initials: 'JD',
      },
    };
    setTasks([...tasks, task]);
    toast.success('Task added successfully');
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast.success('Task deleted successfully');
  };

  const handleStatusChange = (id: string, status: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status } : task
    ));
    toast.success(`Task marked as ${status}`);
  };

  const handleUpdateTask = (updatedTask: Omit<Task, 'id'> & { id?: string }) => {
    if (updatedTask.id) {
      // Update existing task
      setTasks(tasks.map(task => 
        task.id === updatedTask.id ? { ...task, ...updatedTask } as Task : task
      ));
      toast.success('Task updated successfully');
    } else {
      // Add new task
      const task: Task = {
        ...updatedTask as Omit<Task, 'id'>,
        id: uuidv4(),
        assignedTo: {
          name: 'John Doe',
          initials: 'JD',
        },
      };
      setTasks([...tasks, task]);
      toast.success('Task added successfully');
    }
  };

  return (
    <ThemeProvider>
      <Layout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          
          <SummaryCards tasks={taskCounts} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProgressChart data={chartData} />
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
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
            </div>
          </div>
          
          <TaskList
            title="All Tasks"
            tasks={tasks}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
          
          <TaskEditDialog
            task={editingTask}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSubmit={handleUpdateTask}
          />
        </div>
      </Layout>
    </ThemeProvider>
  );
};

export default Index;
