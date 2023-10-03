import { Request, Response, NextFunction } from "express";
// import request from 'request'
import prisma from "@/db/prisma_client";
import { s3 } from "@/clients/s3_client";

export async function downloadFile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET downloadFile");

    console.log("req.params", req.params);

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    const file = await prisma.file.findFirst({
      where: {
        id: parseInt(req.params.id),
        ownerId: account?.id,
      },
    });

    if (file) {
      s3.getObject(
        {
          Bucket: file.bucket,
          Key: file.key,
        },
        async function (err, data) {
          if (err) {
            // cannot get file, err = AWS error response,
            // return json to client
            return res.status(500).json({ error: err });
          } else {
            console.log("STREAMING THA FILE...");

            // res.attachment(file.originalName); // sets correct header (fixes your issue )
            // // if all is fine, bucket and file exist, it will return file to client

            // console.log("Bucket", file.bucket);
            // console.log("Key", file.key);

            // let getObjectResponse = await s3.getObject({
            //   Bucket: file.bucket,
            //   Key: file.key,
            // });

            // // @ts-ignore
            // getObjectResponse?.Body?.pipe(res);

            res.attachment(file.originalName); // sets correct header (fixes your issue )
            //if all is fine, bucket and file exist, it will return file to client

            let getObjectResponse = await s3.getObject({
              Bucket: file.bucket,
              Key: file.key,
            });

            // @ts-ignore
            getObjectResponse?.Body?.pipe(res);
          }
        }
      );
    } else {
      res.status(404).send();
    }
  } catch (e) {
    next(e);
  }
}
