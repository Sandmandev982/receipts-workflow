
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/components/tasks/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface OverdueTasksListProps {
  tasks: Task[];
}

const OverdueTasksList: React.FC<OverdueTasksListProps> = ({ tasks }) => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Overdue Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No overdue tasks!</p>
        ) : (
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {tasks.map(task => (
              <div 
                key={task.id} 
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div>
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Due: {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No date'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={task.priority === 'high' ? 'destructive' : 
                    task.priority === 'medium' ? 'default' : 'outline'}>
                    {task.priority}
                  </Badge>
                  <Badge variant="outline">{task.status.replace('-', ' ')}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OverdueTasksList;
