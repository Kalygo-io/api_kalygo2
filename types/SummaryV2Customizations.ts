import { SummaryMode } from "@prisma/client";
import { SupportedOpenAiModels } from "./SupportedOpenAiModels";
import { SupportedReplicateModels } from "./SupportedReplicateModels";

export type SummaryV2Customizations = {
  format: "bullet-points" | "paragraph";
  mode: SummaryMode;
  length: string;
  language: string;
  model: SupportedOpenAiModels | SupportedReplicateModels;
};
