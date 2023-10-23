import { s3, GetObjectCommand } from "@/clients/s3_client";
import { convertPDFToTextWithMetadata } from "@/utils/convertPDFToTextWithMetadata";
import { streamToString } from "@/utils/streamToString";

export async function convertFileToTextFormatWithMetadata(
  file: any,
  bucket: string
): Promise<{
  partsOfFile: any[];
  originalName: string;
}> {
  console.log("file", file.originalname); // for console debugging...
  // -v-v- DOWNLOAD EACH FILE FROM S3 -v-v-
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: file.key,
  });
  const { Body } = await s3.send(command);
  let text;
  if (file.mimetype === "application/pdf") {
    // -v-v- IF PDF, THEN CONVERT TO TEXT -v-v-
    let pdfByteArray = await Body?.transformToByteArray();
    text = await convertPDFToTextWithMetadata(pdfByteArray);
  } else {
    // -v-v- IF TEXT, THEN SIMPLY DOWNLOAD IT -v-v-
    //   text = (await streamToString(Body)) as string;
    throw new Error(
      "TODO: add support for more file types when performing convertFilesToTextFormatWithMetadata"
    );
  }

  return {
    partsOfFile: text,
    originalName: file.originalname,
  };
}
