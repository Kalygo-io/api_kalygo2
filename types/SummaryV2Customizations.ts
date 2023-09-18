import { SummaryMode } from "@prisma/client";
import { SupportedModels } from "./SupportedModels";

export type SummaryV2Customizations = {
  format: "bullet-points" | "paragraph";
  mode: SummaryMode;
  length: string;
  language: string;
  model: SupportedModels;
};
