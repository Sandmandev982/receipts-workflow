
import React from 'react';
import Layout from '@/components/layout/Layout';
import TaskManager from '@/components/tasks/TaskManager';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';

const Tasks = () => {
  const { user } = useAuth();
  const { 
    tasks, 
    loading, 
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    setTaskReminder
  } = useTasks();
  
  // Define team members for tasks
  const teamMembers = [
    { id: user?.id || 'current-user', name: user?.email?.split('@')[0] || 'Current User' }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        
        <p className="text-muted-foreground">
          Manage your tasks, set priorities, track progress, and collaborate with your team.
        </p>
        
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

export default Tasks;
