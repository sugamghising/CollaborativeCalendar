import express from "express";
import { acceptInvite, createTeam, getTeam, getUsers, inviteTeamMember, joinTeam } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", getUsers);


router.post("/createTeam",authenticate,createTeam)
router.post("/joinTeam",authenticate,joinTeam)
router.post("/inviteTeamMember",authenticate,inviteTeamMember)
router.post("/acceptInviteToTeam",authenticate,acceptInvite)
router.get("/getTeam",authenticate,getTeam)
export default router;
