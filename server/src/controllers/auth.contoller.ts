import { Request, Response } from "express";
import { completeSignupUser, loginService, requestVerificationCode, verifyCode } from "../services/auth.service";
import { sendVerificationEmail } from "../utils/email";
import { completeSignupVerifySchema, emailcodeSchema, emailcodeVerifySchema, loginSchema } from "../types/types";
import { hashPassword } from "../utils/hashPassword";
import { createVerifiedToken, verifyToken } from "../utils/jwt";


export const signupEmailcode = async (req: Request, res: Response) => {
    const parsedData = emailcodeSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({
            message:"invalid schema!!!",
            error:parsedData.error.flatten().fieldErrors
        });
        return
    }
    try {
        const {email}=parsedData.data
        const {code}= await requestVerificationCode(email)
    
        await sendVerificationEmail(email,code)

        res.status(200).json({message:"Verification code has been sent"})
    } catch (error) {
        res.status(500).json({error:"couldnot send code"})
    }
};

export const emailcodeVerify =async(req:Request,res:Response)=>{
    const parsedData = emailcodeVerifySchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({
            message:"invalid schema!!!",
            error:parsedData.error.flatten().fieldErrors
        });
        return
    }
    try {
        const {email,code}=parsedData.data
        const id=await verifyCode(email,code)
        const expiredIn=60*10 // 10 minute
        const token = createVerifiedToken(id,expiredIn);
        res.status(200).json({
            message:"Verification code has been verified sucessfully",
            token
        })
    } catch (error) {
         res.status(500).json({error:"couldnot verify the code"})
    }
}

export const completeSignup=async(req:Request,res:Response)=>{
    const parsedData = completeSignupVerifySchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({
            message:"invalid schema!!!",
            error:parsedData.error.flatten().fieldErrors
        });
        return
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
         res.status(401).json({ message: "Missing or invalid token" });
         return;
     }
    try {
        const token = authHeader.split(" ")[1];
        const { userId } = verifyToken(token);
        const {name,password} =parsedData.data;
        const hashedpassword= await hashPassword(password)
        await completeSignupUser(userId,name,hashedpassword)
        const expiredIn=60*60*24*7
        const sessionToken= createVerifiedToken(userId,expiredIn)
        res.status(200).json({
            message:"complete the signup process suceessfully",
            sessionToken
        })
    } catch (error) {
        res.status(500).json({
            erro:"server error!!!"
        })
    }
}

export const login=async(req:Request,res:Response)=>{
    const parsedData = loginSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({
            message:"invalid schema!!!",
            error:parsedData.error.flatten().fieldErrors
        });
        return
    }
    try {
        const {email,password}=parsedData.data
        const {isVerified,userId}=await loginService(email,password)
        if(isVerified){
            const expiredIn=60*60*24*7//7days
            const SessionToken=createVerifiedToken(userId,expiredIn)
            res.status(200).json({
                message:"login successfully!!!",
                SessionToken
            })
        }
    } catch (error) {
        res.status(500).json({error:"couldnot verify the code"})
    }
}