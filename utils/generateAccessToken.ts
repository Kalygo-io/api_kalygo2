import jwt from "jsonwebtoken";

export function generateAccessToken(email: string, roles: string[]) {
  const accessToken = jwt.sign({ email, roles }, process.env.JWT_SECRET!, {
    expiresIn: "1 day",
    algorithm: "HS256",
  });

  return accessToken;
}
