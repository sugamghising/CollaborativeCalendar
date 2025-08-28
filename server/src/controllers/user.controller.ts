import { Request, Response } from "express";
import prisma from "../config/db";
import { generateUniqueInviteCode } from "../utils/generateInviteCode";
import { emailSchema, joinTeamSchema } from "../types/types";



export const getUsers = async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.json(users);
};

export const createTeam = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const teamName = req.body.teamName;
  if (!userId) {
 res.status(401).json({ message: 'User not authenticated' });
 return
  }
  if (!teamName) {
     res.status(400).json({ message: 'Team name is required' });
     return
  }

  try {
    const inviteCode=await generateUniqueInviteCode()
    const team = await prisma.team.create({
      data: {
        name: teamName,
        inviteCode
      }
    });

   
    await prisma.userTeam.create({
      data: {
        userId: userId,
        teamId: team.id,
        role: 'LEADER', 
        status: 'ACCEPTED', 
        isActive: true
      }
    });

    res.status(201).json({ 
      message: 'Team created successfully',
      team: {
        id: team.id,
        name: team.name
      }
    });
 return
  } catch (error) {
    console.error('Error creating team:', error);
   res.status(500).json({ 
      message: 'Failed to create team',
      error: 'server error couldnot create a team'
    });
return
  }
};

export const joinTeam= async(req:Request,res:Response)=>{
  //  console.log("Incoming body:", req.body); 
  const parsedData=joinTeamSchema.safeParse(req.body);
  if(!parsedData.success){
    res.status(401).json({
      message:"Invalid schema!!",
      error:parsedData.error.flatten().fieldErrors
    });
    return;
  }
  try {
    const inviteCode=parsedData.data.inviteCode
   const userId=req.user!.userId
  const team = await prisma.team.findUnique({ where: { inviteCode } });
  if (!team) {
    res.status(400).json({ success: false, message: "Invalid invite code." });
    return 
  }

  const isMember = await prisma.userTeam.findFirst({
    where: { teamId: team.id, userId }
  });

  if (isMember) {
    res.status(400).json({ success: false, message: "Already in team." });
     return
  }
  await prisma.userTeam.create({
      data: {
        userId,
        teamId: team.id,
        status: "PENDING",
        role: "MEMBER",
        isActive: false,
      },
    });

  res.json({ success: true, message: "Successfully joined the team.", teamId: team.id });

  } catch (error) {
    console.log("error while joing team",error);
    res.status(500).json({
      success:false,
      message:"server error! couldnot join the team"
    })
  }
}

export const inviteTeamMember = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const parsedData = emailSchema.safeParse(req.body);
  
  if (!parsedData.success) {
    res.status(400).json({
      message: "Invalid schema",
      errors: parsedData.error.flatten().fieldErrors
    });
    return;
  }

  try {
    const userTeam = await prisma.userTeam.findFirst({
      where: {
        userId,
        role: "LEADER"
      },
      include: {
        Team: true
      }
    });

    if (!userTeam) {
      res.status(202).json({ 
        success: false, 
        message: "You do not have permission to invite team members" 
      });
      return;
    }
    const teamMember = await prisma.user.findUnique({
      where: { email: parsedData.data.email }
    });

    if (!teamMember) {
      res.status(202).json({  
        message: "User with this email does not exist" 
      });
      return;
    }

    if (teamMember.id === userId) {
      res.status(202).json({ 
        message: "You cannot invite yourself to the team" 
      });
      return;
    }

   
    const existing = await prisma.userTeam.findFirst({
      where: { 
        userId: teamMember.id, 
        teamId: userTeam.teamId 
      },
    });

    if (existing) {
      const statusMessage = existing.status === "PENDING" 
        ? "User already has a pending invitation" 
        : "User is already on the team";
      
      res.status(202).json({ 
        success: false, 
        message: statusMessage 
      });
      return;
    }

    await prisma.userTeam.create({
      data: {
        userId: teamMember.id,
        teamId: userTeam.teamId,
        status: "PENDING",
        role: "MEMBER",
        isActive: false,
      },
    });

    res.status(200).json({
      success: true,
      message: "Team invitation sent successfully",
      data: {
        invitedUser: {
          email: teamMember.email,
          name: teamMember.name
        },
        team: {
          name: userTeam.Team.name
        }
      }
    });

  } catch (error) {
    console.error("Error while inviting team member:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

export const acceptInvite = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { teamId } = req.body;

  try {
    const invitation = await prisma.userTeam.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId:Number(teamId)
        }
      }
    });

    if (!invitation || invitation.status !== "PENDING") {
      res.status(404).json({
        success: false,
        message: "No pending invitation found"
      });
       return
    }
    await prisma.userTeam.update({
      where: {
        userId_teamId: {
          userId,
          teamId:Number(teamId)
        }
      },
      data: {
        status: "ACCEPTED",
        isActive: true
      }
    });

   res.status(200).json({
      success: true,
      message: "Invitation accepted successfully"
    });

  } catch (error) {
    console.error("Error accepting invitation:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
      
    });
     return
  }
};


export const getTeamInvites = async (req: Request, res: Response) => {
  const userId = req.user!.userId; // logged-in user

  try {
    const invites = await prisma.userTeam.findMany({
      where: {
        userId,
        status: "PENDING", // only pending invites
      },
      include: {
        Team: {
          select: { id: true, name: true, inviteCode: true },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    res.status(200).json({
      message: "Team invites fetched successfully",
      total: invites.length,
      invites,
    });
  } catch (error) {
    console.error("Error fetching team invites:", error);
    res.status(500).json({ error: "Could not fetch team invites" });
  }
};



export const getTeam = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  
  try {
    // Get user's team with team details and all team members
    const userTeam = await prisma.userTeam.findFirst({
      where: {
        userId,
        status: "ACCEPTED" // Only accepted memberships
      },
      include: {
        Team: { // Fixed: Team not User (you want team info, not user info)
          select: {
            id: true,
            name: true,
            inviteCode: true,
            user: { // Get all team members
              where: {
                status: "ACCEPTED"
              },
              include: {
                User: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!userTeam) {
      res.status(200).json({
        message: "No team found",
        team: null,
        success: true // Fixed: success not succes
      });
      return;
    }

    res.status(200).json({ // Fixed: Added status code
      message: "Team fetched successfully",
      team: {
        id: userTeam.Team.id,
        name: userTeam.Team.name,
        inviteCode: userTeam.Team.inviteCode,
        members: userTeam.Team.user.map(member => ({
          id: member.User.id,
          name: member.User.name,
          email: member.User.email,
          role: member.role,
          isActive: member.isActive
        }))
      },
      success: true
    });

  } catch (error) {
    console.log("Error fetching team:", error);
    res.status(500).json({ // Fixed: Added status code
      message: "Could not fetch team",
      error: "Internal server error",
      success: false
    });
  }
};