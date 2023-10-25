import { CustomRequestV2OpenAiCustomizations } from "./CustomRequestV2OpenAiCustomizations";
import { CustomRequestV2ReplicateCustomizations } from "./CustomRequestV2ReplicateCustomizations";
import { SupportedOpenAiModels } from "./SupportedOpenAiModels";

export type CustomRequestV2Params = {
  files: Express.Multer.File[] | null;
  file: Express.Multer.File | null;
  customizations:
    | CustomRequestV2OpenAiCustomizations
    | CustomRequestV2ReplicateCustomizations;
  email: string;
  model: SupportedOpenAiModels;
  batchId: string;
  locale: string;
};
