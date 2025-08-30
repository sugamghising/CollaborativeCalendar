  import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Team, Invite, userService } from '../services/user.service';

interface UserContextType {
  currentUser: User | null;
  teams: Team[];
  invites: Invite[];
  loading: boolean;
  error: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  createTeam: (name: string) => Promise<void>;
  joinTeam: (teamId: string) => Promise<void>;
  inviteTeamMember: (teamId: string, email: string) => Promise<void>;
  acceptInvite: (inviteId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setCurrentUser(JSON.parse(user));
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Fetch teams and invites in parallel
      const [teamsData, invitesData] = await Promise.all([
        userService.getMyTeams(),
        userService.getMyInvites()
      ]);
      
      setTeams(teamsData);
      setInvites(invitesData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch user data');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
    fetchUserData();
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setTeams([]);
    setInvites([]);
  };

  const createTeam = async (name: string) => {
    try {
      const newTeam = await userService.createTeam(name);
      setTeams(prevTeams => [...prevTeams, newTeam]);
    } catch (err) {
      setError('Failed to create team');
      throw err;
    }
  };

  const joinTeam = async (teamId: string) => {
    try {
      const updatedTeam = await userService.joinTeam(teamId);
      setTeams(prevTeams => [...prevTeams, updatedTeam]);
    } catch (err) {
      setError('Failed to join team');
      throw err;
    }
  };

  const inviteTeamMember = async (teamId: string, email: string) => {
    try {
      await userService.inviteTeamMember(teamId, email);
    } catch (err) {
      setError('Failed to send invitation');
      throw err;
    }
  };

  const acceptInvite = async (inviteId: string) => {
    try {
      const team = await userService.acceptInvite(inviteId);
      setTeams(prevTeams => [...prevTeams, team]);
      setInvites(prevInvites => prevInvites.filter(invite => invite.id !== inviteId));
    } catch (err) {
      setError('Failed to accept invitation');
      throw err;
    }
  };

  const refreshData = async () => {
    await fetchUserData();
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        teams,
        invites,
        loading,
        error,
        login,
        logout,
        createTeam,
        joinTeam,
        inviteTeamMember,
        acceptInvite,
        refreshData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
