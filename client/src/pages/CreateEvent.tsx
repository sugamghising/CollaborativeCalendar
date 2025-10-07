import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/layout/common/Button";
import eventService from "../services/event.service";
import { useAuth } from "../context/AuthContext";
import { userService, User } from "../services/user.service";

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    preferredStart: "",
    duration: 30, // default duration in minutes
    importance: 5, // numeric importance 1-10
    deadline: "",
    attendeeIds: [] as number[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<number[]>([]);
  const [teamId, setTeamId] = useState<number | null>(null);

  // Fetch team members when component mounts
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        console.log("Fetching team members...");
        const teamsResponse = await userService.getMyTeams();
        console.log("Teams response:", teamsResponse);

        // Check if response is an array and get the first team
        const firstTeam = Array.isArray(teamsResponse)
          ? teamsResponse[0]
          : teamsResponse;
        console.log("First team:", firstTeam);

        if (firstTeam && firstTeam.members) {
          // Filter out the current user from the team members list
          const otherMembers = firstTeam.members.filter(
            (member) => member.id !== user?.id
          );
          console.log("Other team members:", otherMembers);
          setTeamMembers(firstTeam.members); // Show all members including current user
          setTeamId(firstTeam.id); // Store the team ID
        } else {
          console.log("No team members found");
          setError("No team members found");
        }
      } catch (err) {
        console.error("Error fetching team members:", err);
        setError("Failed to fetch team members");
      }
    };

    fetchTeamMembers();
  }, [user?.id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "importance" || name === "duration" ? Number(value) : value,
    }));
  };

  const handleAttendeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const attendeeId = parseInt(e.target.value);
    const isChecked = e.target.checked;

    setSelectedAttendeeIds((prev) => {
      if (isChecked) {
        return [...prev, attendeeId];
      } else {
        return prev.filter((id) => id !== attendeeId);
      }
    });

    setFormData((prev) => ({
      ...prev,
      attendeeIds: isChecked
        ? [...prev.attendeeIds, attendeeId]
        : prev.attendeeIds.filter((id) => id !== attendeeId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.title.trim()) {
      setError("Event title is required");
      return;
    }

    if (!formData.preferredStart) {
      setError("Preferred start time is required");
      return;
    }

    if (!formData.deadline) {
      setError("Deadline is required");
      return;
    }

    if (!formData.duration || formData.duration <= 0) {
      setError("Duration must be greater than 0 minutes");
      return;
    }

    if (formData.importance < 1 || formData.importance > 10) {
      setError("Importance must be between 1 and 10");
      return;
    }

    if (formData.attendeeIds.length === 0) {
      setError("At least one attendee is required");
      return;
    }

    if (!teamId) {
      setError("Team ID not found");
      return;
    }

    // Validate that deadline is after preferred start time
    const startDate = new Date(formData.preferredStart);
    const deadlineDate = new Date(formData.deadline);
    if (deadlineDate <= startDate) {
      setError("Deadline must be after the preferred start time");
      return;
    }

    setIsLoading(true);

    try {
      // Convert the datetime-local values to ISO string format
      const preferredStartISO = new Date(formData.preferredStart).toISOString();
      const deadlineISO = new Date(formData.deadline).toISOString();

      const eventData = {
        title: formData.title,
        duration: Number(formData.duration),
        preferredStart: preferredStartISO,
        importance: Number(formData.importance),
        deadline: deadlineISO,
        teamId: teamId,
        attendeeIds: formData.attendeeIds,
      };

      console.log("eventData", eventData);

      // Make sure your eventService.create method calls the correct endpoint
      // It should POST to /api/events/createschedule
      const response = await eventService.create(eventData);

      if (response.success) {
        navigate("/events");
      } else {
        setError(response.message || "Failed to create event");
      }
    } catch (err: any) {
      console.error("Error creating event:", err);
      setError(err.response?.data?.message || "Failed to create event");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Event Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="preferredStart"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Preferred Start Time *
            </label>
            <input
              type="datetime-local"
              id="preferredStart"
              name="preferredStart"
              value={formData.preferredStart}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label
              htmlFor="deadline"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Deadline *
            </label>
            <input
              type="datetime-local"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Duration (minutes) *
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label
              htmlFor="importance"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Importance (1-10) *
            </label>
            <input
              type="number"
              id="importance"
              name="importance"
              value={formData.importance}
              onChange={handleChange}
              min="1"
              max="10"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              1 = Low importance, 10 = High importance
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Attendees *
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`attendee-${member.id}`}
                  value={member.id}
                  checked={selectedAttendeeIds.includes(member.id)}
                  onChange={handleAttendeeChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={`attendee-${member.id}`}
                  className="ml-3 block text-sm text-gray-900 cursor-pointer"
                >
                  {member.name} ({member.email})
                </label>
              </div>
            ))}
          </div>
          {teamMembers.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              No other team members available
            </p>
          )}
          {selectedAttendeeIds.length > 0 && (
            <p className="text-sm text-green-600 mt-2">
              {selectedAttendeeIds.length} attendee(s) selected
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isLoading ? "Creating..." : "Create Event"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
