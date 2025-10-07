
import { z} from "zod"

export const emailSchema=z.object({
    email:z.string().email(),
})
export const emailcodeVerifySchema=z.object({
    email:z.string().email(),
    code:z.string().length(6),
})
export const completeSignupVerifySchema=z.object({
    name:z.string().min(3),
    password:z.string().min(5)
})
export const loginSchema=z.object({
    email:z.string().email(),
    password:z.string().min(5)
})
export const forgotPasswordfillSchema=z.object({
    password:z.string().min(5)
})
export const joinTeamSchema=z.object({
    inviteCode:z.string().min(8)
})
export const createscheduleSchema=z.object({
    title:z.string().min(3),
    duration:z.number().min(30,"minimum 30 minutes"),
    preferredStart:z.string().datetime(),
    priority:z.enum(["LOW", "MEDIUM", "HIGH"]),
    teamId: z.number().int().positive(),
    attendeeIds: z.array(z.number().int().positive()).min(1, "Need at least one attendee")
})
export const createMeetingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  duration: z.number().min(15, "Duration must be at least 15 minutes").max(480, "Duration cannot exceed 8 hours"),
  preferredStart: z.string().datetime("Invalid datetime format"),
  importance: z.number().min(1, "Importance must be between 1-10").max(10, "Importance must be between 1-10"),
  deadline: z.string().datetime("Invalid deadline format"),
  teamId: z.number().int().positive("Team ID must be positive"),
  attendeeIds: z.array(z.number().int().positive()).min(1, "At least one attendee is required")
});
