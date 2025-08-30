import { Request, Response } from "express";
import { createscheduleSchema } from "../types/types";
import prisma from "../config/db";

export const getIndividualSchedule = async (req: Request, res: Response) => {
  const loggedInUserId = req.user!.userId;
  const userId = req.query.userId ? Number(req.query.userId) : loggedInUserId;

  try {
    const schedule = await prisma.individualSchedule.findMany({
      where: { userId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    res.status(200).json({
      message: `Schedule for user ${userId} fetched successfully`,
      total: schedule.length,
      schedule,
    });

  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({ error: "Could not fetch schedule" });
  }
};

export const createUserSchedule = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { startTime, endTime, role } = req.body;
    
  try {
    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    const weekdays = [1, 2, 3, 4, 5]; 

    const schedules = weekdays.map(day => ({
      userId,
      title:"Work Hours",
      dayOfWeek: day,
      startTime,
      endTime,
      role,
    }));

    await prisma.individualSchedule.createMany({
      data: schedules,
      skipDuplicates: true,
    });

    res.status(201).json({
      message: "Schedule with role created successfully",
      role,
      schedules,
    });

  } catch (error) {
    console.error("Error creating user schedule:", error);
    res.status(500).json({
      error: "Could not create schedule",
    });
  }
};
export const createBlockedTime = async (req: Request, res: Response) => {
  const userId = req.user!.userId;  
  const { title, startTime, endTime } = req.body;

  try {
    if (!startTime || !endTime) {
      return res.status(400).json({ error: "startTime and endTime are required" });
    }

    const blocked = await prisma.blockedTime.create({
      data: {
        userId,
        title: title || "Busy",
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    res.status(201).json({
      message: "Blocked time created successfully",
      blocked,
    });

  } catch (error) {
    console.error("Error creating blocked time:", error);
    res.status(500).json({
      error: "Could not create blocked time",
    });
  }
};
export const deleteBlockedTime = async (req: Request, res: Response) => {
  const userId = req.user!.userId;   // logged-in user
  const { id } = req.params;         // blockedTime id

  try {
   
    const blocked = await prisma.blockedTime.findUnique({
      where: { id: Number(id) }
    });

   if (!blocked) {
  return res.status(404).json({
    error: `Blocked time ,does not exist for this user`,
  });
}

if (blocked.userId !== userId) {
  return res.status(403).json({
    error: `You are not authorized to delete blocked time with id ${id}`,
  });
}

 
    await prisma.blockedTime.delete({
      where: { id: Number(id) }
    });

    res.status(200).json({
      message: "Blocked time deleted successfully",
      deletedId: Number(id),
    });

  } catch (error) {
    console.error("Error deleting blocked time:", error);
    res.status(500).json({
      error: "Could not delete blocked time",
    });
  }
};

export const getBlockedTimes = async (req: Request, res: Response) => {
  const loggedInUserId = req.user!.userId;
  const userId = req.query.userId ? Number(req.query.userId) : loggedInUserId;

  try {
    const blockedTimes = await prisma.blockedTime.findMany({
      where: { userId },
      orderBy: { startTime: "asc" },
    });

    res.status(200).json({
      message: `Blocked times for user ${userId} fetched successfully`,
      total: blockedTimes.length,
      blockedTimes,
    });

  } catch (error) {
    console.error("Error fetching blocked times:", error);
    res.status(500).json({ error: "Could not fetch blocked times" });
  }
};

