import { s3, GetObjectCommand } from "@/clients/s3_client";
import { convertPDFToTextWithMetadata } from "@/utils/convertPDFToTextWithMetadata";
import { streamToString } from "@/utils/streamToString";

export async function convertFilesToTextFormatWithMetadata(
  files: any,
  bucket: string
) {
  const filesToText: {
    partsOfFile: any[];
    originalName: string;
  }[] = [];

  for (let fIndex = 0; fIndex < files.length; fIndex++) {
    console.log("file", files[fIndex].originalname);
    // -v-v- DOWNLOAD EACH FILE FROM S3 -v-v-
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: files[fIndex].key,
    });
    const { Body } = await s3.send(command);
    let text;
    if (files[fIndex].mimetype === "application/pdf") {
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
    // -v-v- BUILD AN ARRAY OF THE TEXT-BASED VERSIONS OF EACH FILE -v-v-
    filesToText.push({
      partsOfFile: text,
      originalName: files[fIndex].originalname,
    });
  }

  return filesToText;
}
