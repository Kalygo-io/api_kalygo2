import { Request } from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import { s3Client } from "@/clients/s3_client";

const multerS3Middleware = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: "kalygo-documents",
    metadata: function (req: Request, file: any, cb: any) {
      console.log("--- multerS3 metadata ---");
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req: Request, file: any, cb: any) {
      console.log("--- multerS3 key ---");
      cb(null, Date.now().toString());
    },
  }),
});

export { multerS3Middleware };
