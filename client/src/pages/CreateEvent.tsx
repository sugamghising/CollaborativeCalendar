import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/layout/common/Button";
import eventService from "../services/event.service";
import { useAuth } from "../context/AuthContext";
import { userService, User } from "../services/user.service";

enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH"
}

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    preferredStart: "",
    duration: 30, // default duration in minutes
    priority: Priority.MEDIUM,
    attendees: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);

  // Fetch team members when component mounts
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        console.log("Fetching team members...");
        const [teams] = await userService.getMyTeams();
        console.log("Team data:", teams);
        
        if (teams && teams.members) {
          // Filter out the current user from the team members list
          const otherMembers = teams.members.filter(member => member.id !== user?.id);
          console.log("Other team members:", otherMembers);
          setTeamMembers(otherMembers);
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAttendeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setSelectedAttendees(selectedOptions);
    setFormData(prev => ({
      ...prev,
      attendees: selectedOptions
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

    if (!formData.duration || formData.duration <= 0) {
      setError("Duration must be greater than 0 minutes");
      return;
    }

    if (formData.attendees.length === 0) {
      setError("At least one attendee is required");
      return;
    }

    setIsLoading(true);

    try {
      // Get team members to map emails to user IDs
      const [currentTeam] = await userService.getMyTeams();
      
      if (!currentTeam) {
        setError("Could not find your team");
        return;
      }

      const teamMembers = currentTeam.members;
      const attendeeIds = formData.attendees
        .map(email => teamMembers.find(member => member.email.toLowerCase() === email.toLowerCase())?.id)
        .filter((id): id is string => id !== undefined);

      if (attendeeIds.length !== formData.attendees.length) {
        setError("Some attendee emails do not match team members");
        return;
      }

      const eventData = {
        title: formData.title,
        duration: Number(formData.duration),
        preferredStart: new Date(formData.preferredStart).toISOString(),
        priority: formData.priority,
        teamId: currentTeam.id,
        attendeeIds,
      };
      console.log("eventData", eventData);
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
        </div>

        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Priority *
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          >
            <option value={Priority.LOW}>Low</option>
            <option value={Priority.MEDIUM}>Medium</option>
            <option value={Priority.HIGH}>High</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="attendees"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Select Attendees *
          </label>
          <div className="space-y-2">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`attendee-${member.id}`}
                  value={member.email}
                  checked={selectedAttendees.includes(member.email)}
                  onChange={(e) => {
                    const email = e.target.value;
                    setSelectedAttendees(prev => {
                      if (e.target.checked) {
                        return [...prev, email];
                      } else {
                        return prev.filter(a => a !== email);
                      }
                    });
                    setFormData(prev => ({
                      ...prev,
                      attendees: e.target.checked 
                        ? [...prev.attendees, email]
                        : prev.attendees.filter(a => a !== email)
                    }));
                  }}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor={`attendee-${member.id}`} className="ml-2 block text-sm text-gray-900">
                  {member.name} ({member.email})
                </label>
              </div>
            ))}
          </div>
          {teamMembers.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">No other team members available</p>
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
