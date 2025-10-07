import { Request, Response } from "express";
import { createMeetingSchema } from "../types/types";
import prisma from "../config/db";
import { calculatePriorityScore, checkTimeSlotAvailability, findNextAvailableTime, replaceLowPriorityMeeting, scoreToPriority, } from "../services/event.service";



export const getmeetings = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  try {
    const userTeam = await prisma.userTeam.findFirst({
      where: {
        userId,
        status: "ACCEPTED"
      },
      select: { teamId: true }
    });

    if (!userTeam) {
      res.status(200).json({
        message: "No team found",
        meetings: []
      });
      return;
    }
    const meetings = await prisma.meeting.findMany({
      where: {
        teamId: userTeam.teamId
      },
      include: {
        team: {
          select: { name: true }
        },
        creator: {
          select: { name: true, email: true }
        },
        attendees: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      message: "Meetings fetched successfully",
      meetings,
      total: meetings.length,
      teamId: userTeam.teamId
    });

  } catch (error) {
    console.log("Error fetching meetings:", error);
    res.status(500).json({
      error: "Could not fetch meetings"
    });
  }
};

// export const createschedule = async (req: Request, res: Response) => {
//     const parsedData = createscheduleSchema.safeParse(req.body);
//     if(!parsedData.success){
//         res.status(400).json({
//             message:"invalid schema!!!",
//             error:parsedData.error.flatten().fieldErrors
//         });
//         return
//     }
//    const { title, duration,preferredStart, priority, teamId, attendeeIds } = parsedData.data;
//    const createdBy = req.user!.userId;
//     try {

//      const creatorMembership = await prisma.userTeam.findFirst({
//             where: { userId: createdBy, teamId, status: "ACCEPTED" }
//         });
        
//         if (!creatorMembership) {
//             res.status(403).json({ message: "You are not a member of this team" });
//             return;
//         }
//         const attendeesResult = await prisma.userTeam.findMany({
//             where: { 
//                 userId: { in: attendeeIds }, 
//                 teamId, 
//                 status: "ACCEPTED" 
//             }
//         });
//           if (attendeesResult.length !== attendeeIds.length) {
//             const validAttendeeIds = attendeesResult.map(m => m.userId);
//             const invalidIds = attendeeIds.filter(id => !validAttendeeIds.includes(id));
            
//             res.status(400).json({ 
//                 message: "Some attendees are not team members",
//                 invalidAttendeeIds: invalidIds
//             });
//             return;
//         }
//         const preferredDate = new Date(preferredStart);
//         const preferredEndTime = new Date(preferredDate.getTime() + duration * 60000);
        
//         console.log("Checking preferred time:", {
//             start: preferredDate,
//             end: preferredEndTime,
//             dayOfWeek: preferredDate.getDay(),
//             timeOnly: preferredDate.toTimeString().slice(0, 5)
//         });

//         const availability = await checkTimeSlotAvailability(attendeeIds, preferredDate, preferredEndTime);
        
//         if (availability.allAvailable) {
//             const meeting = await prisma.meeting.create({
//                 data: {
//                     title,
//                     duration,
//                     priority,
//                     teamId,
//                     createdBy,
//                     scheduledAt: preferredDate,
//                     status: "SCHEDULED",
//                     attendees: {
//                         create: attendeeIds.map(userId => ({ userId, isRequired: true }))
//                     }
//                 },
//                 include: {
//                     attendees: { include: { user: { select: { name: true, email: true } } } }
//                 }
//             });

//             res.status(201).json({
//                 message: "Meeting scheduled at your preferred time!",
//                 meeting,
//                 timeSlot: { start: preferredDate, end: preferredEndTime }
//             });
//             return;
//         }
//      const replaced = await replaceLowPriorityMeeting(attendeeIds, preferredDate, preferredEndTime, priority);
    
//       if (replaced) {
//       const meeting = await prisma.meeting.create({
//         data: {
//           title, duration, priority, teamId, createdBy,
//           scheduledAt: preferredDate,
//           status: "SCHEDULED",
//           attendees: {
//             create: attendeeIds.map(userId => ({ userId, isRequired: true }))
//           }
//         }
//       });

//       res.status(201).json({
//         message: "High priority meeting scheduled! Lower priority meeting was moved.",
//         meeting,
//         scheduledTime: preferredDate,
//         note: "A lower priority meeting was cancelled to make room"
//       });
//       return;
//     }
//     // Step 3: Find next available time by incrementing
//     const nextAvailableTime = await findNextAvailableTime(attendeeIds, preferredDate, duration);

//     if (nextAvailableTime) {
//       const meeting = await prisma.meeting.create({
//         data: {
//           title, duration, priority, teamId, createdBy,
//           scheduledAt: nextAvailableTime,
//           status: "SCHEDULED",
//           attendees: {
//             create: attendeeIds.map(userId => ({ userId, isRequired: true }))
//           }
//         }
//       });

//       res.status(201).json({
//         message: "Meeting scheduled at next available time",
//         meeting,
//         originalTime: preferredDate,
//         scheduledTime: nextAvailableTime,
//         note: `Moved from ${preferredDate.toLocaleString()} to ${nextAvailableTime.toLocaleString()}`
//       });
//       return;
//     }
// // Step 4: If no time found, create as PENDING
//     const meeting = await prisma.meeting.create({
//       data: {
//         title, duration, priority, teamId, createdBy,
//         status: "PENDING",
//         attendees: {
//           create: attendeeIds.map(userId => ({ userId, isRequired: true }))
//         }
//       }
//     });

//     res.status(202).json({
//       message: "Meeting created but could not be scheduled automatically",
//       meeting,
//       note: "No available time found in the next 24 hours. Schedule manually later."
//     })


       
//     } catch (error) {
//         console.log("error while sending the signupEmailcode ",error)
//         res.status(500).json({error:"couldnot send code"})
//     }
// };

export const cancelmeeting = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { meetingId } = req.body;

  // Validation
  if (!meetingId) {
    res.status(400).json({ 
      message: "Invalid schema!!!",
      error: "meetingId is missing"
    });
    return; // Fixed: Added return
  }

  if (!Number.isInteger(meetingId)) {
    res.status(400).json({
      message: "Invalid data type",
      error: "meetingId must be a valid integer"
    });
    return; // Fixed: Added return
  }

  try {
    // First check if meeting exists and user can cancel it
    const meeting = await prisma.meeting.findFirst({
      where: {
        id: meetingId,
        createdBy: userId // Only creator can cancel
      }
    });

    if (!meeting) {
      res.status(404).json({
        message: "Meeting not found or you don't have permission to cancel",
        error: "Meeting not found or not created by you"
      });
      return;
    }

    // Check if meeting is already cancelled or completed
    if (meeting.status === "CANCELLED") {
      res.status(400).json({
        message: "Meeting is already cancelled",
        meetingId: meetingId
      });
      return;
    }

    // Cancel the meeting
    const cancelledMeeting = await prisma.meeting.update({ // Fixed: update not upsert
      where: {
        id: meetingId
      },
      data: {
        status: "CANCELLED"
      },
      include: {
        team: {
          select: { name: true }
        },
        attendees: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });

    res.status(200).json({
      message: "Meeting cancelled successfully",
      meeting: cancelledMeeting
    });

  } catch (error) {
    console.log("Error cancelling meeting:", error);
    res.status(500).json({
      error: "Could not cancel meeting"
    });
  }
};
export const createschedule = async (req: Request, res: Response) => {
  const parsedData = createMeetingSchema.safeParse(req.body);
  
  if (!parsedData.success) {
    res.status(400).json({
      message: "Invalid schema!",
      error: parsedData.error.flatten().fieldErrors
    });
    return;
  }

  const { title, duration, preferredStart, importance, deadline, teamId, attendeeIds } = parsedData.data;
  const createdBy = req.user!.userId;

  try {
    // Verify creator is team member
    const creatorMembership = await prisma.userTeam.findFirst({
      where: { userId: createdBy, teamId, status: "ACCEPTED" }
    });
    
    if (!creatorMembership) {
      res.status(403).json({ message: "You are not a member of this team" });
      return;
    }

    // Verify all attendees are team members
    const attendeesResult = await prisma.userTeam.findMany({
      where: { 
        userId: { in: attendeeIds }, 
        teamId, 
        status: "ACCEPTED" 
      }
    });

    if (attendeesResult.length !== attendeeIds.length) {
      const validAttendeeIds = attendeesResult.map(m => m.userId);
      const invalidIds = attendeeIds.filter(id => !validAttendeeIds.includes(id));
      
      res.status(400).json({ 
        message: "Some attendees are not team members",
        invalidAttendeeIds: invalidIds
      });
      return;
    }

    // Calculate priority score
    const priorityScore = calculatePriorityScore({
      importance,
      deadline,
      duration
    });

    const priority = scoreToPriority(priorityScore);
    const preferredDate = new Date(preferredStart);
    const preferredEndTime = new Date(preferredDate.getTime() + duration * 60000);

    console.log("Priority calculation:", {
      importance,
      deadline,
      duration,
      calculatedScore: priorityScore,
      priority
    });

    // Step 1: Check if preferred time is available
    const availability = await checkTimeSlotAvailability(attendeeIds, preferredDate, preferredEndTime);
    
    if (availability.allAvailable) {
      const meeting = await prisma.meeting.create({
        data: {
          title,
          duration,
          priority,
          priorityScore,
          deadline: new Date(deadline),
          teamId,
          createdBy,
          scheduledAt: preferredDate,
          status: "SCHEDULED",
          attendees: {
            create: attendeeIds.map(userId => ({ userId, isRequired: true }))
          }
        },
        include: {
          attendees: { include: { user: { select: { name: true, email: true } } } }
        }
      });

      res.status(201).json({
        message: "Meeting scheduled at your preferred time!",
        meeting,
        timeSlot: { start: preferredDate, end: preferredEndTime },
        priorityScore
      });
      return;
    }

    // Step 2: Try to replace lower priority meeting
    const replaced = await replaceLowPriorityMeeting(attendeeIds, preferredDate, preferredEndTime, priorityScore);
    
    if (replaced) {
      const meeting = await prisma.meeting.create({
        data: {
          title,
          duration,
          priority,
          priorityScore,
          deadline: new Date(deadline),
          teamId,
          createdBy,
          scheduledAt: preferredDate,
          status: "SCHEDULED",
          attendees: {
            create: attendeeIds.map(userId => ({ userId, isRequired: true }))
          }
        },
        include: {
          attendees: { include: { user: { select: { name: true, email: true } } } }
        }
      });

      res.status(201).json({
        message: "High priority meeting scheduled! Lower priority meeting was moved.",
        meeting,
        scheduledTime: preferredDate,
        priorityScore,
        note: "A lower priority meeting was cancelled to make room"
      });
      return;
    }

    // Step 3: Find next available time
    const nextAvailableTime = await findNextAvailableTime(attendeeIds, preferredDate, duration);

    if (nextAvailableTime) {
      const meeting = await prisma.meeting.create({
        data: {
          title,
          duration,
          priority,
          priorityScore,
          deadline: new Date(deadline),
          teamId,
          createdBy,
          scheduledAt: nextAvailableTime,
          status: "SCHEDULED",
          attendees: {
            create: attendeeIds.map(userId => ({ userId, isRequired: true }))
          }
        },
        include: {
          attendees: { include: { user: { select: { name: true, email: true } } } }
        }
      });

      res.status(201).json({
        message: "Meeting scheduled at next available time",
        meeting,
        originalTime: preferredDate,
        scheduledTime: nextAvailableTime,
        priorityScore,
        note: `Moved from ${preferredDate.toLocaleString()} to ${nextAvailableTime.toLocaleString()}`
      });
      return;
    }

    // Step 4: Create as PENDING if no time found
    const meeting = await prisma.meeting.create({
      data: {
        title,
        duration,
        priority,
        priorityScore,
        deadline: new Date(deadline),
        teamId,
        createdBy,
        status: "PENDING",
        attendees: {
          create: attendeeIds.map(userId => ({ userId, isRequired: true }))
        }
      },
      include: {
        attendees: { include: { user: { select: { name: true, email: true } } } }
      }
    });

    res.status(202).json({
      message: "Meeting created but could not be scheduled automatically",
      meeting,
      priorityScore,
      note: "No available time found in the next 7 days. Schedule manually later."
    });

  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({ error: "Could not create meeting" });
  }
};

