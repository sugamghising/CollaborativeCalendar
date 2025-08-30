import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { acceptInviteToTeam, getUserInvites } from "../services/teamService";
import {
  CalendarIcon,
  HomeIcon,
  UserGroupIcon,
  CheckIcon,
  XMarkIcon,
  BellIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showInvites, setShowInvites] = useState(false);
  interface Invite {
    id: number;
    teamName: string;
    invitedBy: string;
  }

  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch invites when component mounts or when user changes
  const toggleInvites = () => {
    setShowInvites(!showInvites);
    if (!showInvites && invites.length === 0) {
      fetchInvites();
      console.log("togle invite----->");
    }
  };
  useEffect(() => {
    if (user) {
      fetchInvites();
    }
  }, [user]);
  const fetchInvites = async () => {
    setLoading(true);
    setError("");
    console.log("------------->");

    try {
      const token = localStorage.getItem("token") || "";
      const result = await getUserInvites(token);
      console.log("result invites---->", result);

      setInvites(result || []);
    } catch (err: any) {
      setError("Failed to load invites");
      console.error("Error fetching invites:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (inviteId: number) => {
    try {
      const token = localStorage.getItem("token") || "";
      console.log(token);
      const result = await acceptInviteToTeam(inviteId, token);
      console.log("Invite accepted:", result);
      setInvites(invites.filter((inv) => inv.id !== inviteId));
    } catch (err: any) {
      console.error("Error accepting invite:", err);
    }
  };

  const handleReject = async (inviteId: number) => {
    try {
      const token = localStorage.getItem("token") || "";
      console.log(token);
      // setInvites(invites.filter((inv) => inv.id !== inviteId));
    } catch (err: any) {
      console.error("Error rejecting invite:", err);
    }
  };

  const handleLogout = async () => {
    console.log("------->>>>>>>>");
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and main navigation */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-green-600">
              TeamUp
            </Link>

            {/* Navigation links - only show when logged in */}
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/dashboard"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  <HomeIcon className="h-5 w-5 mr-1" />
                  Dashboard
                </Link>
                <Link
                  to="/calendar"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  <CalendarIcon className="h-5 w-5 mr-1" />
                  Calendar
                </Link>
                <Link
                  to="/events"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  <UserGroupIcon className="h-5 w-5 mr-1" />
                  Events
                </Link>
                <Link
                  to="/team-members"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  <UserGroupIcon className="h-5 w-5 mr-1" />
                  Team Members
                </Link>
                <Link
                  to="/my-schedule"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  <ClipboardDocumentCheckIcon className="h-5 w-5 mr-1" />
                  My Schedule
                </Link>
              </div>
            )}
          </div>

          {/* Right side - User controls */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center">
                <button
                  type="button"
                  className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" />
                </button>

                {/* Invites button with relative positioning for dropdown */}
                <div className="relative ml-2">
                  <button
                    type="button"
                    onClick={toggleInvites}
                    className="bg-white p-1 rounded-full text-gray-400 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 relative"
                  >
                    <span className="sr-only">View invites</span>
                    <BellIcon className="h-6 w-6" />
                    {invites.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {invites.length}
                      </span>
                    )}
                    invites
                  </button>

                  {showInvites && (
                    <div className="absolute right-0 top-full mt-6 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-3">
                        <h3 className="text-sm font-semibold text-green-700 mb-2">
                          Team Invites
                        </h3>

                        {loading ? (
                          <p className="text-gray-500 text-sm">
                            Loading invites...
                          </p>
                        ) : error ? (
                          <div className="text-red-500 text-sm">
                            <p>{error}</p>
                            <button
                              onClick={fetchInvites}
                              className="text-blue-600 hover:text-blue-800 mt-1"
                            >
                              Try again
                            </button>
                          </div>
                        ) : invites.length === 0 ? (
                          <p className="text-gray-500 text-sm">
                            No new invites 🎉
                          </p>
                        ) : (
                          <ul className="space-y-3">
                            {invites.map((invite) => (
                              <li
                                key={invite.id}
                                className="flex justify-between items-center bg-green-50 p-2 rounded-md"
                              >
                                <div>
                                  <p className="text-sm font-medium text-gray-800">
                                    {invite.teamName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Invite by {invite.invitedBy}
                                  </p>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleAccept(invite.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white p-1 rounded-md"
                                    title="Accept invite"
                                  >
                                    <CheckIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleReject(invite.id)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 p-1 rounded-md"
                                    title="Reject invite"
                                  >
                                    <XMarkIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile dropdown */}
                <div className="ml-3 relative">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 mr-2">
                      {user?.name || user?.email || "User"}
                    </span>
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() ||
                        user?.email?.charAt(0)?.toUpperCase() ||
                        "U"}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="ml-4 px-3 py-1 text-sm font-medium text-gray-700 hover:text-green-600"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className="sm:hidden" id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="bg-green-50 border-green-500 text-green-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/calendar"
                className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                Calendar
              </Link>
              <Link
                to="/events"
                className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                Events
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
