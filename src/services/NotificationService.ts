
import { NotificationCore } from './notification/NotificationCore';
import { TaskNotifications } from './notification/TaskNotifications';
import { TeamNotifications } from './notification/TeamNotifications';
import type { NotificationParams, NotificationFetchOptions } from './notification/NotificationTypes';

/**
 * Main notification service that exposes all notification functionality
 */
export class NotificationService {
  // Core notification methods
  static createNotification = NotificationCore.createNotification;
  static fetchNotifications = NotificationCore.fetchNotifications;
  static markAsRead = NotificationCore.markAsRead;
  static markAllAsRead = NotificationCore.markAllAsRead;
  static deleteNotification = NotificationCore.deleteNotification;
  static clearAllNotifications = NotificationCore.clearAllNotifications;
  
  // Task notification methods
  static notifyTaskAssigned = TaskNotifications.notifyTaskAssigned;
  static notifyTaskCompleted = TaskNotifications.notifyTaskCompleted;
  static notifyTaskDueSoon = TaskNotifications.notifyTaskDueSoon;
  static notifyTaskOverdue = TaskNotifications.notifyTaskOverdue;
  
  // Team notification methods
  static notifyMessageReceived = TeamNotifications.notifyMessageReceived;
  static notifyTeamInvite = TeamNotifications.notifyTeamInvite;
}

// Re-export types for convenience
export type { NotificationParams, NotificationFetchOptions };
