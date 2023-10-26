import { ScanningMode } from "@prisma/client";
import { SupportedOpenAiModels } from "./SupportedOpenAiModels";

export type SummaryV3OpenAiCustomizations = {
  format: "bullet-points" | "paragraph";
  scanMode: ScanningMode;
  length: string;
  language: string;
  model: SupportedOpenAiModels;
  chunkTokenOverlap: number;
};
