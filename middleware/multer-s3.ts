import { S3Client } from "@aws-sdk/client-s3";
import express, { Request } from "express";
import multer from "multer";
const multerS3 = require("multer-s3");

const app = express();

const s3 = new S3Client({});

const multerS3Middleware = multer({
  storage: multerS3({
    s3: s3,
    bucket: "some-bucket",
    metadata: function (req: Request, file: any, cb: any) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req: Request, file: any, cb: any) {
      cb(null, Date.now().toString());
    },
  }),
});

export { multerS3Middleware };

// app.post('/upload', upload.array('photos', 3), function(req, res, next) {
//   res.send('Successfully uploaded ' + req.files.length + ' files!')
// })
