
import React, { useEffect, useState } from 'react';
import { Task } from '@/components/tasks/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Filter, Calendar } from 'lucide-react';
import { TaskService } from '@/services/TaskService';
import { useAuth } from '@/hooks/useAuth';
import TaskCard from '@/components/tasks/TaskCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import TaskForm from '@/components/tasks/TaskForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import CalendarIntegrationButton from '@/components/calendar/CalendarIntegrationButton';

interface TeamTasksListProps {
  teamId: string;
  teamName: string;
}

const TeamTasksList: React.FC<TeamTasksListProps> = ({ teamId, teamName }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('all');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (teamId) {
      fetchTeamTasks();
    }
  }, [teamId]);

  const fetchTeamTasks = async () => {
    setLoading(true);
    const teamTasks = await TaskService.fetchTeamTasks(teamId);
    setTasks(teamTasks);
    setLoading(false);
  };

  const handleTaskCreated = (task: Task) => {
    setTasks(prev => [task, ...prev]);
    setCreateTaskOpen(false);
    toast({
      title: 'Task Created',
      description: `"${task.title}" has been added to ${teamName} tasks.`
    });
  };

  const handleTaskStatusChange = async (taskId: string, status: Task['status']) => {
    const success = await TaskService.updateTaskStatus(taskId, status);
    if (success) {
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, status } : task
        )
      );
    }
  };

  const handleTaskDeleted = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast({
      title: 'Task Deleted',
      description: 'The task has been removed from this team.'
    });
  };

  const handleAssignTask = async (taskId: string, assignedTo: string) => {
    if (!user) return;
    
    const success = await TaskService.assignTaskToUser(taskId, assignedTo, user.id);
    if (success) {
      // Update the local tasks list
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, assignedTo } : task
        )
      );
      
      toast({
        title: 'Task Assigned',
        description: 'The task has been assigned successfully.'
      });
    } else {
      toast({
        title: 'Assignment Failed',
        description: 'Could not assign the task. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (currentTab === 'all') return true;
    if (currentTab === 'pending') return task.status === 'pending';
    if (currentTab === 'in-progress') return task.status === 'in-progress';
    if (currentTab === 'complete') return task.status === 'complete';
    if (currentTab === 'mine' && user) {
      if (typeof task.assignedTo === 'string') {
        return task.assignedTo === user.id;
      } else if (task.assignedTo && typeof task.assignedTo === 'object') {
        return task.assignedTo.id === user.id;
      }
      return false;
    }
    return true;
  });

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Team Tasks</CardTitle>
            <CardDescription>Tasks assigned to {teamName}</CardDescription>
          </div>
          <div className="flex gap-2">
            <CalendarIntegrationButton 
              taskIds={tasks.filter(t => t.dueDate && !t.calendar_event_id).map(t => t.id)} 
              variant="outline"
              size="sm"
            />
            <Dialog open={createTaskOpen} onOpenChange={setCreateTaskOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create Team Task</DialogTitle>
                </DialogHeader>
                <TaskForm 
                  teamId={teamId} 
                  onTaskCreated={handleTaskCreated} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Tabs 
          value={currentTab} 
          onValueChange={setCurrentTab} 
          className="mt-4"
        >
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="complete">Complete</TabsTrigger>
            <TabsTrigger value="mine">Assigned to Me</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="pt-6">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-sm text-muted-foreground">Loading team tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-2 rounded-full bg-secondary p-3">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No {currentTab !== 'all' ? currentTab : ''} tasks found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {currentTab === 'all' 
                ? 'Get started by adding a task to this team' 
                : `There are no ${currentTab} tasks for this team`}
            </p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => setCreateTaskOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add First Task
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onStatusChange={handleTaskStatusChange}
                onDeleted={handleTaskDeleted}
                onAssignToUser={handleAssignTask}
                showTeamActions
                teamId={teamId}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamTasksList;
