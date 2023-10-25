import { ScanningMode } from "@prisma/client";
import { SupportedReplicateModels } from "./SupportedReplicateModels";

export type CustomRequestV3ReplicateCustomizations = {
  prompts: {
    prompt: string;
    finalPrompt: string | null;
    overallPrompt: string | null;
  };
  scanMode: ScanningMode;
  model: SupportedReplicateModels;
  chunkTokenOverlap: number;
};
