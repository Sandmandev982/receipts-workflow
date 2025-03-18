
import { NotificationCore } from './NotificationCore';

/**
 * Task-specific notification functions
 */
export class TaskNotifications {
  /**
   * Notify a user when they are assigned a task
   */
  static async notifyTaskAssigned(taskId: string, assignedToUserId: string, assignedByUserId: string, taskTitle: string) {
    return NotificationCore.createNotification({
      userId: assignedToUserId,
      title: 'New Task Assigned',
      message: `You have been assigned a new task: ${taskTitle}`,
      taskId,
      type: 'task',
      actionUrl: `/tasks?id=${taskId}`,
      priority: 'high'
    });
  }

  /**
   * Notify team members when a task is completed
   */
  static async notifyTaskCompleted(taskId: string, completedByUserId: string, taskTitle: string, teamId?: string, teamMembers?: string[]) {
    // If there's a team, notify all team members
    if (teamId && teamMembers && teamMembers.length > 0) {
      // Use Promise.all with a manually created array of promises to avoid TypeScript issues
      const notificationPromises = teamMembers
        .filter(memberId => memberId !== completedByUserId) // Don't notify the completer
        .map(memberId => 
          NotificationCore.createNotification({
            userId: memberId,
            title: 'Task Completed',
            message: `Task "${taskTitle}" has been completed`,
            taskId,
            teamId,
            type: 'task',
            actionUrl: `/tasks?id=${taskId}`
          })
        );
      
      await Promise.all(notificationPromises);
      return true;
    }
    
    // If no team, just return true as there's no one to notify
    return true;
  }

  /**
   * Notify a user when a task is due soon
   */
  static async notifyTaskDueSoon(taskId: string, userId: string, taskTitle: string, dueDate: string, emailNotification?: boolean, emailAddress?: string) {
    return NotificationCore.createNotification({
      userId,
      title: 'Task Due Soon',
      message: `Your task "${taskTitle}" is due on ${dueDate}`,
      taskId,
      type: 'task',
      actionUrl: `/tasks?id=${taskId}`,
      priority: 'high',
      sendEmail: emailNotification,
      emailAddress
    });
  }

  /**
   * Notify a user when a task is overdue
   */
  static async notifyTaskOverdue(taskId: string, userId: string, taskTitle: string, dueDate: string, emailNotification?: boolean, emailAddress?: string) {
    return NotificationCore.createNotification({
      userId,
      title: 'Task Overdue',
      message: `Your task "${taskTitle}" was due on ${dueDate} and is now overdue`,
      taskId,
      type: 'task',
      actionUrl: `/tasks?id=${taskId}`,
      priority: 'high',
      sendEmail: emailNotification,
      emailAddress
    });
  }
}
