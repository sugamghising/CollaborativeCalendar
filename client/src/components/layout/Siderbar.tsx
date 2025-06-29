import React, { useState } from "react";
import Button from "./common/Button";
import TeamMember from "./TeamMember";

function Sidebar() {
  const [activeItem, setActiveItem] = useState("home");

  const navItems = [
    {
      key: "home",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
      ),
      label: "Home",
    },
    {
      key: "tasks",
      icon: (
        <span
          className="material-symbols-outlined text-[24px]"
          style={{ fontVariationSettings: "'wght' 300" }}
        >
          assignment
        </span>
      ),
      label: "Tasks",
    },
    {
      key: "calendar",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
          />
        </svg>
      ),
      label: "Calendar",
    },
  ];

  return (
    <aside className="w-64 bg-white py-6 px-4 shadow-md flex flex-col overflow-y-auto font-inter">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Team up</h2>
      <div className="pl-4">
        {navItems.map((item) => (
          <div
            key={item.key}
            onClick={() => setActiveItem(item.key)}
            className={`flex items-center gap-2 text-gray-700 mb-4 p-2 rounded-xl cursor-pointer
               transition-colors ${
                 activeItem === item.key
                   ? "bg-green-100"
                   : "hover:bg-gray-100 text-gray-700"
               }`}
          >
            <div
              className={`${
                activeItem === item.key ? "text-green-600" : "text-gray-700"
              }`}
            >
              {item.icon}
            </div>
            <span
              className={`text-sm font-medium ${
                activeItem === item.key ? "text-green-700" : "text-gray-700"
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
      <TeamMember />

      <Button className="w-full py-3 font-roboto">Propose Meeting Time</Button>
    </aside>
  );
}

export default Sidebar;
