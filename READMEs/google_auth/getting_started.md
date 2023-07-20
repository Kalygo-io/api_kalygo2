# Getting started


## Configuring your project

1. Visit https://cloud.google.com
2. Go to the console
3. In the top left, create a new project, give it a name, and click create
4. Click on your project once it's created, and head to the dashboard
5. Click on APIs & Services, and then 0auth consent screen
6. Select user type (external) and hit create
7. Fill in the necessary fields, hit save and continue
8. Select the scopes for users such as email, profile, etc, hit save and continue
9. Add test users for developing locally, continue, and head back to dashboard

## TAD SUMMARY of these above `Configuring your project` steps

1. Visit https://cloud.google.com -> cee******@gmail.com
2. Create a `Project` for the `Kalygo` to organize all resources in one workspace
3. Visit `APIs & Services` and select the area of the console that will take you to do `OAuth consent screen` panel
4. Select `OAuth consent screen` > `External`
5. Fill out form for `OAuth consent screen` > `Edit app registration`
    Provide field: `App information > App Name` -> Kalygo
    Provide field: `App information > User support email` -> cee******@gmail.com
    Provide field: `App logo > logo file to upload` -> KalygoLogoWithText.png
    Provide field: `Application home page` -> https://kalygo.io
    Provide field: `Application terms of service link` -> https://kalygo.io/terms-of-service

6. `SCOPES` - select `/auth/userinfo.email` & `/auth/userinfo.profile` then SAVE AND CONTINUE
7. `Test Users` - can edit anytime if needed


## Setting up credentials

1. Click on Credentials and on the top select Create Credentials, selecting 0Auth Client ID
2. Select Web Application, give it a name
3. Add 2 Authorized JavaScript origins. I did (http://localhost) first and (http://localhost:3001)

Hit create and save your clientID and secret

## TAD SUMMARY of these above `Setting up credentials` steps

1. Click on the Google Console side nav `Credentials` option
    - Select `Create Credentials`
    - Select `OAuth Client ID`
    - `Application type` -> "Web application"
    - `Authorized Javacript origin` will be needed at some point -> http://localhost, http://localhost:3001

2. Download JSON containing `OAuth Credentials` ie: `client_secret_********json`

3. Add entry form the JSON to .gitignore on the frontend AND the api repos

4. How to inject OAuth creds into FRONTEND and BACKEND

    `FRONTEND`
    - in .env.production.local
    - NEXT_PUBLIC_OAUTH_CLIENT_ID=<RELEVANT_CRED_IN_CLIENT_SECRET_JSON> ie: web.client_id

    `BACKEND`
    - in .env & PM2 ecosystem configuration
    - GOOGLE_CLIENT_ID ie: web.client_id
    - GOOGLE_OAUTH_CLIENT_SECRET ie: web.client_secret

PS: Also needed to run Prisma migration but irrevelant detail for this README


#### NOTE

GoogleSignUp and GoogleLogin express endpoints appeared/appear to work without providing or injecting the GOOGLE_CLIENT_ID/GOOGLE_OAUTH_CLIENT_SECRET environment variables