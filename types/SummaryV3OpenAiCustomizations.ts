import { ScanningMode } from "@prisma/client";
import { SupportedOpenAiModels } from "./SupportedOpenAiModels";

export type SummaryV3OpenAiCustomizations = {
  format: "bullet-points" | "paragraph";
  mode: ScanningMode;
  length: string;
  language: string;
  model: SupportedOpenAiModels;
  chunkTokenOverlap: number;
};
