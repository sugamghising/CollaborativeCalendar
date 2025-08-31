import React from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const events = [];

const Calendar = () => {
  const navigate = useNavigate();

  const handleSelectEvent = (event: any) => {
    // Navigate to event details or open a modal
    console.log("Event clicked:", event);
  };

  const handleSelectSlot = (slotInfo: any) => {
    // Handle slot selection (for creating new events)
    console.log("Slot selected:", slotInfo);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
        <button
          onClick={() => navigate("/events/new")}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <span>Create Event</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 h-[700px]">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          defaultView="month"
          views={["month", "week", "day", "agenda"]}
          popup
        />
      </div>
    </div>
  );
};

export default Calendar;
