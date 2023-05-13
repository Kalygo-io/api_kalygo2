# DB setup after installing

ie: sudo yum install postgresql15 postgresql15-server

## post install db admin setup

sudo postgresql-setup --initdb --unit postgresql

##

sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl status postgresql
TIP: sudo systemctl restart postgresql

## Configure PostgreSQL

REFERENCE LINKS: `https://linux.how2shout.com/how-to-install-postgresql-14-on-ec2-amazon-linux-2/` (generally good instructions that need tweaks)

sudo passwd postgres
su - postgres
psql -c "ALTER USER postgres WITH PASSWORD 'your-password';"

## If you need to edit database server config

sudo vi /var/lib/pgsql/data/postgresql.conf

TIP: take a backup

sudo cp /var/lib/pgsql/data/postgresql.conf /var/lib/pgsql/data/postgresql.conf.bak

## How to dump the DB

pg_dump -U username my_DB > my-backup_file.sql

## Testing loggin in as kalygo

- sudo nano /var/lib/pgsql/data/pg_hba.conf
- sudo vi /var/lib/pgsql/data/pg_hba.conf
- sudo adduser new_user
- cat /etc/passwd
- sudo vi /var/lib/pgsql/data/pg_hba.conf

## BIG TIP: switch the following local authentication method from `ident` to be `md5`

ie:
### "local" is for Unix domain socket connections only
local   all             all     
### IPv4 local connections:
host    all    all    127.0.0.1/32    md5

now this works! `psql -h 127.0.0.1 -U <user> -d <db>` √