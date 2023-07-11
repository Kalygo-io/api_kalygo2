import jwt from "jsonwebtoken";

export function generateAccessToken(email: string, role: string) {
  const accessToken = jwt.sign({ email, role }, process.env.JWT_SECRET!, {
    expiresIn: "1 day",
  });

  return accessToken;
}
