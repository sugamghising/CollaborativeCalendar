import prisma from "../config/db";


export const checkTimeSlotAvailability = async (
  attendeeIds: number[],
  start: Date,
  end: Date
): Promise<{ allAvailable: boolean; unavailableUsers: number[] }> => {
  const unavailableUsers: number[] = [];

  for (const userId of attendeeIds) {
    // 1. Check BlockedTimes overlap
    const blocked = await prisma.blockedTime.findFirst({
      where: {
        userId,
        OR: [
          { startTime: { lt: end }, endTime: { gt: start } } // overlap condition
        ]
      }
    });
    if (blocked) {
      unavailableUsers.push(userId);
      continue;
    }

    // 2. Check Meeting overlap
    const meetingConflict = await prisma.meetingUser.findFirst({
      where: {
        userId,
        meeting: {
          status: "SCHEDULED",
          scheduledAt: { not: null },
          // meeting overlaps with the requested slot
          AND: [
            { scheduledAt: { lt: end } },
            {
              scheduledAt: {
                gt: new Date(start.getTime() - 1000 * 60 * 60 * 12) // cover possible start
              }
            }
          ]
        }
      },
      include: { meeting: true }
    });

    if (
      meetingConflict &&
      meetingConflict.meeting.scheduledAt &&
      new Date(meetingConflict.meeting.scheduledAt.getTime() + meetingConflict.meeting.duration * 60000) > start
    ) {
      unavailableUsers.push(userId);
      continue;
    }

    // 3. Check recurring IndividualSchedule
    const weekday = start.getDay(); // 0-6
    const startStr = start.toTimeString().slice(0, 5); // "HH:MM"
    const endStr = end.toTimeString().slice(0, 5);

    const schedules = await prisma.individualSchedule.findMany({
      where: { userId, dayOfWeek: weekday, isVisible: true }
    });

    if (schedules.length > 0) {
      // must have at least one AVAILABLE/PREFERRED slot that fully covers [start, end]
      const fits = schedules.some(s =>
        (s.type === "AVAILABLE" || s.type === "PREFERRED") &&
        s.startTime <= startStr &&
        s.endTime >= endStr
      );

      if (!fits) {
        unavailableUsers.push(userId);
        continue;
      }
    }
  }

  return {
    allAvailable: unavailableUsers.length === 0,
    unavailableUsers
  };
};
export const replaceLowPriorityMeeting = async (
  attendeeIds: number[],
  start: Date,
  end: Date,
  currentPriority: string
): Promise<boolean> => {

  if (currentPriority !== "HIGH") return false;

  for (const userId of attendeeIds) {
    const conflictingMeeting = await prisma.meetingUser.findFirst({
      where: {
        userId,
        meeting: {
          status: "SCHEDULED",
          priority: { in: ["LOW", "MEDIUM"] }, 
          scheduledAt: { not: null },
          AND: [
            { scheduledAt: { lt: end } },
            { scheduledAt: { gte: start } }
          ]
        }
      },
      include: { meeting: true }
    });

    if (conflictingMeeting) {
      await prisma.meeting.update({
        where: { id: conflictingMeeting.meetingId },
        data: { status: "CANCELLED", scheduledAt: null }
      });
      
      console.log(`Cancelled lower priority meeting: ${conflictingMeeting.meeting.title}`);
      return true;
    }
  }
  
  return false;
};
// Simple function to find next available time during business hours
export const findNextAvailableTime = async (
  attendeeIds: number[],
  originalStart: Date,
  duration: number
): Promise<Date | null> => {
  let currentDate = new Date(originalStart);
  let businessDaysSearched = 0;
  const maxBusinessDays = 5;
  
  // console.log(`Starting search from: ${currentDate.toDateString()} (${getDayName(currentDate.getDay())})`);
  
  while (businessDaysSearched < maxBusinessDays) {
    // If current day is weekend, skip to Monday
    if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
      console.log(`Skipping weekend: ${currentDate.toDateString()}`);
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(9, 0, 0, 0);
      continue; // Don't count weekend as business day
    }
    
    // console.log(`🔍 Searching business day ${businessDaysSearched + 1}/5: ${currentDate.toDateString()} (${getDayName(currentDate.getDay())})`);
    
    // Search 9 AM to 5 PM on this business day
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Skip lunch hour (1 PM)
        if (hour === 13) continue;
        
        const currentStart = new Date(currentDate);
        currentStart.setHours(hour, minute, 0, 0);
        const currentEnd = new Date(currentStart.getTime() + duration * 60000);
        
        // Skip if meeting runs past 5 PM or into lunch
        if (currentEnd.getHours() > 17 || 
            (currentStart.getHours() < 13 && currentEnd.getHours() >= 13)) {
          continue;
        }
        
        // Skip past times
        if (currentStart <= new Date()) continue;
        
        const availability = await checkTimeSlotAvailability(attendeeIds, currentStart, currentEnd);
        
        if (availability.allAvailable) {
          console.log(`✅ Found slot: ${currentStart.toLocaleString()}`);
          return currentStart;
        }
      }
    }
    
    // Finished searching this business day, move to next day
    businessDaysSearched++; // Count this as a completed business day
    currentDate.setDate(currentDate.getDate() + 1);
    currentDate.setHours(9, 0, 0, 0);
  }
  
  console.log(`❌ No slots found in ${maxBusinessDays} business days`);
  return null;
};