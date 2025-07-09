import express from "express";
import { completeSignup, emailcodeVerify, login, signupEmailcode } from "../controllers/auth.contoller";


const authRouter = express.Router();

authRouter.post("/signupEmailcode",signupEmailcode);
authRouter.post("/emailcodeVerify",emailcodeVerify);
authRouter.post("/completeSignup",completeSignup);
authRouter.post("/login",login);

export default authRouter;
