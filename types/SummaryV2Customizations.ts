import { SummaryMode } from "@prisma/client";

export type SummaryV2Customizations = {
  format: "bullet-points" | "paragraph";
  mode: SummaryMode;
  length: string;
  language: string;
  model: "gpt-3.5-turbo" | "gpt-4";
};
