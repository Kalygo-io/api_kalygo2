import { ScanningMode } from "@prisma/client";

export type CustomRequestCustomizations = {
  prompt: string;
  finalPrompt: string | null;
  overallPrompt: string | null;
  mode: ScanningMode;
  model: "gpt-3.5-turbo" | "gpt-4";
};
