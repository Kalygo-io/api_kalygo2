- Had to create the db following the instructions in `local_testing_README.md`

```
ALTER USER kalygo CREATEDB;
GRANT CREATE, USAGE ON SCHEMA public TO kalygo;
```

npx prisma migrate dev