
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OverdueTask } from '@/services/ReportingService';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface OverdueTasksListProps {
  tasks: OverdueTask[];
}

const OverdueTasksList: React.FC<OverdueTasksListProps> = ({ tasks }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-amber-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Overdue Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No overdue tasks!</p>
            <p className="text-sm">All your tasks are on track.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
            {tasks.map(task => (
              <div key={task.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Due: {format(task.dueDate, 'PPP')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge variant="destructive">
                      {task.daysOverdue} {task.daysOverdue === 1 ? 'day' : 'days'} overdue
                    </Badge>
                  </div>
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
