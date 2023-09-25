import { NextFunction, Request, Response } from "express";
import HttpException from "../exceptions/HttpException";

import { errorLogger } from "./loggers";

function errorMiddleware(
  error: HttpException,
  request: Request,
  response: Response,
  next: NextFunction
) {
  console.log("! error middleware !");

  errorLogger.error(error);

  const status = error.status || 500;
  const message = error.message || "Something went wrong";
  const stack = error.stack || "";

  if (process.env.NODE_ENV === "production") {
    // response.status(status).send();
    response.status(status).json({
      status,
      message,
      stack,
    });
  } else {
    response.status(status).json({
      status,
      message,
      stack,
    });
  }
}

export default errorMiddleware;
