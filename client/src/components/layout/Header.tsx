import React from "react";
// @ts-ignore
import { BellIcon, UserCircleIcon } from "@heroicons/react/24/outline";

function Header() {
  return (
    <header className="bg-white p-3 shadow-sm flex items-center justify-between z-10 sticky top-0">
      {/* Left section: Logo/App Name and Nav */}
      <div className="flex items-end  space-x-6">
        <div className="text-xl font-bold text-gray-800">TeamUp</div>
        <nav className="hidden md:flex space-x-6 text-gray-600">
          <a href="#" className="hover:text-primary-blue transition-colors">
            Files
          </a>
        </nav>
      </div>

      {/* Right section: Search, Notifications, User */}
      <div className="flex items-center space-x-4">
        <div className="relative w-50">
          <input
            type="text"
            placeholder="Search"
            className="pl-10 pr-4 py-2 w-full text-sm text-green-800 placeholder-green-500 placeholder:font-medium bg-green-100 rounded-xl border border-green-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600"
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
            />
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
