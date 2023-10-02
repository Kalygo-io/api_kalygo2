# What you need

pg_dumpall -U postgres -h localhost -p 5432 --clean --file=dump.sql
psql -h localhost -U postgres -p 5432 kalygo < dump.sql

## locally

docker exec -i quirky_hermann /bin/bash -c "PGPASSWORD=<YOUR_PASSWORD_HERE> pg_dumpall -U postgres -h 172.17.0.2 -p 5432" > ./dump.sql

- scp -i <PEM_FILE> <USER>@<IP_ADDRESS>:~/dump.sql ./kalygo_8_7_2023.sql

# Restoring dumped DB into dockerized Postgres DB

cat db_backups/kalygo_8_23_2023.sql | docker exec -i kalygo-test psql -U postgres -d kalygo

## BACKUP DB WITH ANSIBLE

ansible-playbook --inventory inventory.prod --key-file "./*.pem" backup_db.yml


## HOW TO RESTORE DOCKERIZED POSTGRESQL 🏆

STEP 1 `docker exec -i quirky_hermann /bin/bash -c "PGPASSWORD=<YOUR_PASSWORD_HERE> pg_dumpall -U postgres -h 172.17.0.2 -p 5432" > ./dump.sql`
STEP 2 `docker rm kalygo-test`
STEP 3 `docker run --name kalygo-test -e POSTGRES_PASSWORD=mysecretpassword -d -p 5432:5432 postgres`
STEP 4 `cat dump.sql | docker exec -i kalygo-test psql -U postgres -d kalygo`