import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Task } from './types';
import { MoreHorizontal, Edit, Trash2, Calendar, UserCircle } from 'lucide-react';
import { TaskStatusBadge } from '@/components/tasks/TaskStatusBadge';
import { TaskDateIndicator } from '@/components/tasks/TaskDateIndicator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (newStatus: Task['status']) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
  return (
    <Card className="bg-card text-card-foreground shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" /> <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-xs text-muted-foreground">
          {task.description}
        </CardDescription>
        <div className="flex items-center mt-2">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          <TaskDateIndicator task={task} />
        </div>
        {task.tags && task.tags.length > 0 && (
          <div className="flex items-center mt-2 space-x-1">
            {task.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[0.7rem]">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {task.assignedTo && (
          <div className="flex items-center mt-2">
            <Avatar className="mr-2 h-5 w-5">
              <AvatarImage src={task.assignedTo.avatar} />
              <AvatarFallback>{task.assignedTo.initials}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {task.assignedTo.name}
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <TaskStatusBadge status={task.status} onStatusChange={onStatusChange} />
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
