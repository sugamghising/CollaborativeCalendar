import express from "express";
import { completeSignup, emailcodeVerify, forgotPassword, forgotPasswordcodeVerify, forgotPasswordfill, login, signupEmailcode } from "../controllers/auth.controller";


const authRouter = express.Router();

authRouter.post("/signupEmailcode",signupEmailcode);
authRouter.post("/emailcodeVerify",emailcodeVerify);
authRouter.post("/completeSignup",completeSignup);
authRouter.post("/login",login);
authRouter.post("/forgotPasswordcode",forgotPassword);
authRouter.post("/forgotPasswordcodeVerify",forgotPasswordcodeVerify);
authRouter.post("/forgotPasswordfill",forgotPasswordfill)


export default authRouter;
