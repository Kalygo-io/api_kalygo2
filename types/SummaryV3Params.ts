import { SummaryV3OpenAiCustomizations } from "./SummaryV3OpenAiCustomizations";
import { SummaryV3ReplicateCustomizations } from "./SummaryV3ReplicateCustomizations";

export type SummaryV3Params = {
  batchId: string;
  file:
    | (Express.Multer.File & { bucket: string; key: string; etag: string })
    | null;
  files:
    | (Express.Multer.File & {
        bucket: string;
        key: string;
        etag: string;
      })[]
    | null;
  customizations:
    | SummaryV3OpenAiCustomizations
    | SummaryV3ReplicateCustomizations;
  email: string;
  locale: string;
};
