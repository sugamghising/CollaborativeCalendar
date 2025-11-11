import prisma from "../config/db";



export const calculatePriorityScore = (factors: WeightedPriorityFactors): number => {
  const deadlineScore = calculateDeadlineScore(factors.deadline);
  const importanceScore = calculateImportanceScore(factors.importance);
  const durationScore = calculateDurationScore(factors.duration);

  const weightedScore = (0.5 * deadlineScore) + (0.2 * importanceScore) + (0.3 * durationScore);
  return Math.round(weightedScore * 100) / 100;
};





export const calculateDurationScore = (duration: number): number => {
 
  if (duration <= 30) return 0.9; 
  if (duration <= 60) return 0.7;
  if (duration <= 120) return 0.5;
  if (duration <= 240) return 0.3; 
  return 0.1;
};

export const calculateImportanceScore = (importance: number): number => {
  return importance / 10;
};

export const calculateDeadlineScore = (deadline: string): number => {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const timeDifference = deadlineDate.getTime() - now.getTime();
  
  
  if (timeDifference <= 0) return 1;
  
  const hoursUntilDeadline = timeDifference / (1000 * 60 * 60);
  
  // Scoring based on hours until deadline
  if (hoursUntilDeadline <= 2) return 1;
  if (hoursUntilDeadline <= 6) return 0.9; 
  if (hoursUntilDeadline <= 24) return 0.7;
  if (hoursUntilDeadline <= 72) return 0.5;
  if (hoursUntilDeadline <= 168) return 0.3; 
  return 0.1; 
};













// export const checkTimeSlotAvailability = async (
//   attendeeIds: number[],
//   start: Date,
//   end: Date
// ): Promise<{ allAvailable: boolean; unavailableUsers: number[] }> => {
//   const unavailableUsers: number[] = [];

//   for (const userId of attendeeIds) {
//     // 1. Check BlockedTimes overlap
//     const blocked = await prisma.blockedTime.findFirst({
//       where: {
//         userId,
//         OR: [
//           { startTime: { lt: end }, endTime: { gt: start } } // overlap condition
//         ]
//       }
//     });
//     if (blocked) {
//       unavailableUsers.push(userId);
//       continue;
//     }

//     // 2. Check Meeting overlap
//     const meetingConflict = await prisma.meetingUser.findFirst({
//       where: {
//         userId,
//         meeting: {
//           status: "SCHEDULED",
//           scheduledAt: { not: null },
//           // meeting overlaps with the requested slot
//           AND: [
//             { scheduledAt: { lt: end } },
//             {
//               scheduledAt: {
//                 gt: new Date(start.getTime() - 1000 * 60 * 60 * 12) // cover possible start
//               }
//             }
//           ]
//         }
//       },
//       include: { meeting: true }
//     });

//     if (
//       meetingConflict &&
//       meetingConflict.meeting.scheduledAt &&
//       new Date(meetingConflict.meeting.scheduledAt.getTime() + meetingConflict.meeting.duration * 60000) > start
//     ) {
//       unavailableUsers.push(userId);
//       continue;
//     }

//     // 3. Check recurring IndividualSchedule
//     const weekday = start.getDay(); // 0-6
//     const startStr = start.toTimeString().slice(0, 5); // "HH:MM"
//     const endStr = end.toTimeString().slice(0, 5);

//     const schedules = await prisma.individualSchedule.findMany({
//       where: { userId, dayOfWeek: weekday, isVisible: true }
//     });

//     if (schedules.length > 0) {
//       // must have at least one AVAILABLE/PREFERRED slot that fully covers [start, end]
//       const fits = schedules.some(s =>
//         (s.type === "AVAILABLE" || s.type === "PREFERRED") &&
//         s.startTime <= startStr &&
//         s.endTime >= endStr
//       );

//       if (!fits) {
//         unavailableUsers.push(userId);
//         continue;
//       }
//     }
//   }

//   return {
//     allAvailable: unavailableUsers.length === 0,
//     unavailableUsers
//   };
// };

// export const replaceLowPriorityMeeting = async (
//   attendeeIds: number[],
//   start: Date,
//   end: Date,
//   currentPriority: string
// ): Promise<boolean> => {

//   if (currentPriority !== "HIGH") return false;

//   for (const userId of attendeeIds) {
//     const conflictingMeeting = await prisma.meetingUser.findFirst({
//       where: {
//         userId,
//         meeting: {
//           status: "SCHEDULED",
//           priority: { in: ["LOW", "MEDIUM"] }, 
//           scheduledAt: { not: null },
//           AND: [
//             { scheduledAt: { lt: end } },
//             { scheduledAt: { gte: start } }
//           ]
//         }
//       },
//       include: { meeting: true }
//     });

//     if (conflictingMeeting) {
//       await prisma.meeting.update({
//         where: { id: conflictingMeeting.meetingId },
//         data: { status: "CANCELLED", scheduledAt: null }
//       });
      
//       console.log(`Cancelled lower priority meeting: ${conflictingMeeting.meeting.title}`);
//       return true;
//     }
//   }
  
//   return false;
// };
// Simple function to find next available time during business hours


// export const scoreToPriority = (score: number): 'LOW' | 'MEDIUM' | 'HIGH' => {
//   if (score >= 0.7) return 'HIGH';
//   if (score >= 0.4) return 'MEDIUM';
//   return 'LOW';
// };

export const findNextAvailableTime = async (
  attendeeIds: number[],
  preferredStart: Date,
  duration: number
): Promise<Date | null> => {
  const maxSearchHours = 24 * 7; // Search for next 7 days
  const incrementMinutes = 30; // Check every 30 minutes
  
  let currentTime = new Date(preferredStart);
  const searchLimit = new Date(currentTime.getTime() + maxSearchHours * 60 * 60 * 1000);

  while (currentTime < searchLimit) {
    const endTime = new Date(currentTime.getTime() + duration * 60000);
    
    // Skip if outside business hours (9 AM - 6 PM)
    const hour = currentTime.getHours();
    if (hour >= 9 && hour < 18) {
      const availability = await checkTimeSlotAvailability(attendeeIds, currentTime, endTime);
      
      if (availability.allAvailable) {
        return currentTime;
      }
    }
    
    // Increment by 30 minutes
    currentTime = new Date(currentTime.getTime() + incrementMinutes * 60000);
  }

  return null;
};

export const checkTimeSlotAvailability = async (
  attendeeIds: number[], 
  startTime: Date, 
  endTime: Date
): Promise<{ allAvailable: boolean; conflictingUsers: number[] }> => {
  // Check for existing meetings that overlap with our time slot
  const conflictingMeetings = await prisma.meeting.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledAt: {
        not: null,
        lte: endTime
      },
      attendees: {
        some: {
          userId: { in: attendeeIds }
        }
      }
    },
    include: {
      attendees: true
    }
  });

  const conflictingUsers: number[] = [];
  
  for (const meeting of conflictingMeetings) {
    if (meeting.scheduledAt) {
      const meetingEnd = new Date(meeting.scheduledAt.getTime() + meeting.duration * 60000);
      
      // Check if meetings overlap
      if (meeting.scheduledAt < endTime && meetingEnd > startTime) {
        const conflictingAttendees = meeting.attendees
          .filter(attendee => attendeeIds.includes(attendee.userId))
          .map(attendee => attendee.userId);
        
        conflictingUsers.push(...conflictingAttendees);
      }
    }
  }

  // Check blocked times
  const blockedTimes = await prisma.blockedTime.findMany({
    where: {
      userId: { in: attendeeIds },
      startTime: { lte: endTime },
      endTime: { gte: startTime }
    }
  });

  blockedTimes.forEach(blocked => {
    if (!conflictingUsers.includes(blocked.userId)) {
      conflictingUsers.push(blocked.userId);
    }
  });

  return {
    allAvailable: conflictingUsers.length === 0,
    conflictingUsers: [...new Set(conflictingUsers)]
  };
};


/**
 * Calculate weighted priority score
 * Formula: (0.5 * deadlineScore) + (0.2 * importanceScore) + (0.3 * durationScore)
 */















export interface WeightedPriorityFactors {
  importance: number;
  deadline: string;
  duration: number;
}
export const replaceLowPriorityMeeting = async (
  attendeeIds: number[],
  startTime: Date,
  endTime: Date,
  newMeetingScore: number
): Promise<boolean> => {
  const conflictingMeetings = await prisma.meeting.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledAt: {
        not: null,
        lte: endTime
      },
      attendees: {
        some: {
          userId: { in: attendeeIds }
        }
      }
    },
    orderBy: {
      priorityScore: 'asc' // Get lowest priority first
    }
  });

  for (const meeting of conflictingMeetings) {
    if (meeting.scheduledAt) {
      const meetingEnd = new Date(meeting.scheduledAt.getTime() + meeting.duration * 60000);
      
      // Check if meetings overlap and if new meeting has higher priority
      if (meeting.scheduledAt < endTime && meetingEnd > startTime && meeting.priorityScore < newMeetingScore) {
        // Cancel the lower priority meeting
        await prisma.meeting.update({
          where: { id: meeting.id },
          data: { 
            status: 'CANCELLED',
            scheduledAt: null
          }
        });
        return true;
      }
    }
  }

  return false;
};

export const scoreToPriority = (score: number): 'LOW' | 'MEDIUM' | 'HIGH' => {
  if (score >= 0.7) return 'HIGH';
  if (score >= 0.4) return 'MEDIUM';
  return 'LOW';
};