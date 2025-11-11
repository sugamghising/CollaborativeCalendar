import React, { useState, useEffect, useMemo } from "react";
import {
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const MeetingDashboard = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("date");

  // Fetch meetings from API
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:5000/api/events/getmeetings",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setMeetings(data.meetings || []);
        setError(null);
      } catch (err) {
        setError("Failed to fetch meetings: " + err.message);
        console.error("Error fetching meetings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "SCHEDULED":
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case "CANCELLED":
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200";
      case "MEDIUM":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "LOW":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredAndSortedMeetings = useMemo(() => {
    let filtered = meetings.filter((meeting) => {
      const matchesSearch =
        meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.team.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || meeting.status === statusFilter;
      const matchesPriority =
        priorityFilter === "ALL" || meeting.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          if (!a.scheduledAt && !b.scheduledAt) return 0;
          if (!a.scheduledAt) return 1;
          if (!b.scheduledAt) return -1;
          return new Date(a.scheduledAt) - new Date(b.scheduledAt);
        case "priority":
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return a.id - b.id;
      }
    });
  }, [meetings, searchTerm, statusFilter, priorityFilter, sortBy]);

  const getStatusCounts = () => {
    const counts = meetings.reduce((acc, meeting) => {
      acc[meeting.status] = (acc[meeting.status] || 0) + 1;
      return acc;
    }, {});
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading meetings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/50 shadow-lg text-center max-w-md">
          <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Meetings
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Meeting Dashboard
              </h1>
              <p className="text-gray-600">
                Manage your team meetings and events
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Meetings</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {meetings.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Scheduled</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {statusCounts.SCHEDULED || 0}
                  </p>
                </div>
              </div>
            </div>
            {/* 
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {statusCounts.PENDING || 0}
                  </p>
                </div>
              </div>
            </div> */}

            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircleIcon className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cancelled</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {statusCounts.CANCELLED || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(meeting.status)}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {meeting.title}
                    </h3>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                      meeting.priority
                    )}`}
                  >
                    {meeting.priority}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <UsersIcon className="w-4 h-4" />
                    <span className="capitalize">{meeting.team.name}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ClockIcon className="w-4 h-4" />
                    <span>{meeting.duration} minutes</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{formatDate(meeting.scheduledAt)}</span>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Attendees ({meeting.attendees.length})
                </p>
                <div className="space-y-1">
                  {meeting.attendees.slice(0, 2).map((attendee, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {attendee.user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-600">
                        {attendee.user.name}
                      </span>
                      {attendee.isRequired && (
                        <span className="text-xs text-red-500">*</span>
                      )}
                    </div>
                  ))}
                  {meeting.attendees.length > 2 && (
                    <p className="text-xs text-gray-500 ml-8">
                      +{meeting.attendees.length - 2} more
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50/80 backdrop-blur-sm px-6 py-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Created by {meeting.creator.name}
                  </span>
                  <span
                    className={`flex gap-2 px-2 py-1 rounded-full text-xs font-medium ${
                      meeting.status === "SCHEDULED"
                        ? "bg-green-100 text-green-700"
                        : meeting.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {getStatusIcon(meeting.status)}
                    {meeting.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && filteredAndSortedMeetings.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {meetings.length === 0
                ? "No meeting set yet"
                : "No meetings found"}
            </h3>
            <p className="text-gray-600">
              {meetings.length === 0
                ? "Create your first meeting to get started."
                : "Try adjusting your search or filter criteria."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingDashboard;
