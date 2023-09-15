import { SummaryMode } from "@prisma/client";

export type SupportedModels = "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | "gpt-4";

export type SummaryV2Customizations = {
  format: "bullet-points" | "paragraph";
  mode: SummaryMode;
  length: string;
  language: string;
  model: SupportedModels;
};
