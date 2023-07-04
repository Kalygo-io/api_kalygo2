import Queue from "bull";

export const jobQueue = new Queue("jobQueue", "redis://127.0.0.1:6379");
