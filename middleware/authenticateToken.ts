import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export default function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("authenticating !!! token...");

  const jwtCookie = req.cookies["jwt"];
  const authHeaderCookie = req.headers?.authorization?.split(" ")[1];

  if (jwtCookie == null && authHeaderCookie == null) return res.sendStatus(401);

  const token = jwtCookie || authHeaderCookie;

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      console.log("denied X");
      return res.sendStatus(403);
    }

    console.log("authenticated √");
    // @ts-ignore
    req.user = user;

    next();
  });
}
