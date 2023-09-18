import { ScanningMode } from "@prisma/client";
import { SupportedModels } from "./SupportedModels";

export type CustomRequestCustomizations = {
  prompt: string;
  finalPrompt: string | null;
  overallPrompt: string | null;
  mode: ScanningMode;
  model: SupportedModels;
};
