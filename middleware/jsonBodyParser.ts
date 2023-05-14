import { json } from "body-parser";
import * as http from "http";

export default json({
  inflate: true,
  limit: "100kb",
  type: "application/json",
  verify: (
    req: http.IncomingMessage,
    res: http.ServerResponse,
    buf: Buffer,
    encoding: string
  ) => {
    return true;
  },
});