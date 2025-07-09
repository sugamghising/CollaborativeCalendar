import jwt, { SignOptions } from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET");

interface JwtPayload {
  userId: number;
  iat?: number;
  exp?: number;
}

export const createVerifiedToken = (
  userId: number,
  timePeriod: number
): string => {
 
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: timePeriod,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
