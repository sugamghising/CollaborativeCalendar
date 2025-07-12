import { Request, Response } from "express";
import { completeSignupUser, loginService, requestForgotpasswordCode, requestVerificationCode, verifyCode } from "../services/auth.service";
import { sendForgotpasswordEmail, sendVerificationEmail } from "../utils/email";
import { completeSignupVerifySchema, emailSchema, emailcodeVerifySchema, forgotPasswordfillSchema, loginSchema } from "../types/types";
import { hashPassword } from "../utils/hashPassword";
import { createVerifiedToken, verifyToken } from "../utils/jwt";
import prisma from "../config/db";


export const signupEmailcode = async (req: Request, res: Response) => {
    const parsedData = emailSchema.safeParse(req.body);
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
        const expiredIn=60*20 // 20 minute
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
        }else {
            res.status(401).json({
                message: "Invalid credentials"
            });
        }
    } catch (error) {
         console.error('Login error:', error); 
        res.status(500).json({
            message:"couldnot verify the code",
            error: error instanceof Error ? error.message : "Internal server error"})
    }
}

export const forgotPassword=async(req:Request,res:Response)=>{
    const parsedData=emailSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(401).json({
            message:"invalid schema!!!",
            error:parsedData.error.flatten().fieldErrors
        })
        return;
    }
    try {
        const {email}=parsedData.data;
        const {email:Email,code}=await requestForgotpasswordCode(email);
        await sendForgotpasswordEmail(email,code)
        res.status(200).json({message:"Verification code has been sent"})
    } catch (error) {
        res.status(500).json({
            message:"couldnot sent the code",
            error:error instanceof Error? error.message:"internal server problem"
        })
    }
}

export const forgotPasswordcodeVerify =async(req:Request,res:Response)=>{
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
        const expiredIn=60*20 
        const token = createVerifiedToken(id,expiredIn);
        res.status(200).json({
            message:"Verification code has been verified sucessfully",
            token
        })
    } catch (error) {
        res.status(500).json({
            message:"couldnot verify the code",
            error:error instanceof Error? error.message:"internal server problem"
        })
    }
}
export const forgotPasswordfill=async(req:Request,res:Response)=>{
    const parsedData=forgotPasswordfillSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(401).json({
            message:"invalid schema",
            error:parsedData.error.flatten().fieldErrors
        });
        return
    }
    const authHeader=req.headers.authorization;
    if(!authHeader||!authHeader.startsWith("Bearer ")){
        res.status(401).json({
            message:"invalid,authorization headers missing"
        })
        return;
    }
    try {
         const {password}=parsedData.data;
         const token=authHeader.split(" ")[1]
         const {userId}=verifyToken(token)
         const hashedpassword=await hashPassword(password)
         const user = await prisma.user.update({
            where:{
                id:userId
            },
            data:{
                password:hashedpassword,
            }
         })
           const expiredIn=60*60*24*7//7days
            const SessionToken=createVerifiedToken(userId,expiredIn)
            res.status(200).json({
                message:"update password successfully!!!",
                SessionToken
            })
    } catch (error) {
          res.status(500).json({
            erro:"server error!!!"
        })
    }
}