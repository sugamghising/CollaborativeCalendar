import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Event {
  id: string;
  title: string;
  duration: number;
  preferredStart: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  teamId: string;
  attendeeIds: string[];
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  status?: 'SCHEDULED' | 'PENDING' | 'CANCELLED';
}

export interface CreateScheduleRequest {
  title: string;
  duration: number;
  preferredStart: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  teamId: string;
  attendeeIds: string[];
}

export interface CreateScheduleResponse {
  success: boolean;
  message: string;
  meeting?: Event;
}

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  },
});

const eventService = {
  // Create a new event schedule
  create: async (eventData: CreateScheduleRequest): Promise<CreateScheduleResponse> => {
    console.log(eventData);
    const response = await axios.post(
      `${API_URL}/events/createschedule`,
      eventData,
      getAuthConfig()
    );

    return response.data;
  },

  // Get all events for the current user
  getAll: async (): Promise<Event[]> => {
    const response = await axios.get(
      `${API_URL}/events`,
      getAuthConfig()
    );
    return response.data;
  },

  // Get a single event by ID
  get: async (eventId: string): Promise<Event> => {
    const response = await axios.get(
      `${API_URL}/events/${eventId}`,
      getAuthConfig()
    );
    return response.data;
  },

  // Update an event
  update: async (eventId: string, eventData: Partial<Omit<Event, 'id' | 'creatorId' | 'createdAt' | 'updatedAt'>>): Promise<Event> => {
    const response = await axios.put(
      `${API_URL}/events/${eventId}`,
      eventData,
      getAuthConfig()
    );
    return response.data;
  },

  // Delete an event
  delete: async (eventId: string): Promise<void> => {
    await axios.delete(
      `${API_URL}/events/${eventId}`,
      getAuthConfig()
    );
  },

  // Get events by team
  getByTeam: async (teamId: string): Promise<Event[]> => {
    const response = await axios.get(
      `${API_URL}/events/team/${teamId}`,
      getAuthConfig()
    );
    return response.data;
  }
};

export default eventService;