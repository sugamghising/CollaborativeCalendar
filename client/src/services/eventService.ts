import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Types
interface Meeting {
  id: number;
  title: string;
  duration: number;
  priority: string;
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

interface CreateMeetingRequest {
  title: string;
  duration: number;
  preferredStart: Date;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  teamId: number;
  attendeeIds: number[];
}

interface MeetingResponse {
  message: string;
  meetings?: Meeting[];
  total?: number;
  teamId?: number;
  meeting?: Meeting;
  timeSlot?: {
    start: Date;
    end: Date;
  };
  scheduledTime?: Date;
  originalTime?: Date;
  note?: string;
}

// Get all meetings for the user's team
export const getMeetings = async (): Promise<MeetingResponse> => {
  try {
    const response = await api.get('/events');
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to fetch meetings');
  }
};

// Create a new meeting/schedule
export const createMeeting = async (meetingData: CreateMeetingRequest): Promise<MeetingResponse> => {
  try {
    const response = await api.post('/events', meetingData);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      // Handle validation errors
      if (typeof error.response.data.error === 'object') {
        const errors = Object.values(error.response.data.error).flat();
        throw new Error(errors[0] as string);
      }
      throw new Error(error.response.data.error);
    }
    throw new Error('Failed to create meeting');
  }
};

// Cancel a meeting
export const cancelMeeting = async (meetingId: number): Promise<MeetingResponse> => {
  try {
    const response = await api.post('/events/cancel', { meetingId });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Meeting not found or you don\'t have permission to cancel');
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to cancel meeting');
  }
};

// Helper function to format date for API
export const formatDate = (date: Date): string => {
  return date.toISOString();
};

// Helper function to check if a meeting can be cancelled by the current user
export const canCancelMeeting = (meeting: Meeting): boolean => {
  const userId = parseInt(localStorage.getItem('userId') || '0', 10);
  return meeting.createdBy === userId && meeting.status !== 'CANCELLED' && meeting.status !== 'COMPLETED';
};

// Helper function to get meeting status display text
export const getMeetingStatusText = (status: Meeting['status']): string => {
  const statusMap = {
    SCHEDULED: 'Scheduled',
    PENDING: 'Pending',
    CANCELLED: 'Cancelled',
    COMPLETED: 'Completed'
  };
  return statusMap[status] || status;
};

// Helper function to get meeting priority class for styling
export const getMeetingPriorityClass = (priority: string): string => {
  const priorityMap: { [key: string]: string } = {
    HIGH: 'bg-red-100 text-red-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    LOW: 'bg-green-100 text-green-800'
  };
  return priorityMap[priority] || 'bg-gray-100 text-gray-800';
};

// Helper function to format meeting duration
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${minutes} minutes`;
  }
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`;
};

// Helper function to check if two time slots overlap
export const doTimeSlotesOverlap = (
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean => {
  return start1 < end2 && end1 > start2;
};

// Helper function to get formatted time range
export const getTimeRange = (start: Date, duration: number): string => {
  const startDate = new Date(start);
  const endDate = new Date(startDate.getTime() + duration * 60000);
  
  return `${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}`;
};
