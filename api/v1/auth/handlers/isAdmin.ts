import { Request, Response, NextFunction } from "express";

export async function isAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // @ts-ignore
    let { email } = req.user;

    const adminEmail = "example@example.com";

    if (email === adminEmail) {
        res.status(200).send();
      } else {
        res.status(403).send();
      }
    } catch (err) {
      next(err);
    }
  }
