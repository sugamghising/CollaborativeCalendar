import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { verifyToken } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
      };
    }
  }
}
const JWT_SECRET = process.env.JWT_SECRET;


export const authenticate = async (req: Request,res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
   res.status(401).json({ message: 'Unauthorized' });
    return 
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid user' });
      return
    }

    req.user = { userId: decoded.userId }; 
    next();
  } catch (err) {
     res.status(401).json({ message: 'Invalid or expired token' });
     return
  }
};
