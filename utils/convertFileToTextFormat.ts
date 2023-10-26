import { s3, GetObjectCommand } from "@/clients/s3_client";
import { convertPDFToText } from "@/utils/convertPDFToText";
import { streamToString } from "@/utils/streamToString";

export async function convertFileToTextFormat(
  file: Express.Multer.File & { bucket: string; key: string; etag: string }
) {
  let fileToText: {
    text: string;
    originalName: string;
  };

  console.log("file", file.originalname); // for console debugging...
  // -v-v- DOWNLOAD EACH FILE FROM S3 -v-v-
  const command = new GetObjectCommand({
    Bucket: file.bucket,
    Key: file.key,
  });
  const { Body } = await s3.send(command);
  let text;
  if (file.mimetype === "application/pdf") {
    // -v-v- IF PDF, THEN CONVERT TO TEXT -v-v-
    let pdfByteArray = await Body?.transformToByteArray();
    text = await convertPDFToText(pdfByteArray);
  } else {
    // -v-v- IF TEXT, THEN SIMPLY DOWNLOAD IT -v-v-
    text = (await streamToString(Body)) as string;
  }
  // -v-v- BUILD AN ARRAY OF THE TEXT-BASED VERSIONS OF EACH FILE -v-v-
  fileToText = {
    text,
    originalName: file.originalname,
  };

  return fileToText;
}
