import React from "react";

const TeamMember = () => {
  const teamMembers = ["Ram", "Shyam", "Hari"];

  return (
    <div className="w-full border-y-2 border-black bg-white p-4 shadow-sm ">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Team Members</h3>
        <div className="flex items-center space-x-1 text-sm text-gray-600">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span>{teamMembers.length} online</span>
        </div>
      </div>
      <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
        {teamMembers.map((member) => (
          <div
            key={member}
            className="flex items-center justify-between bg-gray-100 hover:bg-green-100 hover:cursor-pointer transition rounded-lg p-2"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-semibold">
                {member[0]}
              </div>
              <span className="text-sm text-gray-800 font-medium">
                {member}
              </span>
            </div>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamMember;
