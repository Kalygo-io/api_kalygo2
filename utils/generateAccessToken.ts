import jwt from "jsonwebtoken";

export function generateAccessToken(username: string) {
  return jwt.sign(username, process.env.JWT_SECRET!, {
    expiresIn: "2 hours",
  });
}
