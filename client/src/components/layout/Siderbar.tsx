import React from "react";
import Button from "./common/Button";
// import TeamMembersList from "../TeamMembers/TeamMembersList";

function Sidebar() {
  return (
    <aside className="w-64 bg-white p-6 shadow-md flex flex-col overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Team Members</h2>
      {/* <TeamMembersList /> */}
      <div className="mt-auto pt-6">
        {" "}
        {/* Use mt-auto to push the button to the bottom */}
        <Button className="w-full py-3">Propose Meeting Time</Button>
      </div>
    </aside>
  );
}

export default Sidebar;
