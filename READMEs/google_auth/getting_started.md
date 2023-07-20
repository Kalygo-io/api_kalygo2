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

## Setting up credentials

1. Click on Credentials and on the top select Create Credentials, selecting 0Auth Client ID
2. Select Web Application, give it a name
3. Add 2 Authorized JavaScript origins. I did (http://localhost) first and (http://localhost:3001)

Hit create and save your clientID and secret