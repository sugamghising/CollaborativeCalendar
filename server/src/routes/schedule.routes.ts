import express from "express";
import { authenticate } from "../middleware/auth.middleware";
import { createBlockedTime, createUserSchedule, deleteBlockedTime, getBlockedTimes, getIndividualSchedule } from "../controllers/schedule.controller";


const router = express.Router();




// Individual schedule
router.post("/createUserSchedule", authenticate, createUserSchedule);
router.get("/getIndividualSchedule", authenticate, getIndividualSchedule);

// Blocked time
router.post("/createBlockedTime", authenticate, createBlockedTime);
router.delete("/deleteBlockedTime/:id", authenticate, deleteBlockedTime);
router.get("/getBlockedTimes", authenticate, getBlockedTimes);

export default router;
