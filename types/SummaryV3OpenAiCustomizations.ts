import { SummaryMode } from "@prisma/client";
import { SupportedOpenAiModels } from "./SupportedOpenAiModels";

export type SummaryV3OpenAiCustomizations = {
  format: "bullet-points" | "paragraph";
  mode: SummaryMode;
  length: string;
  language: string;
  model: SupportedOpenAiModels;
};
