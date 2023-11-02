import fs from "fs";

export async function convertFileOnDiskToTextFormat(filePath: string) {
  console.log("file", filePath); // for console debugging...

  const text = fs.readFileSync(`${filePath}`, "utf8");

  // -v-v- BUILD AN ARRAY OF THE TEXT-BASED VERSIONS OF EACH FILE -v-v-

  return text;
}
