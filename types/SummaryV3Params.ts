import { SummaryV3OpenAiCustomizations } from "./SummaryV3OpenAiCustomizations";
import { SummaryV3ReplicateCustomizations } from "./SummaryV3ReplicateCustomizations";

export type SummaryV3Params = {
  batchId: string;
  bucket: string;
  file: Record<string, any>;
  customizations:
    | SummaryV3OpenAiCustomizations
    | SummaryV3ReplicateCustomizations;
  email: string;
  locale: string;
};
