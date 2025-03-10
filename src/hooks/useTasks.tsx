
import { useState, useEffect } from 'react';
import { Task } from '@/components/tasks/types';
import { useAuth } from '@/hooks/useAuth';
import { TaskService } from '@/services/TaskService';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    const fetchTasks = async () => {
      setLoading(true);
      const fetchedTasks = await TaskService.fetchTasks(user.id);
      setTasks(fetchedTasks);
      setLoading(false);
    };

    fetchTasks();
  }, [user]);

  const addTask = async (newTask: Omit<Task, 'id'>) => {
    if (!user) return;
    
    const task = await TaskService.addTask(newTask, user.id);
    if (task) {
      setTasks(prevTasks => [task, ...prevTasks]);
    }
  };

  const updateTask = async (updatedTask: Task) => {
    const success = await TaskService.updateTask(updatedTask);
    if (success) {
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        )
      );
    }
  };

  const deleteTask = async (id: string) => {
    const success = await TaskService.deleteTask(id);
    if (success) {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    }
  };

  const updateTaskStatus = async (id: string, status: Task['status']) => {
    const success = await TaskService.updateTaskStatus(id, status);
    if (success) {
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id ? { ...task, status } : task
        )
      );
    }
  };

  const setTaskReminder = async (id: string, reminderTime: string) => {
    const success = await TaskService.setTaskReminder(id, reminderTime);
    if (success) {
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id ? { ...task, reminderSet: true, reminderTime } : task
        )
      );
    }
  };

  // Calculate task counts for dashboard
  const taskCounts = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'complete').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    dueToday: tasks.filter(t => {
      if (!t.dueDate) return false;
      const today = new Date();
      const taskDate = new Date(t.dueDate);
      return taskDate.getDate() === today.getDate() &&
        taskDate.getMonth() === today.getMonth() &&
        taskDate.getFullYear() === today.getFullYear();
    }).length,
  };

  return {
    tasks,
    loading,
    taskCounts,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    setTaskReminder
  };
};
