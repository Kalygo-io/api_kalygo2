import { SupportedOpenAiModels } from "@/types/SupportedOpenAiModels";
import { SupportedReplicateModels } from "@/types/SupportedReplicateModels";

export const supportedOpenAiModels: SupportedOpenAiModels[] = [
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-16k",
  "gpt-4o",
  "gpt-4o-mini",
];

export const supportedReplicateModels: SupportedReplicateModels[] = [
  "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
];
