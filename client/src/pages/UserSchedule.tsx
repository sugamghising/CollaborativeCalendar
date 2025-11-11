import {
  createBlockedTime,
  createUserSchedule,
  getBlockTime,
  getIndividualSchedule,
} from "../services/schedule";
import React, { useEffect, useState } from "react";

const UserSchedulePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [workHour, setWorkHour] = useState([]);
  const [blockDataT, setBlockDataT] = useState([]);
  const [error, seterror] = useState("");

  const [showOfficeForm, setShowOfficeForm] = useState(false);
  const [showBlockForm, setShowBlockForm] = useState(false);

  const [officeData, setOfficeData] = useState({
    startTime: "",
    endTime: "",
    role: "",
  });

  const [blockData, setBlockData] = useState({
    title: "",
    startTime: "",
    endTime: "",
  });

  const formatTime = (time) => {
    // Handle ISO date format for block schedules
    if (time.includes("T")) {
      const date = new Date(time);
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHour = hours % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }

    // Handle regular time format
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleOfficeSubmit = async () => {
    if (!officeData.startTime || !officeData.endTime || !officeData.role) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found. Please login first.");
        return;
      }

      const res = await createUserSchedule(
        officeData.startTime,
        officeData.endTime,
        officeData.role,
        token
      );

      console.log("Schedule created:", res);

      // Update the work hour state immediately
      if (res && res.schedule) {
        setWorkHour(res.schedule);
      } else {
        // If the API doesn't return the created schedule, fetch it again
        const updatedSchedule = await getIndividualSchedule(token);
        setWorkHour(updatedSchedule.schedule[0]);
      }

      setShowOfficeForm(false);
    } catch (err) {
      alert("Failed to create schedule");
      return;
    }

    setOfficeData({ startTime: "", endTime: "", role: "" });
  };

  const handleBlockSubmit = async () => {
    seterror("");
    if (!blockData.title) {
      seterror("title should be provided");
      return;
    }
    const start = new Date(blockData.startTime);
    const end = new Date(blockData.endTime);
    if (!blockData.startTime || !blockData.endTime) {
      seterror("Please select both start and end times.");
      return;
    }
    if (start.getTime() < Date.now()) {
      seterror("Start time should be in the future");
      return;
    }
    if (start > end) {
      seterror("Start time cannot be after end time.");
      return;
    }
    const blockedTimeData = {
      title: blockData.title,
      startTime: blockData.startTime,
      endTime: blockData.endTime,
    };
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found. Please login first.");
        return;
      }

      const result = await createBlockedTime(blockedTimeData, token);
      console.log("Blocked time created:", result);

      // Add the new block time to the state immediately
      if (result && result.blocked) {
        setBlockDataT([...blockDataT, result.blocked]);
      } else {
        // If the API doesn't return the created block, fetch all blocks again
        const updatedBlockData = await getBlockTime(token);
        setBlockDataT(updatedBlockData.blockedTimes);
      }
    } catch (err) {
      console.error(err);
      seterror("Failed to create block time. Please try again.");
      return;
    }
    setBlockData({ title: "", startTime: "", endTime: "" });
    setShowBlockForm(false);
  };

  const handleDelete = (id) => {
    setSchedules(schedules.filter((schedule) => schedule.id !== id));
  };

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("API Schedules:->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", token);
        const data = await getIndividualSchedule(token!);
        const blockData = await getBlockTime(token!);
        setWorkHour(data.schedule[0]);
        setBlockData(blockData.blockedTimes);
        setBlockDataT(blockData.blockedTimes);

        console.log("API Schedules:->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", data);
        console.log(
          "API block:->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",
          blockData.blockedTimes
        );
      } catch (err) {
        console.error(err);
        console.log("API Schedules:->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", err);
      }
    };

    fetchSchedules();
  }, []);

  const formatDate = (timeString) => {
    const date = new Date(timeString);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });

    return { day, month, weekday };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-25 to-teal-50">
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
              My Schedule
            </h1>
            <p className="text-emerald-700">
              Manage your daily activities and stay organized
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowOfficeForm(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-green-700 to-emerald-800 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <span className="text-xl">🏢</span>
              Add Daily Office Time
            </button>
            <button
              onClick={() => {
                setShowBlockForm(true);
                seterror("");
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <span className="text-xl">🔒</span>
              Create Block Schedule
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {workHour && (
            <div
              key={workHour.id}
              className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <div className="bg-gradient-to-br from-green-600 to-emerald-700 h-2"></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg">🏢</span>
                    <h3 className="text-xl font-bold text-gray-800 leading-tight">
                      Work Hour
                    </h3>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDelete(workHour.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <span className="text-sm">🗑️</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-2 rounded-xl flex-shrink-0">
                      <span className="text-white text-sm">🕐</span>
                    </div>
                    <span className="font-medium text-sm">
                      {workHour.startTime} - {workHour.endTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-2 rounded-xl flex-shrink-0">
                      <span className="text-white text-sm">👤</span>
                    </div>
                    <span className="font-medium text-sm">{workHour.role}</span>
                  </div>

                  <p className="text-gray-600 leading-relaxed pl-11 text-sm">
                    from sunday to friday
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* blocked schedule */}
          {blockDataT.map((schedule) => (
            <div
              key={schedule.id}
              className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <div className={` h-2`}></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-200 shadow-lg rounded-2xl p-4 text-white text-center min-w-[80px] transform group-hover:scale-110 transition-transform duration-300`}
                  >
                    <div className="text-xs font-semibold opacity-90 uppercase tracking-wide">
                      {formatDate(schedule.startTime).weekday}
                    </div>
                    <div className="text-2xl font-bold leading-none mt-1">
                      {formatDate(schedule.startTime).day}
                    </div>
                    <div className="text-xs font-medium opacity-90 uppercase mt-1">
                      {formatDate(schedule.startTime).month}
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <span className="text-sm">🗑️</span>
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg"></span>
                    <h3 className="text-xl font-bold text-gray-800 leading-tight">
                      {schedule.title}
                    </h3>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className={` p-2 rounded-xl flex-shrink-0`}>
                      <span className="text-white text-sm">🕐</span>
                    </div>
                    <span className="font-medium text-sm">
                      {formatTime(schedule.startTime)} -{" "}
                      {formatTime(schedule.endTime)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Office Time Form Modal */}
        {showOfficeForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
              <div className="flex justify-between items-center p-6 border-b border-emerald-100">
                <h3 className="text-2xl font-bold text-emerald-800">
                  Add Daily Office Time
                </h3>
                <button
                  onClick={() => setShowOfficeForm(false)}
                  className="p-2 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 rounded-xl transition-all"
                >
                  <span className="text-lg">×</span>
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-emerald-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      step="1800" // 30-min steps
                      value={officeData.startTime}
                      onChange={(e) => {
                        const value = e.target.value;
                        const [hours, minutes] = value.split(":").map(Number);
                        console.log(hours);

                        if (minutes % 30 !== 0) {
                          alert(
                            "Please select time in 30-minute intervals (e.g., 2:00, 2:30)."
                          );
                          return;
                        }

                        setOfficeData({
                          ...officeData,
                          startTime: value,
                        });
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-emerald-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      step="1800" // 30-min steps
                      value={officeData.endTime} // Changed from officeData.startTime
                      onChange={(e) => {
                        const value = e.target.value;
                        const [hours, minutes] = value.split(":").map(Number);
                        console.log(hours);
                        if (minutes % 30 !== 0) {
                          alert(
                            "Please select time in 30-minute intervals (e.g., 2:00, 2:30)."
                          );
                          return;
                        }

                        setOfficeData({
                          ...officeData,
                          endTime: value, // Changed from startTime: value
                        });
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-emerald-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={officeData.role}
                    onChange={(e) =>
                      setOfficeData({ ...officeData, role: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                    placeholder="e.g., Senior Web Developer"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowOfficeForm(false)}
                    className="flex-1 px-6 py-3 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleOfficeSubmit}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-700 to-emerald-800 text-white hover:shadow-lg transform hover:scale-105 transition-all"
                  >
                    Add Office Time
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Block Schedule Form Modal */}
        {showBlockForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
              <div className="flex justify-between items-center p-6 border-b border-emerald-100">
                <h3 className="text-2xl font-bold text-emerald-800">
                  Create Block Schedule
                </h3>
                <button
                  onClick={() => setShowBlockForm(false)}
                  className="p-2 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 rounded-xl transition-all"
                >
                  <span className="text-lg">×</span>
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-emerald-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={blockData.title}
                    onChange={(e) =>
                      setBlockData({
                        ...blockData,
                        title: e.target.value,
                      })
                    }
                    placeholder="e.g., Doctor 22"
                    className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-emerald-700 mb-2">
                      Start Time (Nepal Time)
                    </label>
                    <input
                      type="datetime-local"
                      step="1800" // 30-minute intervals
                      value={(() => {
                        if (!blockData.startTime) return "";

                        // Convert UTC ISO to Nepal time for display
                        const utcDate = new Date(blockData.startTime);

                        // Add Nepal offset (5 hours 45 minutes) to UTC
                        const nepalTime = new Date(
                          utcDate.getTime() + (5 * 60 + 45) * 60 * 1000
                        );

                        // Format for datetime-local input without timezone issues
                        const year = nepalTime.getUTCFullYear();
                        const month = String(
                          nepalTime.getUTCMonth() + 1
                        ).padStart(2, "0");
                        const day = String(nepalTime.getUTCDate()).padStart(
                          2,
                          "0"
                        );
                        const hours = String(nepalTime.getUTCHours()).padStart(
                          2,
                          "0"
                        );
                        const minutes = String(
                          nepalTime.getUTCMinutes()
                        ).padStart(2, "0");

                        return `${year}-${month}-${day}T${hours}:${minutes}`;
                      })()}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!value) return;

                        // Validate 30-minute intervals first
                        const [datePart, timePart] = value.split("T");
                        const [hours, minutes] = timePart
                          .split(":")
                          .map(Number);

                        if (minutes % 30 !== 0) {
                          alert(
                            "Please select time in 30-minute intervals (e.g., 2:00, 2:30)."
                          );
                          return;
                        }

                        // Treat the datetime-local value as Nepal time and convert to UTC
                        const inputAsNepalTime = new Date(value);

                        // Since datetime-local is treated as local time, we need to offset it properly
                        // Get the local timezone offset and Nepal offset
                        const localOffset =
                          inputAsNepalTime.getTimezoneOffset(); // minutes
                        const nepalOffsetMinutes = -(5 * 60 + 45); // Nepal is UTC+5:45, so -345 minutes from UTC

                        // Convert to UTC: add local offset, subtract Nepal offset
                        const utcTime = new Date(
                          inputAsNepalTime.getTime() +
                            (localOffset - nepalOffsetMinutes) * 60 * 1000
                        );

                        setBlockData({
                          ...blockData,
                          startTime: utcTime.toISOString(),
                        });
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-emerald-700 mb-2">
                      End Time (Nepal Time)
                    </label>
                    <input
                      type="datetime-local"
                      step="1800" // 30-minute intervals
                      value={(() => {
                        if (!blockData.endTime) return "";

                        const utcDate = new Date(blockData.endTime);

                        const nepalTime = new Date(
                          utcDate.getTime() + (5 * 60 + 45) * 60 * 1000
                        );

                        const year = nepalTime.getUTCFullYear();
                        const month = String(
                          nepalTime.getUTCMonth() + 1
                        ).padStart(2, "0");
                        const day = String(nepalTime.getUTCDate()).padStart(
                          2,
                          "0"
                        );
                        const hours = String(nepalTime.getUTCHours()).padStart(
                          2,
                          "0"
                        );
                        const minutes = String(
                          nepalTime.getUTCMinutes()
                        ).padStart(2, "0");

                        return `${year}-${month}-${day}T${hours}:${minutes}`;
                      })()}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!value) return;

                        const [datePart, timePart] = value.split("T");
                        const [, timeOnly] = value.split("T");
                        const [hours, minutes] = timeOnly
                          .split(":")
                          .map(Number);

                        if (minutes % 30 !== 0) {
                          alert(
                            "Please select time in 30-minute intervals (e.g., 2:00, 2:30)."
                          );
                          return;
                        }

                        const inputAsNepalTime = new Date(value);

                        const localOffset =
                          inputAsNepalTime.getTimezoneOffset(); // minutes
                        const nepalOffsetMinutes = -(5 * 60 + 45); // Nepal is UTC+5:45, so -345 minutes from UTC

                        const utcTime = new Date(
                          inputAsNepalTime.getTime() +
                            (localOffset - nepalOffsetMinutes) * 60 * 1000
                        );

                        setBlockData({
                          ...blockData,
                          endTime: utcTime.toISOString(),
                        });
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowBlockForm(false)}
                    className="flex-1 px-6 py-3 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBlockSubmit}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:shadow-lg transform hover:scale-105 transition-all"
                  >
                    Create Block
                  </button>
                </div>

                {error && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      backgroundColor: "#e74c3c",
                      color: "#fff",
                    }}
                  >
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSchedulePage;
