import { CustomRequestV3OpenAiCustomizations } from "./CustomRequestV3OpenAiCustomizations";
import { CustomRequestV3ReplicateCustomizations } from "./CustomRequestV3ReplicateCustomizations";
import { SupportedOpenAiModels } from "./SupportedOpenAiModels";

export type CustomRequestV3Params = {
  files:
    | (Express.Multer.File & { bucket: string; key: string; etag: string })[]
    | null;
  file:
    | (Express.Multer.File & { bucket: string; key: string; etag: string })
    | null;
  customizations:
    | CustomRequestV3OpenAiCustomizations
    | CustomRequestV3ReplicateCustomizations;
  email: string;
  batchId: string;
  locale: string;
};
