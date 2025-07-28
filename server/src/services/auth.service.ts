import prisma from "../config/db";
import { generateCode } from "../utils/generate";
import { comparePassword } from "../utils/hashPassword";

export const requestVerificationCode = async (email: string) => {
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { email } });
  }

  const code = generateCode();
  const expireAt = new Date(Date.now() + 20 * 60 * 1000); // 20 mins

  await prisma.verificationcode.upsert({
    where: { userId: user.id },
    update: { code, expireAt, attempts: 0 },
    create: {
      code,
      userId: user.id,
      types: "EMAIL_VERIFICATION",
      expireAt,
      attempts: 0
    }
  });
  return { email, code };
};

export const verifyCode = async (email: string, inputCode: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { verificationcode: true }
  });

  if (!user || !user.verificationcode) throw new Error("Invalid email");

  const { code, expireAt, attempts } = user.verificationcode;

  if (attempts >= 5) throw new Error("Too many attempts");
  if (expireAt < new Date()) throw new Error("Code expired");

  if (inputCode !== code) {
    await prisma.verificationcode.update({
      where: { userId: user.id },
      data: { attempts: { increment: 1 } }
    });
    throw new Error("Incorrect code");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified : true }
  });

  await prisma.verificationcode.delete({ where: { userId: user.id } });

  return user.id;
};

export const completeSignupUser = async (userId: number, name: string, passwordHash: string) => {
  const user = await prisma.user.update({
    where: { 
      id: userId,
      isVerified: true
    },
    data: { name, password: passwordHash }
  });

  return user;
};

export const loginService=async(email:string,password:string)=>{
  const user = await prisma.user.findFirst({
    where:{
      email
    },
  })
  if(!user?.password||!user){
    throw new Error("user doesnot exist in this email");
  }
  const ismatched=await comparePassword(password,user.password);
  
  return {isVerified:ismatched,userId:user.id}
}
export const requestForgotpasswordCode = async (email: string) => {
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
   throw new Error ("the email doesnot exist try signup first");
  }

  const code = generateCode();
  const expireAt = new Date(Date.now() + 20 * 60 * 1000); // 20 mins

  await prisma.verificationcode.upsert({
    where: { userId: user.id },
    update: { code, expireAt, attempts: 0 },
    create: {
      code,
      userId: user.id,
      types: "PASSWORD_RESET",
      expireAt,
      attempts: 0
    }
  });
  return { email, code };
};


