
import { z } from 'zod';

export const taskFormSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  priority: z.enum(['high', 'medium', 'low']),
  status: z.enum(['pending', 'in-progress', 'complete']),
  dueDate: z.date(),
  dueTime: z.string().optional(),
  reminderEnabled: z.boolean().default(false),
  reminderTime: z.string().optional(),
  progress: z.number().min(0).max(100).default(0),
  tags: z.string().optional(),
  assignedTo: z.string().optional(),
  teamId: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
