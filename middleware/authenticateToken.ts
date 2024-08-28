import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export default function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("authenticating !!! token...");

  console.log("req.cookies", req.cookies);
  console.log("req.headers", req.headers);

  // const jwtCookie = req.cookies["jwt"];
  // const token = jwtCookie;

  const token = req.headers?.authorization?.split(" ")[1];

  if (token == null) return res.sendStatus(401);

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
