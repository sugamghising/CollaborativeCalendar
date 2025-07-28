import crypto from "crypto"
import prisma from "../config/db"

export async function generateUniqueInviteCode(length = 8): Promise<string> {
  while (true) {
    const code = crypto.randomBytes(length).toString("hex").slice(0, length);
    const team = await prisma.team.findUnique({ where: { inviteCode: code } });
    
    if (!team) {
      return code;
    }
  }
}
