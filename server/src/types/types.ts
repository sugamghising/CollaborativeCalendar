
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