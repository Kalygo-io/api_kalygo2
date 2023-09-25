##

SELECT
   table_name,
   column_name,
   data_type
FROM
   information_schema.columns
WHERE
   table_name = 'city';

##

https://www.prisma.io/docs/reference/database-reference/connection-urls
https://developer.mozilla.org/en-US/docs/Glossary/percent-encoding

##

select * from "Account"

##

DELETE FROM "Account" WHERE id = 13;

## Dumping or Backing up the database

- pg_dump -h localhost -U <DB_USERNAME> -d <DB> > kalygo.sql
- scp -i <PEM_FILE> <USER>@<IP_ADDRESS>:~/src/kalygo.sql ./kalygo.sql

##

update "Account" set "emailVerificationToken"=null, "emailVerified"=true where id=21;

##

DELETE FROM "Account" WHERE id=26;

##

npx prisma db seed

##

INSERT INTO AccountsAndAccessGroups ("accountId", "accessGroupId", "createdById")
VALUES (1,10,1);