import { ScanningMode } from "@prisma/client";
import { SupportedReplicateModels } from "./SupportedReplicateModels";

export type SummaryV2ReplicateCustomizations = {
  format: "bullet-points" | "paragraph";
  mode: ScanningMode;
  length: string;
  language: string;
  model: SupportedReplicateModels;
};
