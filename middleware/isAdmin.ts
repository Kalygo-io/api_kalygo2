import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { NextFunction, Request, Response } from "express";

export default async function isAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = (req as any).user;
  
  if (user) {
    const roles = await prisma.role.findMany({
      where: {
        account: {
          id: user.id
        },
      },
  });  
    if (roles.some(role => role.type === 'ADMIN')) {
      next();
    } else {
      res.status(403).send('Access Denied');
    }
  } else {
    res.status(403).send('Access Denied');
  }
}
