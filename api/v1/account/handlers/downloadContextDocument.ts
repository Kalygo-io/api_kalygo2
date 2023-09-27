import { Request, Response, NextFunction } from "express";
// import request from 'request'
import prisma from "@/db/prisma_client";
import { s3 } from "@/clients/s3_client";

export async function downloadContextDocument(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST downloadContextDocument");

    console.log("req.body", req.body);

    const file = await prisma.file.findFirst({
      where: {
        id: parseInt(req.body.id),
        accountContextId: parseInt(req.body.accountContextId),
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
