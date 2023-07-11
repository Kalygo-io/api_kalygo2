import { NextFunction, Request, Response } from "express";

export default function isAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const user = (req as any).user;
    // @ts-ignore
    if (user && user.role === "admin") {
      next();
    } else {
      res.status(403).send('Access Denied');
    }
  }
  