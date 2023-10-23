import { ScanningMode } from "@prisma/client";
import { SupportedOpenAiModels } from "./SupportedOpenAiModels";
import { SupportedReplicateModels } from "./SupportedReplicateModels";

export type SummaryV2Customizations = {
  format: "bullet-points" | "paragraph";
  scanMode: ScanningMode;
  length: string;
  language: string;
  model: SupportedOpenAiModels | SupportedReplicateModels;
};
