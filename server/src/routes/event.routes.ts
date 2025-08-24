import express from "express";

import { authenticate } from "../middleware/auth.middleware";
import { cancelmeeting, createschedule, getmeetings } from "../controllers/event.controller";

const router = express.Router();




router.post("/createschedule",authenticate,createschedule)
router.get("/getmeetings",authenticate,getmeetings)
router.post("/cancelmeeting",authenticate,cancelmeeting)
export default router;
