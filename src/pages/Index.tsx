
import React from 'react';
import Layout from '@/components/layout/Layout';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import TaskManager from '@/components/tasks/TaskManager';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user } = useAuth();
  const { 
    tasks, 
    loading, 
    taskCounts,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    setTaskReminder
  } = useTasks();
  
  // Define team members for demonstration
  // In a real application, these would come from your database
  const teamMembers = [
    { id: user?.id || 'current-user', name: user?.email?.split('@')[0] || 'Current User' }
  ];

  // Get recent tasks for dashboard
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
    .slice(0, 3);

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        <DashboardOverview 
          taskCounts={taskCounts}
          recentTasks={recentTasks}
          loading={loading}
        />
        
        <TaskManager
          tasks={tasks}
          loading={loading}
          onAddTask={addTask}
          onEditTask={updateTask}
          onDeleteTask={deleteTask}
          onStatusChange={updateTaskStatus}
          onSetReminder={setTaskReminder}
          teamMembers={teamMembers}
        />
      </div>
    </Layout>
  );
};

export default Index;
