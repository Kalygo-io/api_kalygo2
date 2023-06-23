import Queue from "bull";

export const summarizationJobQueue = new Queue(
  "summarization",
  "redis://127.0.0.1:6379"
);
