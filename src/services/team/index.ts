
import { TeamCore } from './TeamCore';
import { TeamMembers } from './TeamMembers';
import type { Team, TeamMember, CreateTeamParams } from './types';

// Re-export the types
export type { Team, TeamMember, CreateTeamParams };

/**
 * Main TeamService that aggregates all team-related functionality
 */
export class TeamService {
  // Core team operations
  static fetchTeams = TeamCore.fetchTeams;
  static getTeamById = TeamCore.getTeamById;
  static createTeam = TeamCore.createTeam;
  static updateTeam = TeamCore.updateTeam;
  static deleteTeam = TeamCore.deleteTeam;
  
  // Team member operations
  static getTeamMembers = TeamMembers.getTeamMembers;
  static addTeamMember = TeamMembers.addTeamMember;
  static removeTeamMember = TeamMembers.removeTeamMember;
  static updateTeamMemberRole = TeamMembers.updateTeamMemberRole;
}
