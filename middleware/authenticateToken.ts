import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export default function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const jwtCookie = req.cookies["jwt"];
  const token = jwtCookie;

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) return res.sendStatus(403);

    // @ts-ignore
    req.user = user;

    next();
  });
}
