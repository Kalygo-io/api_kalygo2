import jwt from "jsonwebtoken";

export function generateAccessToken(email: string) {
  const accessToken = jwt.sign({ email }, process.env.JWT_SECRET!, {
    expiresIn: "1 day",
  });

  return accessToken;
}
