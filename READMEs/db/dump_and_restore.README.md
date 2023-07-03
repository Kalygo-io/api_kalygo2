pg_dumpall -U postgres -h localhost -p 5432 --clean --file=dump.sql

psql -h localhost -U postgres -p 5432 kalygo < dump.sql 