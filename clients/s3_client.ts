import { S3, S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

export const s3 = new S3({
  region: process.env.AWS_REGION,
});

export { GetObjectCommand };
