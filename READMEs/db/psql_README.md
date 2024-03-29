sudo -u postgres psql

## TIP FOR CREATING A DB USER?

CREATE ROLE your-username WITH PASSWORD 'password';
CREATE DATABASE database_name;
GRANT ALL PRIVILEGES ON DATABASE database_name TO your-username;
REVOKE DROP ON db FROM user; <!-- this did not work -->
\l
psql -h localhost -U username -d database_name
psql -h server-ip-address --U username  -d database_name

## USEFUL COMMANDS

DROP DATABASE <database_name>;
REVOKE ALL PRIVILEGES ON DATABASE <user_name> FROM <database_name>;
DROP USER <user_name>;

## REFERENCE LINKS

https://linux.how2shout.com/how-to-install-postgresql-14-on-ec2-amazon-linux-2/ (generally good instructions that need tweaks)

## connecting to database

\c <db_name>

## All accounts that have ran a summary

select distinct "SummaryV2"."requesterId", "Account".email from "SummaryV2", "Account" where "SummaryV2"."requesterId" = "Account"."id";

## All accounts that have ran a custom request

select distinct "CustomRequest"."requesterId", "Account".email from "CustomRequest", "Account" where "CustomRequest"."requesterId" = "Account"."id";
