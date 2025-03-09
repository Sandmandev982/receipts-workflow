
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TaskStatus } from './types';

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-receipts-yellow/10 border-receipts-yellow text-receipts-yellow font-normal">Pending</Badge>;
    case 'in-progress':
      return <Badge variant="outline" className="bg-receipts-blue/10 border-receipts-blue text-receipts-blue font-normal">In Progress</Badge>;
    case 'complete':
      return <Badge variant="outline" className="bg-receipts-success/10 border-receipts-success text-receipts-success font-normal">Complete</Badge>;
    default:
      return null;
  }
};
