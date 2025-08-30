import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface User {
  id: string;
  name: string;
  email: string;
  // Add other user properties as needed
}

export interface Team {
  id: string;
  name: string;
  members: User[];
  // Add other team properties as needed
}

export interface Invite {
  id: string;
  teamId: string;
  teamName: string;
  inviterId: string;
  inviteeEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

export const userService = {
  // Get all users
  getUsers: async (): Promise<User[]> => {
    const response = await axios.get(`${API_URL}/users`, getAuthConfig());
    return response.data;
  },

  // Create a new team
  createTeam: async (teamName: string): Promise<Team> => {
    const response = await axios.post(
      `${API_URL}/users/createTeam`,
      { name: teamName },
      getAuthConfig()
    );
    return response.data;
  },

  // Join a team
  joinTeam: async (teamId: string): Promise<Team> => {
    const response = await axios.post(
      `${API_URL}/users/joinTeam`,
      { teamId },
      getAuthConfig()
    );
    return response.data;
  },

  // Invite a team member
  inviteTeamMember: async (teamId: string, email: string): Promise<Invite> => {
    const response = await axios.post(
      `${API_URL}/users/inviteTeamMember`,
      { teamId, email },
      getAuthConfig()
    );
    return response.data;
  },

  // Accept team invite
  acceptInvite: async (inviteId: string): Promise<Team> => {
    const response = await axios.post(
      `${API_URL}/users/acceptInviteToTeam`,
      { inviteId },
      getAuthConfig()
    );
    return response.data;
  },

  // Get current user's teams
  getMyTeams: async (): Promise<Team[]> => {
    const response = await axios.get(`${API_URL}/users/me/teams`, getAuthConfig());
    return response.data;
  },

  // Get user's pending invites
  getMyInvites: async (): Promise<Invite[]> => {
    const response = await axios.get(`${API_URL}/users/me/invites`, getAuthConfig());
    return response.data;
  },
};
