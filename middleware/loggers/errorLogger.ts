import { createLogger, format } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const { combine, errors, json, timestamp } = format;

export const errorLogger = createLogger({
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports: [
    new DailyRotateFile({
      filename: "logs/application-error-%DATE%.log",
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});
