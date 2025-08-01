import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, <span className="font-semibold">{user?.name}</span>!
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dashboard widgets/cards will go here */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-medium text-blue-800">Upcoming Events</h3>
              <p className="text-sm text-blue-600 mt-2">You have no upcoming events.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="font-medium text-green-800">Recent Activity</h3>
              <p className="text-sm text-green-600 mt-2">No recent activity.</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <h3 className="font-medium text-purple-800">Quick Actions</h3>
              <div className="mt-2 space-y-2">
                <button className="block w-full text-left text-sm text-purple-600 hover:text-purple-800 hover:underline">
                  Create New Event
                </button>
                <button className="block w-full text-left text-sm text-purple-600 hover:text-purple-800 hover:underline">
                  Invite Team Members
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
