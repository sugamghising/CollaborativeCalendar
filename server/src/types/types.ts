
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