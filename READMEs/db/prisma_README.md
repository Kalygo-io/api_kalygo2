# Tips related to Prisma

##
npx prisma init
##
npx prisma generate
##
npx prisma migrate dev --name init
##
https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases/using-prisma-migrate-typescript-postgresql

# Running a migration

## Locally
npx prisma migrate dev --name add_stripe_id_to_account
## Production
npx prisma migrate deploy