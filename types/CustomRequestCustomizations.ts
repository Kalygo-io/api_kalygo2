import { ScanningMode } from "@prisma/client";
import { SupportedOpenAiModels } from "./SupportedOpenAiModels";

export type CustomRequestCustomizations = {
  prompt: string;
  finalPrompt: string | null;
  overallPrompt: string | null;
  mode: ScanningMode;
  model: SupportedOpenAiModels;
};
