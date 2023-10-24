import { ScanningMode } from "@prisma/client";
import { SupportedOpenAiModels } from "./SupportedOpenAiModels";

export type CustomRequestV2OpenAiCustomizations = {
  prompts: {
    prompt: string;
    finalPrompt: string | null;
    overallPrompt: string | null;
  };
  mode: ScanningMode;
  model: SupportedOpenAiModels;
  chunkTokenOverlap: number;
};
