import React from "react";
// @ts-ignore
import { BellIcon, UserCircleIcon } from "@heroicons/react/24/outline";

function Header() {
  return (
    <header className="bg-white p-4 shadow-sm flex items-center justify-between z-10 sticky top-0">
      {/* Left section: Logo/App Name and Nav */}
      <div className="flex items-center space-x-6">
        <div className="text-xl font-bold text-gray-800">TeamUp</div>
        <nav className="hidden md:flex space-x-6 text-gray-600">
          <a href="#" className="hover:text-primary-blue transition-colors">
            Home
          </a>
          <a
            href="#"
            className="font-semibold text-primary-blue border-b-2 border-primary-blue pb-1"
          >
            Calendar
          </a>
          <a href="#" className="hover:text-primary-blue transition-colors">
            Tasks
          </a>
          <a href="#" className="hover:text-primary-blue transition-colors">
            Files
          </a>
        </nav>
      </div>

      {/* Right section: Search, Notifications, User */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:ring-primary-blue focus:border-primary-blue text-sm w-48"
          />
          {/* Using a simple SVG icon here, you can replace with Heroicons or custom SVG */}
          <svg
            className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>

        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <BellIcon className="h-6 w-6 text-gray-600" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <UserCircleIcon className="h-8 w-8 text-gray-500" />{" "}
          {/* Or an actual user avatar */}
        </button>
      </div>
    </header>
  );
}

export default Header;
