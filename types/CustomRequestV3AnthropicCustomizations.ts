import { ScanningMode } from "@prisma/client";
import { SupportedAnthropicModels } from "./SupportedAnthropicModels";

export type CustomRequestV3AnthropicCustomizations = {
  prompts: {
    prompt: string;
    finalPrompt: string | null;
    overallPrompt: string | null;
  };
  scanMode: ScanningMode;
  model: SupportedAnthropicModels;
  chunkTokenOverlap: number;
};
