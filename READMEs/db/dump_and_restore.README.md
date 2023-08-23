# What you need

pg_dumpall -U postgres -h localhost -p 5432 --clean --file=dump.sql
psql -h localhost -U postgres -p 5432 kalygo < dump.sql

- scp -i <PEM_FILE> <USER>@<IP_ADDRESS>:~/dump.sql ./kalygo_8_7_2023.sql

# Restoring dumped DB into dockerized Postgres DB

cat db_backups/kalygo_8_23_2023.sql | docker exec -i kalygo-test psql -U postgres -d kalygo