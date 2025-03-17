
import { z } from 'zod';
import { TaskFormValues } from '../types';

export const taskFormSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  priority: z.enum(['high', 'medium', 'low']),
  status: z.enum(['pending', 'in-progress', 'complete']),
  dueDate: z.date(),
  dueTime: z.string().optional(),
  reminderEnabled: z.boolean().default(false),
  reminderTime: z.string().optional(),
  emailNotification: z.boolean().default(false),
  notificationEmail: z.string().email().optional().or(z.literal('')),
  progress: z.number().min(0).max(100).default(0),
  tags: z.string().optional(),
  assignedTo: z.string().optional(),
  teamId: z.string().optional(),
  // SMART task fields
  specific: z.string().optional(),
  measurable: z.string().optional(),
  achievable: z.boolean().default(true),
  relevant: z.string().optional(),
  time_bound: z.boolean().default(true),
  // Additional fields
  start_date: z.date().optional(),
  has_subtasks: z.boolean().default(false),
  has_reverse_plan: z.boolean().default(false),
  
  // Added fields for SMART task framework
  expected_outcome: z.string().optional(),
  metrics: z.string().optional(),
  resources_needed: z.string().optional(),
  obstacles: z.string().optional(),
  dependencies: z.string().optional()
});

export type { TaskFormValues };
