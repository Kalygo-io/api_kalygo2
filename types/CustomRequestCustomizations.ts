import { ScanningMode } from "@prisma/client";

export type CustomRequestCustomizations = {
  prompt: string;
  mode: ScanningMode;
  model: "gpt-3.5-turbo" | "gpt-4";
};
