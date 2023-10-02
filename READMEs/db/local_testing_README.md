# Local testing

## Start docker

open -a Docker

## Launch a PostgreSQL container

- docker pull postgres:15
- docker run --name kalygo-test -e POSTGRES_PASSWORD=mysecretpassword -d -p 5432:5432 postgres
- docker ps

- docker run -it --rm postgres psql -h 172.17.0.2 -U postgres √

```
    in sql:
        CREATE USER kalygo WITH PASSWORD 'test';
        CREATE DATABASE kalygo;
        GRANT ALL PRIVILEGES ON DATABASE kalygo TO kalygo;
        GRANT ALL ON SCHEMA public TO kalygo;
        ALTER ROLE "kalygo" WITH LOGIN; <-- if necessary -->

        ALTER USER kalygo CREATEDB;
        \q

    in shell: 

    docker run -it --rm postgres psql -h 172.17.0.2 -U kalygo -d kalygo

    in sql:
        \c kalygo

        CREATE TABLE public.films (
            code        char(5) CONSTRAINT firstkey PRIMARY KEY,
            title       varchar(40) NOT NULL,
            kind        varchar(10)
        );
```

docker run -it --rm postgres psql -h 172.17.0.2 -U postgres -d kalygo
docker run -it --rm postgres psql -h 172.17.0.2 -U kalygo -d kalygo
psql -h localhost -U username -d database_name

## After launching PostgreSQL container

- ALTER USER kalygo CREATEDB; <!-- for the prisma shadow db -->
- npx prisma migrate dev --name init

## Migrations

npx prisma migrate dev --name <name_of_migration_here>

## Run pending migrations

npx prisma migrate dev

## Setting up an ADMIN role

INSERT INTO "Role" ("type", "accountId", "createdAt") VALUES ('ADMIN', 105, NOW());