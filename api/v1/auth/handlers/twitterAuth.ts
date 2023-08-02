import axios from "axios";
import { Request, Response } from "express";
import crypto from "crypto";

const TWITTER_OAUTH_CLIENT_ID = process.env.TWITTER_CLIENT_ID!;
const REDIRECT_URI = `http://www.localhost:3001/oauth/twitter`;
const TWITTER_OAUTH_TOKEN_URL = "https://api.twitter.com/2/oauth2/token";
const TWITTER_OAUTH_AUTHORIZE_URL = "https://twitter.com/i/oauth2/authorize";
const generateRandomString = () => {
  return crypto.randomBytes(64).toString('hex');
}
const generateCodeChallenge = (codeVerifier: string) => {
  return crypto.createHash('sha256').update(codeVerifier).digest('base64');
}

type TwitterTokenResponse = {
  token_type: "bearer";
  expires_in: 7200;
  access_token: string;
  scope: string;
};

const state = generateRandomString();
const codeVerifier = generateRandomString();
const codeChallenge = generateCodeChallenge(codeVerifier);

export async function getTwitterOAuthToken(code: string) {
  try {
    const res = await axios.post<TwitterTokenResponse>(
      TWITTER_OAUTH_TOKEN_URL,
      new URLSearchParams({
        client_id: TWITTER_OAUTH_CLIENT_ID,
        code_verifier: codeVerifier,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
        code: code
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return res.data;
  } catch (err) {
    console.log(err);
  }
}
export async function twitterOauth(req: Request<any, any, any, {code:string}>, res: Response) {
  const code = req.query.code;

  const TwitterOAuthToken = await getTwitterOAuthToken(code);
  console.log(TwitterOAuthToken);

  if (!TwitterOAuthToken) {
    return res.redirect(process.env.FRONTEND_HOSTNAME!);
  }
  return res.redirect(process.env.FRONTEND_HOSTNAME!);
}
export function redirectToTwitterOauth(req: Request, res: Response) {
  const url = `${TWITTER_OAUTH_AUTHORIZE_URL}?response_type=code&client_id=${TWITTER_OAUTH_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
  return res.redirect(url);
}
