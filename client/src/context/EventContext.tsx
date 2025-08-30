import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { getMeetings, createMeeting, cancelMeeting } from '../services/eventService';
import { useAuth } from './AuthContext';

// Types
interface Meeting {
  id: number;
  title: string;
  duration: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  teamId: number;
  createdBy: number;
  scheduledAt?: Date;
  status: 'SCHEDULED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
  team?: {
    name: string;
  };
  creator?: {
    name: string;
    email: string;
  };
  attendees?: Array<{
    user: {
      name: string;
      email: string;
    };
    isRequired: boolean;
  }>;
}

interface CreateMeetingData {
  title: string;
  duration: number;
  preferredStart: Date;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  teamId: number;
  attendeeIds: number[];
}

interface EventContextType {
  meetings: Meeting[];
  loading: boolean;
  error: string | null;
  selectedMeeting: Meeting | null;
  fetchMeetings: () => Promise<void>;
  createNewMeeting: (meetingData: CreateMeetingData) => Promise<Meeting | null>;
  cancelSelectedMeeting: (meetingId: number) => Promise<boolean>;
  selectMeeting: (meeting: Meeting | null) => void;
  clearError: () => void;
  filterMeetings: (status?: string, priority?: string) => Meeting[];
  getUpcomingMeetings: () => Meeting[];
  getTodayMeetings: () => Meeting[];
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  const { user } = useAuth();

  // Fetch all meetings
  const fetchMeetings = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await getMeetings();
      if (response.meetings) {
        // Convert date strings to Date objects and ensure proper typing
        const formattedMeetings = response.meetings.map(meeting => ({
          ...meeting,
          scheduledAt: meeting.scheduledAt ? new Date(meeting.scheduledAt) : undefined,
          priority: meeting.priority as 'HIGH' | 'MEDIUM' | 'LOW'
        }));
        setMeetings(formattedMeetings as Meeting[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create a new meeting
  const createNewMeeting = async (meetingData: CreateMeetingData): Promise<Meeting | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await createMeeting(meetingData);
      if (response.meeting) {
        const newMeeting = {
          ...response.meeting,
          scheduledAt: response.meeting.scheduledAt ? new Date(response.meeting.scheduledAt) : undefined,
          priority: response.meeting.priority as 'HIGH' | 'MEDIUM' | 'LOW'
        } as Meeting;
        setMeetings(prev => [...prev, newMeeting]);
        return newMeeting;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create meeting');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cancel a meeting
  const cancelSelectedMeeting = async (meetingId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await cancelMeeting(meetingId);
      if (response.meeting) {
        setMeetings(prev => 
          prev.map(meeting => 
            meeting.id === meetingId 
              ? { ...meeting, status: 'CANCELLED' }
              : meeting
          )
        );
        if (selectedMeeting?.id === meetingId) {
          setSelectedMeeting({ ...selectedMeeting, status: 'CANCELLED' });
        }
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel meeting');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Select a meeting for viewing/editing
  const selectMeeting = (meeting: Meeting | null) => {
    setSelectedMeeting(meeting);
  };

  // Clear any error messages
  const clearError = () => {
    setError(null);
  };

  // Filter meetings by status and/or priority
  const filterMeetings = (status?: string, priority?: string): Meeting[] => {
    return meetings.filter(meeting => {
      const statusMatch = !status || meeting.status === status;
      const priorityMatch = !priority || meeting.priority === priority;
      return statusMatch && priorityMatch;
    });
  };

  // Get upcoming meetings (future meetings that aren't cancelled)
  const getUpcomingMeetings = (): Meeting[] => {
    const now = new Date();
    return meetings.filter(meeting => 
      meeting.scheduledAt && 
      meeting.status !== 'CANCELLED' &&
      new Date(meeting.scheduledAt) > now
    ).sort((a, b) => 
      (a.scheduledAt && b.scheduledAt) 
        ? new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
        : 0
    );
  };

  // Get today's meetings
  const getTodayMeetings = (): Meeting[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return meetings.filter(meeting => 
      meeting.scheduledAt && 
      meeting.status !== 'CANCELLED' &&
      new Date(meeting.scheduledAt) >= today &&
      new Date(meeting.scheduledAt) < tomorrow
    ).sort((a, b) => 
      (a.scheduledAt && b.scheduledAt)
        ? new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
        : 0
    );
  };

  // Effect to fetch meetings when user changes
  React.useEffect(() => {
    if (user) {
      fetchMeetings();
    } else {
      setMeetings([]);
    }
  }, [user, fetchMeetings]);

  const value = {
    meetings,
    loading,
    error,
    selectedMeeting,
    fetchMeetings,
    createNewMeeting,
    cancelSelectedMeeting,
    selectMeeting,
    clearError,
    filterMeetings,
    getUpcomingMeetings,
    getTodayMeetings
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};

// Custom hook to use the event context
export const useEvents = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
