import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export default function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("!#!#!");

  res.status(200).send();
  // const jwtCookie = req.cookies["jwt"];
  // const token = jwtCookie;

  // if (token == null) return res.sendStatus(401);

  // jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
  //   console.log(err);
  //   console.log(user);

  //   if (err) return res.sendStatus(403);

  //   // @ts-ignore
  //   req.user = user;

  //   next();
  // });
}
