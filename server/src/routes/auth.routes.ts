import express from "express";
import { completeSignup, emailcodeVerify, signupEmailcode } from "../controllers/auth.contoller";


const authRouter = express.Router();

authRouter.post("/signupEmailcode",signupEmailcode);
authRouter.post("/emailcodeVerify",emailcodeVerify);
authRouter.post("/completeSignup",completeSignup);

export default authRouter;
