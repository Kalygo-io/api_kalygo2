# TLDR

Reproducible steps for setting up a Postgres DB and running migrations

##

- 
- docker run --name kalygo-test -e POSTGRES_PASSWORD=secret -d -p 5432:5432 postgres
- docker run -it --rm postgres psql -h 172.17.0.2 -U postgres
  - NOTE: You may need to adjust local IP address
  - ie: docker inspect kalygo-test
- Set up the DB
```
    in sql:
        CREATE USER kalygo WITH PASSWORD 'test';
        CREATE DATABASE kalygo;
        GRANT ALL PRIVILEGES ON DATABASE kalygo TO kalygo;
        \c kalygo
        GRANT ALL ON SCHEMA public TO kalygo;
        ALTER USER kalygo CREATEDB;
        \q
```
- npx prisma migrate dev 