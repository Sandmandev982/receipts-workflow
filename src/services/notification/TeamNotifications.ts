
import { NotificationCore } from './NotificationCore';

/**
 * Team-specific notification functions
 */
export class TeamNotifications {
  /**
   * Notify a user when they received a message
   */
  static async notifyMessageReceived(messageId: string, userId: string, senderName: string, teamId?: string, teamName?: string) {
    return NotificationCore.createNotification({
      userId,
      title: teamId ? `New message in ${teamName || 'team'}` : 'New direct message',
      message: `You have received a new message from ${senderName}`,
      teamId,
      type: 'message',
      actionUrl: teamId ? `/messages?team=${teamId}` : `/messages`
    });
  }

  /**
   * Notify a user when they are invited to a team
   */
  static async notifyTeamInvite(userId: string, teamId: string, teamName: string, invitedByName: string) {
    return NotificationCore.createNotification({
      userId,
      title: 'Team Invitation',
      message: `${invitedByName} has invited you to join the team "${teamName}"`,
      teamId,
      type: 'team',
      actionUrl: `/teams?id=${teamId}`,
      priority: 'high'
    });
  }
}
