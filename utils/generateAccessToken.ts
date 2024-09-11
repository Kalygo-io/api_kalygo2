import jwt from "jsonwebtoken";

export function generateAccessToken(email: string, roles: string[]) {
  // iss (Issuer) Claim ie: `https://auth.example.com`
  // sub (Subject) Claim ie: `user12345` (or email or unique identifier)
  // aud (Audience) Claim ie: `https://api.example.com`
  // exp (Expiration Time) Claim ie: 1725233693 (unix timestamp)

  const accessToken = jwt.sign({ email, roles }, process.env.JWT_SECRET!, {
    expiresIn: "1 day",
  });

  // const accessToken = jwt.sign(
  //   { sub: email, id: account_id },
  //   process.env.JWT_SECRET!,
  //   {
  //     expiresIn: "1 day",
  //     algorithm: "HS256",
  //   }
  // );

  return accessToken;
}
