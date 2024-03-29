import { Request, Response, NextFunction } from "express";
// import request from 'request'
import prisma from "@/db/prisma_client";
import { s3 } from "@/clients/s3_client";

export async function downloadOriginalFileAsAttachment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET downloadOriginalFileAsAttachment");

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    const vectorSearch = await prisma.vectorSearch.findFirst({
      where: {
        // @ts-ignore
        requesterId: account?.id,
        id: parseInt(req.params.id),
      },
    });

    if (vectorSearch) {
      s3.getObject(
        {
          Bucket: vectorSearch.bucket,
          Key: vectorSearch.bucketKey,
        },
        async function (err, data) {
          if (err) {
            // cannot get file, err = AWS error response,
            // return json to client
            return res.status(500).json({ error: err });
          } else {
            res.attachment(vectorSearch.filename); // sets correct header (fixes your issue )
            // if all is fine, bucket and file exist, it will return file to client

            let getObjectResponse = await s3.getObject({
              Bucket: vectorSearch.bucket,
              Key: vectorSearch.bucketKey,
            });

            // @ts-ignore
            getObjectResponse?.Body?.pipe(res);
          }
        }
      );

      //   res.status(200).json(vectorSearch);
    } else {
      res.status(404).send();
    }
  } catch (e) {
    next(e);
  }
}
