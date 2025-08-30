import React, { useState } from "react";

const UserSchedulePage = () => {
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      title: "Morning Workout",
      startTime: "07:00",
      endTime: "08:00",
      description: "Cardio + Strength Training",
      role: "Personal",
      type: "regular", // regular, office, block
      color: "bg-gradient-to-br from-emerald-500 to-green-600",
    },
    {
      id: 2,
      title: "Office Work",
      startTime: "09:00",
      endTime: "17:00",
      description: "Frontend development & team meeting",
      role: "Professional",
      type: "regular",
      color: "bg-gradient-to-br from-emerald-600 to-teal-600",
    },
    {
      id: 3,
      title: "Evening Study",
      startTime: "19:30",
      endTime: "21:00",
      description: "Computer Science Algorithms Practice",
      role: "Education",
      type: "regular",
      color: "bg-gradient-to-br from-green-500 to-emerald-500",
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showOfficeForm, setShowOfficeForm] = useState(false);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    startTime: "",
    endTime: "",
    description: "",
    role: "",
  });

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

  // Updated color system based on type
  const getScheduleColor = (type, role = null) => {
    if (type === "office") {
      return "bg-gradient-to-br from-green-600 to-emerald-700"; // Dark green for office
    } else if (type === "block") {
      return "bg-gradient-to-br from-emerald-400 to-green-500"; // Medium green for blocks
    } else {
      // For regular schedules, use role-based colors in green theme
      const roleColors = {
        Personal: "bg-gradient-to-br from-emerald-300 to-green-400",
        Professional: "bg-gradient-to-br from-green-500 to-emerald-600",
        Education: "bg-gradient-to-br from-emerald-500 to-teal-500",
        Health: "bg-gradient-to-br from-green-400 to-emerald-500",
        Social: "bg-gradient-to-br from-teal-400 to-emerald-500",
        Other: "bg-gradient-to-br from-green-600 to-emerald-700",
      };
      return roleColors[role] || roleColors.Other;
    }
  };

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

  const handleSubmit = () => {
    if (
      !formData.title ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.role ||
      !formData.description
    ) {
      return;
    }

    const color = getScheduleColor("regular", formData.role);

    if (editingSchedule) {
      setSchedules(
        schedules.map((schedule) =>
          schedule.id === editingSchedule.id
            ? { ...formData, id: editingSchedule.id, color, type: "regular" }
            : schedule
        )
      );
      setEditingSchedule(null);
    } else {
      const newSchedule = {
        ...formData,
        id: Date.now(),
        color,
        type: "regular",
      };
      setSchedules([...schedules, newSchedule]);
    }

    resetForm();
  };

  const handleOfficeSubmit = () => {
    if (!officeData.startTime || !officeData.endTime || !officeData.role) {
      return;
    }

    const newOfficeSchedule = {
      id: Date.now(),
      title: "Daily Office Time",
      startTime: officeData.startTime,
      endTime: officeData.endTime,
      description: `Daily office hours as ${officeData.role}`,
      role: officeData.role,
      type: "office",
      color: getScheduleColor("office"),
    };

    setSchedules([...schedules, newOfficeSchedule]);
    setOfficeData({ startTime: "", endTime: "", role: "" });
    setShowOfficeForm(false);
  };

  const handleBlockSubmit = () => {
    if (!blockData.title || !blockData.startTime || !blockData.endTime) {
      return;
    }

    const newBlockSchedule = {
      id: Date.now(),
      title: blockData.title,
      startTime: blockData.startTime,
      endTime: blockData.endTime,
      description: "Block schedule",
      role: "Block Time",
      type: "block",
      color: getScheduleColor("block"),
    };

    setSchedules([...schedules, newBlockSchedule]);
    setBlockData({ title: "", startTime: "", endTime: "" });
    setShowBlockForm(false);
  };

  const handleEdit = (schedule) => {
    if (schedule.type === "regular") {
      setFormData({
        title: schedule.title,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        description: schedule.description,
        role: schedule.role,
      });
      setEditingSchedule(schedule);
      setShowAddForm(true);
    }
  };

  const handleDelete = (id) => {
    setSchedules(schedules.filter((schedule) => schedule.id !== id));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      startTime: "",
      endTime: "",
      description: "",
      role: "",
    });
    setEditingSchedule(null);
    setShowAddForm(false);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "office":
        return "🏢";
      case "block":
        return "🔒";
      default:
        return "📅";
    }
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
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <span className="text-xl">+</span>
              Add Schedule
            </button>
            <button
              onClick={() => setShowOfficeForm(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-green-700 to-emerald-800 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <span className="text-xl">🏢</span>
              Add Daily Office Time
            </button>
            <button
              onClick={() => setShowBlockForm(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <span className="text-xl">🔒</span>
              Create Block Schedule
            </button>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <div className={`${schedule.color} h-2`}></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg">
                      {getTypeIcon(schedule.type)}
                    </span>
                    <h3 className="text-xl font-bold text-gray-800 leading-tight">
                      {schedule.title}
                    </h3>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {schedule.type === "regular" && (
                      <button
                        onClick={() => handleEdit(schedule)}
                        className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                      >
                        <span className="text-sm">✏️</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <span className="text-sm">🗑️</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <div
                      className={`${schedule.color} p-2 rounded-xl flex-shrink-0`}
                    >
                      <span className="text-white text-sm">🕐</span>
                    </div>
                    <span className="font-medium text-sm">
                      {formatTime(schedule.startTime)} -{" "}
                      {formatTime(schedule.endTime)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-600">
                    <div
                      className={`${schedule.color} p-2 rounded-xl flex-shrink-0`}
                    >
                      <span className="text-white text-sm">👤</span>
                    </div>
                    <span className="font-medium text-sm">{schedule.role}</span>
                  </div>

                  <p className="text-gray-600 leading-relaxed pl-11 text-sm">
                    {schedule.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Regular Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-emerald-100">
                <h3 className="text-2xl font-bold text-emerald-800">
                  {editingSchedule ? "Edit Schedule" : "Add New Schedule"}
                </h3>
                <button
                  onClick={resetForm}
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
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                    placeholder="Enter schedule title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-emerald-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-emerald-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-emerald-700 mb-2">
                    Role/Category
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                  >
                    <option value="">Select a role</option>
                    <option value="Personal">Personal</option>
                    <option value="Professional">Professional</option>
                    <option value="Education">Education</option>
                    <option value="Health">Health</option>
                    <option value="Social">Social</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-emerald-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all resize-none outline-none"
                    placeholder="Enter schedule description"
                    rows="3"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={resetForm}
                    className="flex-1 px-6 py-3 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:shadow-lg transform hover:scale-105 transition-all"
                  >
                    {editingSchedule ? "Update" : "Add"} Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                      value={officeData.startTime}
                      onChange={(e) =>
                        setOfficeData({
                          ...officeData,
                          startTime: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-emerald-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={officeData.endTime}
                      onChange={(e) =>
                        setOfficeData({
                          ...officeData,
                          endTime: e.target.value,
                        })
                      }
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
                      setBlockData({ ...blockData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                    placeholder="e.g., Doctor Appointment"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-emerald-700 mb-2">
                      Start Time (ISO Format)
                    </label>
                    <input
                      type="datetime-local"
                      value={blockData.startTime}
                      onChange={(e) =>
                        setBlockData({
                          ...blockData,
                          startTime: e.target.value + ":00.000Z",
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-emerald-700 mb-2">
                      End Time (ISO Format)
                    </label>
                    <input
                      type="datetime-local"
                      value={blockData.endTime}
                      onChange={(e) =>
                        setBlockData({
                          ...blockData,
                          endTime: e.target.value + ":00.000Z",
                        })
                      }
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSchedulePage;
