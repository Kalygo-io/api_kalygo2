##

TIP: first log in as postgres

GRANT ALL ON SCHEMA public TO <user_name>;

##

INSERT INTO films VALUES ('12345', 'Bananas', 'Horror')

##

\c kalygo

##

CREATE TABLE public.films (
    code        char(5) CONSTRAINT firstkey PRIMARY KEY,
    title       varchar(40) NOT NULL,
    kind        varchar(10)
);

##

DELETE FROM "Account" WHERE id=81;

##

UPDATE "Account" SET "stripeId"='<STRIPE_ID>' WHERE id=<RECORD_ID_HERE>;
UPDATE "Account" SET "stripeId"='<STRIPE_ID>' WHERE id=<RECORD_ID_HERE>;

##

select * from "Account" where email='tad@cmdlabs.io';