Kalygo API 2.0

curl -X POST https://hooks.zapier.com/hooks/catch/13166575/3dzuxn1/
   -H "Content-Type: application/json"
   -d '{"email": "tad@cmdlabs.io", "name": "tad"}'

curl -X POST http://localhost:3000/api/v1/mailing/join
   -H "Content-Type: application/json"
   -d '{"email": "thaddadavis@gmail.com", "name": "tad"}' 

   ## TIPS

   - need to seed db with the "Public" access group with id 1 ie: `npx prisma db seed`
   - need to seed db with the "Admin" access group with id 2 ie: `npx prisma db seed`
