import { Request, Response, NextFunction } from "express";

export async function getAccessGroups(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("getAccessGroups");
    res.status(501).send();
  } catch (e) {
    next(e);
  }
}
