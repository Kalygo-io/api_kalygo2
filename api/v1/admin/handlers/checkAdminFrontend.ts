import { Request, Response, NextFunction } from "express";

export async function checkAdminFrontend(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        res.json({ isAdmin: true });
    } catch (e) {
        next(e);
    }
  }
