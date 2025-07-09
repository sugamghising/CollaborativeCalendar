
import { string, z} from "zod"

export const emailcodeSchema=z.object({
    email:z.string().email(),
})
export const emailcodeVerifySchema=z.object({
    email:z.string().email(),
    code:z.string().length(6),
})
export const completeSignupVerifySchema=z.object({
    name:z.string().min(3),
    password:z.string().min(8)
})