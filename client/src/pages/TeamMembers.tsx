import React, { useState, useEffect } from "react";
import {
  UserPlusIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { createTeam, getTeam, inviteTeamMember } from "../services/teamService";

const TeamMembers = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

  const token = localStorage.getItem("token") || "";

  // Fetch team members
  useEffect(() => {
    const fetchTeam = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const teamData = await getTeam(token);
        setMembers(teamData?.members || []);
      } catch (err) {
        console.error("Failed to fetch team:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  const handleCreateTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    try {
      setLoading(true);
      await createTeam(token, teamName);

      const teamData = await getTeam(token);
      setMembers(teamData?.members || []);

      setTeamName("");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to create team:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      setLoading(true);
      const response = await inviteTeamMember(token, inviteEmail);

      setInviteMessage(response.message);

      const teamData = await getTeam(token);
      setMembers(teamData?.members || []);

      setInviteEmail("");

      setTimeout(() => {
        setIsInviteModalOpen(false);
        setInviteMessage(null);
      }, 3000);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to invite member";
      setInviteMessage(message);

      setTimeout(() => {
        setIsInviteModalOpen(false);
        setInviteMessage(null);
      }, 3000);

      console.error("Failed to invite member:", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-600">Team Members</h1>
        {members.length > 0 && (
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Invite Member
          </button>
        )}
      </div>

      {members.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 flex flex-col items-center justify-center text-center">
          <UsersIcon className="h-12 w-12 text-green-500 mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            No team created yet
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Start by creating your first team to add and manage members.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <UsersIcon className="h-5 w-5 mr-2" />
            Create Team
          </button>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 hover:bg-green-50 transition"
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                  {member.name.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {member.name}
                  </p>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            <h2 className="text-xl font-semibold text-green-600 mb-4">
              Create Team
            </h2>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="teamName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Team Name
                </label>
                <input
                  id="teamName"
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                  placeholder="e.g. Software Developer Team"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </form>
          </div>
        </div>
      )}

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            <h2 className="text-xl font-semibold text-green-600 mb-4">
              Invite Team Member
            </h2>

            {/* ✅ show response message */}
            {inviteMessage && (
              <div className="mb-3 p-2 text-sm rounded bg-green-100 text-green-700">
                {inviteMessage}
              </div>
            )}

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="inviteEmail"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  id="inviteEmail"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  placeholder="Enter user email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? "Inviting..." : "Send Invite"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMembers;
