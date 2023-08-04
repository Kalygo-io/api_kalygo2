import { SummarizationModes } from "./SummarizationModes";

export type SummaryV2Customizations = {
  format: "bullet-points" | "paragraph";
  mode: SummarizationModes;
  length: string;
  language: string;
  model: "gpt-3.5-turbo" | "gpt-4";
};
