import { ScanningMode } from "@prisma/client";
import { SupportedOpenAiModels } from "./SupportedOpenAiModels";

export type CustomRequestV3OpenAiCustomizations = {
  prompts: {
    prompt: string;
    finalPrompt: string | null;
    overallPrompt: string | null;
  };
  scanMode: ScanningMode;
  model: SupportedOpenAiModels;
  chunkTokenOverlap: number;
  chunkSize?: string;
};
