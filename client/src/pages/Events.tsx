import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  CalendarIcon,
  ClockIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

type EventStatus = 'upcoming' | 'past' | 'all';
type SortBy = 'date' | 'title';

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  organizer: string;
  status: 'upcoming' | 'past';
}

const Events = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<EventStatus>('upcoming');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with API call in a real application
  const events: Event[] = [
    {
      id: '1',
      title: 'Team Standup',
      description: 'Daily standup meeting with the development team',
      startDate: new Date(2025, 7, 1, 10, 0),
      endDate: new Date(2025, 7, 1, 10, 30),
      organizer: 'John Doe',
      status: 'upcoming',
    },
    {
      id: '2',
      title: 'Project Planning',
      description: 'Planning session for Q3 projects',
      startDate: new Date(2025, 7, 5, 14, 0),
      endDate: new Date(2025, 7, 5, 16, 0),
      location: 'Conference Room A',
      organizer: 'Jane Smith',
      status: 'upcoming',
    },
    {
      id: '3',
      title: 'Code Review',
      description: 'Review of recent pull requests',
      startDate: new Date(2025, 6, 28, 11, 0),
      endDate: new Date(2025, 6, 28, 12, 0),
      organizer: 'Mike Johnson',
      status: 'past',
    },
  ];

  const filteredEvents = events
    .filter((event) => {
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return a.startDate.getTime() - b.startDate.getTime();
      }
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Events</h1>
          <p className="text-gray-600">Manage and view all your events in one place</p>
        </div>
        <button
          onClick={() => navigate('/events/new')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Create Event</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search events..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as EventStatus)}
              >
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
                <option value="all">All Events</option>
              </select>
              <FunnelIcon className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
              </select>
              <AdjustmentsHorizontalIcon className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/events/${event.id}`)}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                  <p className="text-gray-600 mt-1">{event.description}</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>{format(event.startDate, 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>
                        {format(event.startDate, 'h:mm a')} - {format(event.endDate, 'h:mm a')}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center">
                        <span className="text-gray-400">•</span>
                        <span className="ml-2">{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 md:mt-0 md:ml-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    event.status === 'upcoming' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {event.status === 'upcoming' ? 'Upcoming' : 'Past'}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No events found matching your criteria.</p>
            <button
              onClick={() => {
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="mt-4 text-green-600 hover:text-green-800 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
