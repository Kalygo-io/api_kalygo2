--
-- PostgreSQL database cluster dump
--

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Drop databases (except postgres and template1)
--

DROP DATABASE kalygo;




--
-- Drop roles
--

DROP ROLE kalygo;
DROP ROLE postgres;


--
-- Roles
--

CREATE ROLE kalygo;
ALTER ROLE kalygo WITH NOSUPERUSER INHERIT NOCREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:uB4DwzDsZROFo/7/+pwgWw==$iZONqrcJxXp/v1SU6VyWhvPnuA8NAlOfmhAmC9gHWds=:4PrA2B8pX1mp0i+Rzuj50D9qVqpLEVkHmSBjb9QdgM8=';
CREATE ROLE postgres;
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:NyFZIxQ/5tKsLYLn05rpFA==$+o6JC5Kut7DNii0V7x6BU87YSEdprq9xZ9oZQW22X4k=:JhqTxA55gHg1i6R7I65JzuX4sJCUPyrUUyZ+vVUH/vA=';

--
-- User Configurations
--








--
-- Databases
--

--
-- Database "template1" dump
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.0
-- Dumped by pg_dump version 15.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

UPDATE pg_catalog.pg_database SET datistemplate = false WHERE datname = 'template1';
DROP DATABASE template1;
--
-- Name: template1; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE template1 WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C.UTF-8';


ALTER DATABASE template1 OWNER TO postgres;

\connect template1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE template1; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON DATABASE template1 IS 'default template for new databases';


--
-- Name: template1; Type: DATABASE PROPERTIES; Schema: -; Owner: postgres
--

ALTER DATABASE template1 IS_TEMPLATE = true;


\connect template1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE template1; Type: ACL; Schema: -; Owner: postgres
--

REVOKE CONNECT,TEMPORARY ON DATABASE template1 FROM PUBLIC;
GRANT CONNECT ON DATABASE template1 TO PUBLIC;


--
-- PostgreSQL database dump complete
--

--
-- Database "kalygo" dump
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.0
-- Dumped by pg_dump version 15.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: kalygo; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE kalygo WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C.UTF-8';


ALTER DATABASE kalygo OWNER TO postgres;

\connect kalygo

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: SubscriptionPlan; Type: TYPE; Schema: public; Owner: kalygo
--

CREATE TYPE public."SubscriptionPlan" AS ENUM (
    'FREE',
    'STANDARD',
    'PREMIUM'
);


ALTER TYPE public."SubscriptionPlan" OWNER TO kalygo;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: kalygo
--

CREATE TABLE public."Account" (
    id integer NOT NULL,
    email text NOT NULL,
    "firstName" text,
    "lastName" text,
    alias text,
    phone text,
    "passwordHash" text,
    "resetPasswordToken" text,
    "emailVerificationToken" text,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "stripeId" text DEFAULT ''::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone,
    "subscriptionPlan" public."SubscriptionPlan" DEFAULT 'FREE'::public."SubscriptionPlan" NOT NULL
);


ALTER TABLE public."Account" OWNER TO kalygo;

--
-- Name: Account_id_seq; Type: SEQUENCE; Schema: public; Owner: kalygo
--

CREATE SEQUENCE public."Account_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Account_id_seq" OWNER TO kalygo;

--
-- Name: Account_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kalygo
--

ALTER SEQUENCE public."Account_id_seq" OWNED BY public."Account".id;


--
-- Name: Feedback; Type: TABLE; Schema: public; Owner: kalygo
--

CREATE TABLE public."Feedback" (
    id integer NOT NULL,
    feedback text NOT NULL
);


ALTER TABLE public."Feedback" OWNER TO kalygo;

--
-- Name: Feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: kalygo
--

CREATE SEQUENCE public."Feedback_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Feedback_id_seq" OWNER TO kalygo;

--
-- Name: Feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kalygo
--

ALTER SEQUENCE public."Feedback_id_seq" OWNED BY public."Feedback".id;


--
-- Name: Login; Type: TABLE; Schema: public; Owner: kalygo
--

CREATE TABLE public."Login" (
    id integer NOT NULL,
    "accountId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public."Login" OWNER TO kalygo;

--
-- Name: Login_id_seq; Type: SEQUENCE; Schema: public; Owner: kalygo
--

CREATE SEQUENCE public."Login_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Login_id_seq" OWNER TO kalygo;

--
-- Name: Login_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kalygo
--

ALTER SEQUENCE public."Login_id_seq" OWNED BY public."Login".id;


--
-- Name: Summary; Type: TABLE; Schema: public; Owner: kalygo
--

CREATE TABLE public."Summary" (
    id integer NOT NULL,
    "requesterId" integer NOT NULL,
    content text NOT NULL,
    "condensedCharCount" integer NOT NULL,
    "originalCharCount" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone,
    "processedCharCount" integer DEFAULT 0 NOT NULL,
    filename text DEFAULT ''::text NOT NULL
);


ALTER TABLE public."Summary" OWNER TO kalygo;

--
-- Name: SummaryCredits; Type: TABLE; Schema: public; Owner: kalygo
--

CREATE TABLE public."SummaryCredits" (
    id integer NOT NULL,
    "accountId" integer NOT NULL,
    amount integer NOT NULL
);


ALTER TABLE public."SummaryCredits" OWNER TO kalygo;

--
-- Name: SummaryCredits_id_seq; Type: SEQUENCE; Schema: public; Owner: kalygo
--

CREATE SEQUENCE public."SummaryCredits_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."SummaryCredits_id_seq" OWNER TO kalygo;

--
-- Name: SummaryCredits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kalygo
--

ALTER SEQUENCE public."SummaryCredits_id_seq" OWNED BY public."SummaryCredits".id;


--
-- Name: Summary_id_seq; Type: SEQUENCE; Schema: public; Owner: kalygo
--

CREATE SEQUENCE public."Summary_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Summary_id_seq" OWNER TO kalygo;

--
-- Name: Summary_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kalygo
--

ALTER SEQUENCE public."Summary_id_seq" OWNED BY public."Summary".id;


--
-- Name: VectorSearchCredits; Type: TABLE; Schema: public; Owner: kalygo
--

CREATE TABLE public."VectorSearchCredits" (
    id integer NOT NULL,
    "accountId" integer NOT NULL,
    amount integer NOT NULL
);


ALTER TABLE public."VectorSearchCredits" OWNER TO kalygo;

--
-- Name: VectorSearchCredits_id_seq; Type: SEQUENCE; Schema: public; Owner: kalygo
--

CREATE SEQUENCE public."VectorSearchCredits_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."VectorSearchCredits_id_seq" OWNER TO kalygo;

--
-- Name: VectorSearchCredits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kalygo
--

ALTER SEQUENCE public."VectorSearchCredits_id_seq" OWNED BY public."VectorSearchCredits".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: kalygo
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO kalygo;

--
-- Name: Account id; Type: DEFAULT; Schema: public; Owner: kalygo
--

ALTER TABLE ONLY public."Account" ALTER COLUMN id SET DEFAULT nextval('public."Account_id_seq"'::regclass);


--
-- Name: Feedback id; Type: DEFAULT; Schema: public; Owner: kalygo
--

ALTER TABLE ONLY public."Feedback" ALTER COLUMN id SET DEFAULT nextval('public."Feedback_id_seq"'::regclass);


--
-- Name: Login id; Type: DEFAULT; Schema: public; Owner: kalygo
--

ALTER TABLE ONLY public."Login" ALTER COLUMN id SET DEFAULT nextval('public."Login_id_seq"'::regclass);


--
-- Name: Summary id; Type: DEFAULT; Schema: public; Owner: kalygo
--

ALTER TABLE ONLY public."Summary" ALTER COLUMN id SET DEFAULT nextval('public."Summary_id_seq"'::regclass);


--
-- Name: SummaryCredits id; Type: DEFAULT; Schema: public; Owner: kalygo
--

ALTER TABLE ONLY public."SummaryCredits" ALTER COLUMN id SET DEFAULT nextval('public."SummaryCredits_id_seq"'::regclass);


--
-- Name: VectorSearchCredits id; Type: DEFAULT; Schema: public; Owner: kalygo
--

ALTER TABLE ONLY public."VectorSearchCredits" ALTER COLUMN id SET DEFAULT nextval('public."VectorSearchCredits_id_seq"'::regclass);


--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: kalygo
--

COPY public."Account" (id, email, "firstName", "lastName", alias, phone, "passwordHash", "resetPasswordToken", "emailVerificationToken", "emailVerified", "stripeId", "createdAt", "updatedAt", "subscriptionPlan") FROM stdin;
91	jose@oldcutler.club	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$gOWXT+oGNyo7kGkh6Ahm4Q$yfGItCtErhmpcjuU22AMYeSvfOL0IMVzz2xJTT9+1WY	\N	\N	t		2023-06-13 21:27:39.252	2023-06-22 13:56:36.203	FREE
136	kalygo.io@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$/GMorIgGigm2G3LVw77wWg$aksTZRIqY/VD/LXZtV0I6TU7h+CFKC1QhbhqsGeTdzA	\N	\N	t	cus_O6rNJisJdUFt0g	2023-06-19 08:41:52.594	2023-06-19 08:42:06.01	FREE
104	nick.giuffrida1@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$CYUMPzoOPegGbUl+danv7Q$0C+6L5I6zhInYPGNc7oCIfgG/DdIW9fUFhZe5nNywgY	\N	0b1c6828-a9cc-4678-ae98-3f5d46175f82	f		2023-06-13 21:27:39.252	\N	FREE
105	izabela@off-market.io	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$+SiiYrjOTo8kEro0uOQXCA$DhszsLgBokFcgvO0L/imXA4wTPos7Tl2WhuTrltmqwU	\N	ac8b66c7-cb2d-4f25-8018-bd8005d1a980	f		2023-06-13 21:27:39.252	\N	FREE
106	stevenhmaria@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$D6vY2u9L21IrmQkP366lmA$Q5NnL9gCZ0OHTlDm3oZmPMKkNPfAFkq5dqIJ+uqUnTQ	\N	417e7fba-1574-40be-bf24-727fea135489	f		2023-06-13 21:27:39.252	\N	FREE
108	chris@theshrimpsociety.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$6D5qQcf2LPPU0kgAOwFgIA$5YiEmVv2DxmO/MuAXZx36W7anXSYuhJDNrmrTs3cbQc	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
109	anastasia@step1strategy.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$Ole2PdI+vAn+Va78Y8R/Qw$1Cs6xvjXsIZf9NPPa5W3SFoj7E+K1AVgfUtJu1XGlao	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
118	sebaspindu@gmail.com	Sebastian	Pinzon	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$Xd0ToioMUkIxPqbG3AlYOg$d8LDFVanlO3VXV5cXtE9zacW6P2cq/hu4XQoYq7jLRs	\N	\N	t	cus_O5u4vQRNVtiubK	2023-06-13 21:27:39.252	2023-06-26 00:05:46.831	PREMIUM
154	matt@matthughes.link	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$uSS8MPxvTIOSDCz6qvrtBA$uXmQ/iKyX/fRlzWhVyU2O3Zh1NVUFJVmwlsyiE2p7r8	\N	\N	t	cus_OATAzXCzQzXGMb	2023-06-28 23:56:41.45	2023-06-28 23:57:22.239	FREE
92	info@go-glia.com	Jase	Patrick	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$BQeUmhKPYNkQA2Bn1F2z7g$Y2wqA56AznpkhRXktsBt+8R09PBEodYFB+E4r2OUUgM	\N	\N	t		2023-06-13 21:27:39.252	2023-06-29 20:33:44.861	FREE
110	julikat41@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$YF23Dz+rLnUePydKIYrvlA$Zu54hsoBzbkjp9HvmHAG1Sk+CA5yD8LbbGdk2Xs5xzo	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
93	pradojr56@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$O45QvCHjx+emZeZNj0rxRw$WETWihdC3vOf0Aj37/G/tSdGkDa9iNVBIH29JNAvvsE	\N	be9044f0-a275-44f7-8848-89c4370da595	f		2023-06-13 21:27:39.252	\N	FREE
94	justin.ortiz7@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$qaM5xyzcBofQE9GS6ZKkhQ$hciDxvyJhxnuD5u7H5KCfwzsnDDB89Hyd1POKNcTu9g	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
90	eliasmiami@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$3tAxTUyLuN48o7btVquVBw$4BBDXFLnhuqSFWm99GMUSDDrAyRUmMOBqKL5N9Xs8gQ	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
95	konstantinnelson@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$Dodbrj6+DV2Ncg8NlVf4AQ$m1Pjs8TVw01YSdoLBmqCG7GgUiOH5+3UynPRv+KuTA0	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
111	santos@bluesaturn.io	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$rt8rcELtJny+OBlpZ/+xxA$X0AmF1Y2um0g8zfkyFS4ihKWOcQjGcGbTYL3mGetEK8	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
113	mogrowyoga@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$vJNb44ohU2GIZNUdyQCm3Q$ybpdsNQBobX6SVrLuQ5lhA5AbSSAE0c0gl5wX9dbBMo	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
115	alen.turc@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$Bb8VFMvdAiMPkb25ZW1f/Q$RpHyAoF+YmjTwq3esdh/ESrauC3GWfGFr/wHCGU5Ev0	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
119	micahrzehnder@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$tafHUzBOPFK+7Hhv5mqzuw$XYcZiMG4SVrrRVsQoAkRFDbwPyrkcfKhZHkiH4fR75E	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
121	tbird4real@H2Total.net	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$oDYW8aCdBLGjwCRsF/kQPQ$qWTxgA83k+SKr2w09n9GEfAumPU0p/1XMeKbMvpjyn4	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
122	motivationshortstiktok@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$hmiDxzR9DMxf5wTKsXgyyQ$mtq2h9fEqkI0dGmQJFiuWctPe9zM+3e1JpCn4CA8Iek	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
123	cdejesus077@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$pIHj430OC156OCEeW5nwuA$rLbJuNDAYSzsyzlvb32FjXZ2v6l98nupnnY5sEml8lw	\N	\N	t		2023-06-14 02:15:04.616	2023-06-14 02:16:46.833	FREE
124	binsen@acendi.io	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$199AvP6I6PBPUSDw8dyx6A$7wqQDe9B4Tsxu8VrsRNDeDDd3aG7CCj5GQu0lypI+RM	\N	\N	t		2023-06-14 16:47:09.615	2023-06-14 16:47:35.203	FREE
138	stephencolquitt@icloud.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$a7OCZqxeIW6OTO2QHfUuVQ$C5UKNSOxrbES0kqMFAj8wkDpwEnMMKYT6oA/+kmHlIw	\N	\N	t	cus_O76oKfuB9kmAmC	2023-06-20 00:39:10.751	2023-06-24 22:16:20.903	FREE
156	serazo0511@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$iy7pr+9odZs4ZRPivqHb9Q$eOiTifADqu75qBU1FO6lu+RDO5BhTJK8FUb2bCKdQU0	\N	\N	t	cus_OBFQv1aDKaOT4a	2023-07-01 01:48:36.156	2023-07-01 01:48:48.762	FREE
133	ceemmmdee@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$70cbm5xT/CE9mY6zWVoxrg$o7rW6SixKiYqsSzVXeOHQeRBbkK6326o1KF6IvO/hK8	\N	\N	t		2023-06-18 00:33:49.047	2023-06-18 00:48:24.903	FREE
98	francoise.capdeboscq@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$dkmJXDyNv3FpOjw3f7eXWg$kyu2s1yYhUQr5tq1BzdyvkXpFdeVgY1rfibYuY9Wfyw	\N	9f62db11-fcb2-4369-92d7-56f78253fcb7	f		2023-06-13 21:27:39.252	\N	FREE
99	cindy.leeis@me.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$kMQLHFSmaBkqnFc7BCCzww$el4lKxgJUOiUrsOVSTGIyaTktnnlnsUJP+7Q9tHByAE	\N	b61f4ebe-bdad-4e84-849f-4ec4e92a60b7	f		2023-06-13 21:27:39.252	\N	FREE
101	cdejesus@cyberclues.io	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$OO6N3mG0oqQRbMwJw0hY4A$OvalXEne95ERrvu0QJRypPdbTc4tdgDP3nMpxkgo8QM	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
100	enernovva@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$LA37pUE7qsdvzc4NTOcWQg$baT0z2WE1H75P2IxuZk/dIwK+NXMS904MZ04aPMa8LI	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
4	witherberry@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$LgMDeOBFjuDjf9N2t76CYQ$ooa5ipMhjdZNh2wDklagjQk8e4m0F2cODXyqhcLTK8M	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
102	helloworley@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$fWCkFHS7PisUOpG8INtG+g$3cqS9dwtNXaqG+CbPv3n/Etmm5eKzGAEJUVVr39UXgw	\N	06313a99-7d6a-4888-acf6-fe969d11e80a	f		2023-06-13 21:27:39.252	\N	FREE
1	thadduval.lavud@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$uTYqIeKLcBklKQ4JNUkATg$LBRYx7KwjjJ5T66BLhzKUiGl+TDVFOLA/P6R5TDn3SY	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
18	nduval@aol.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$MsbNIuWJNuErL24KUb1+4g$l63kLhMc9U1TWGeGIJJP1YHDAq9/0LU6ukC6SUt4Ixg	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
19	henry@satosa.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$8hNI+RbfUNg4nmJkeeQQUA$4KZariFzgQcOFDvvqAcxIrOw67TsdhOMM8i98eEnRJ8	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
20	stefankovac416@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$lsGDa+FwUxkuxh0k3t3efQ$NI+A2PuLem3UpdmPF2pu3FWsJ9ICK/CDERf9ngC3kpo	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
21	lucasryan121@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$V0uMQocFAoM20lDRIppHig$YGy4DJUC+DzqTWKkB8oxX+OmYoyGmGf7ZSz5tXBAXY8	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
22	televine@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$FlIbWwxJTwp22I/CVMRYbA$r3rao1QSSaivPMcRSZ6HG2huGOlsaGp5SxLmcOKey9w	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
23	bryan@token-gateway.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$xp8pVlxHCBCpLnFubS/GXg$gY6YzatfAXkc+vS6a8ga/6PPw4euHJbfdXNX6RpLRYQ	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
24	pinkpowercoffee@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$EiRSfaPEImCmmjuPNhBQ4A$hW26W15LEFO36brwcJYRIspxEcqf3F78yKThy+ZhEpE	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
30	pipo9@aol.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$ExJcpxODaOE3m+JEvknTkA$JwrPbTcVoy1nROspcmlsccRtvo6LDQ3h/NfsBOpreLk	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
25	marialopezmjl@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$1hHal2DhebESygiESzEO0w$f3EVn/grXtCLwwqm+75tF6tSPUvNudd5ZM7zY3aBirs	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
31	mikeg314@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$APreJVHVValUCPpYSJXk1Q$9E0bNQsnHEsl12Mz9ZDqtW5/NpWbj7eUjE6bG8+2jQw	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
32	info@themoneyverse.money	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$BIZVny8l3ePx/KkfZCCR4Q$wojgOJf9xebPKBIMxAqGeYS2rlbqk5CJ4/5P6nb933A	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
33	chjango@osmosis.team	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$+rAQeWzngMFYDoh3roiwgw$8oINQxh2PRxVM7sDNawLG04mpJqEe9a/T1650jbB2zk	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
103	ccapodaca66@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$WWNgXKHhUnmcbzB/nmw7YQ$SpPYZ6vs76EGuOa6uVf3tXY1JmVfea4AUta/uFUNgTo	\N	8257fc45-3ca3-40c4-b5e7-33a8b6ba8542	f		2023-06-13 21:27:39.252	\N	FREE
36	gabe@expressive.dev	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$fhAVo5Ys30DDut78l/KSWA$jUg6Py/eCaGYcB0GbkY+lGp0QYwFitWCJ6CbWHW0yt0	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
56	lloyd@tylmen.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$+cRrZGcV7braNYWlWu8nag$S+gy8lwzUHDBC39dNlzrB3TaUIAVxVeH/6QbLOczl0w	\N	57b15e02-f2a8-42c3-b1cb-51c96c183ff6	f		2023-06-13 21:27:39.252	\N	FREE
35	morettik55@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$A8Ct6iXLjPWSBooAYGRcVQ$Y3+QIM+rCFgAJZxC0zgQJVoJdFZsd7r9ZOa6Pq5c+LM	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
40	dfigu057@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$igqZDPB/6nYY5AZCPn9ZqA$BnjspLW1yy0+QZOonOryy6aGLuZ7IHtMpl0y0PZOakQ	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
38	daniel@agorasquare.io	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i32nL4vKQxcRvm65PWJFMg$isX5nqWgYK6vAl5jO5EXB0g2BAcpLMGNrgY1rkWiug8	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
42	thaddadavis@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$RTVjLnGzeCB9xH+6F4PvcA$Q//eeoOtlM+7BzVxPJwDs2i5hw2yIoMAos8ZHiOveMU	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
45	val@karpov.io	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$lRY5fc4b07wMZEEhigK/EA$bHRKpwX33nyA48DurIm+WdAcfVj2pDVZYy3YTZ52o0Q	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
43	sofiarojo09@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$PWqrNlxuUG3XI6rURq0wxQ$UdskB4/nbV9NfOvkutfoy90854emp4uM+7jVnGkkTaY	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
41	humanwarebook@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$mf0VQiGfER5wgcR6rLs53A$AMrqhRrtETijdbM9tqK0gAfBHMqwxtHt+43scwlFDe0	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
53	lay312@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$Z+S6kHrLfNlmYvg9vmWojg$1Gm0CAxuS/tlPyASbrW4MjKVtNcdHpF/KfeBty/hqGc	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
57	tom@biglysales.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$y6A4gRTl4ufL4izx9SQrGg$mzrQOdFdgp0UPqoutmmxyqCrWhOgfaEyRbMA85dFYo0	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
59	stefan.avery.owens@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$T7STbGydhohW1A0pX9lVfA$5s7kdGK7FXghH9UUZNfZ61Ab71VOSCk95NOR1hiARnA	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
62	nvautier@digitaljoyride.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$fYouLc+dTabN/bTelnoGDA$hhOdnq0LLprIV0/N40tz75Lgany+sJKH5vhQuvCnnkM	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
46	jlev0129@fmuniv.edu	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$tL/ttDA3DhC6VC51RwNz7g$pnYbEPked4GR54LxBgFM73o3Fa1F6XaX5mnOLh9SIrI	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
63	flo@thecocot.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$aCJwFRuuOVZoZQBHMR3NoQ$MWhrrwnnWSv12YMqsVg+0uPjsPDwirHyh1Q+k338OjQ	5P1iaX0q76	\N	t		2023-06-13 21:27:39.252	\N	FREE
69	p3cardoso@hotmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$KjjeJuNyWY10S/F08nI1RA$UYYR5WRLQJUaRo/C/hH1ed2LRjMj3r3f4JzStD8GWT4	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
70	DarthLuch@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$DFGAI8/m3kbQu1xM8vkvYg$Jpgex3TiyWVWKWNAyScT/SV/kdWvOYJ0N2yoaC/ARm0	\N	\N	t		2023-06-13 21:27:39.252	\N	FREE
74	Carolinamor333@gmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$yKAxtVaVhbfzqtChr1s+iw$a0MSrP0+k1MCm0Ctlu0K6EkDiih0WNzIG9Yw/CCcmkY	\N	42354db3-82ad-4a62-bce3-4c78fe21ca5b	f		2023-06-13 21:27:39.252	\N	FREE
145	prpuertorico@hotmail.com	\N	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$YMGp96HjMqbXe1p4Hr+abQ$3ja11bga6YskOCrQVTQ3y6Cd/78UqzDDF6xgQRhXfGQ	\N	\N	t	cus_O9A7QcrzuAqtZk	2023-06-25 12:11:57.762	2023-06-25 12:14:33.21	FREE
16	tad@cmdlabs.io	asdf	\N	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$FiwynLZyQIiiCU2jwucPng$d6+TXScgwObiaX26dQL9bW1dl5/EqI2L7lFH9flJbAo	\N	\N	t	cus_O6polPGGdBF4XI	2023-06-13 21:27:39.252	2023-06-25 23:47:31.193	FREE
\.


--
-- Data for Name: Feedback; Type: TABLE DATA; Schema: public; Owner: kalygo
--

COPY public."Feedback" (id, feedback) FROM stdin;
1	Have a tagline that explains how it's different from docusign and how it's not smart contracts.
2	Get the video on the landing page!
3	Testing
\.


--
-- Data for Name: Login; Type: TABLE DATA; Schema: public; Owner: kalygo
--

COPY public."Login" (id, "accountId", "createdAt") FROM stdin;
1	16	2023-06-21 23:58:08.1
2	118	2023-06-22 00:20:43.646
3	16	2023-06-22 03:28:15.959
4	16	2023-06-22 19:20:10.969
5	22	2023-06-22 20:32:40.074
6	22	2023-06-22 20:33:07.585
7	16	2023-06-22 20:41:32.101
8	16	2023-06-23 18:34:02.928
9	118	2023-06-24 13:17:52.881
10	118	2023-06-24 16:57:34.063
11	118	2023-06-24 17:01:00.404
12	118	2023-06-24 17:03:49.228
13	16	2023-06-24 19:02:01.864
14	118	2023-06-24 20:57:27.203
15	118	2023-06-24 21:05:56.633
16	118	2023-06-24 21:06:18.152
17	118	2023-06-24 21:17:03.605
18	118	2023-06-24 23:16:03.364
19	16	2023-06-25 01:54:00.414
20	16	2023-06-25 02:14:25.632
21	118	2023-06-25 13:35:27.992
22	118	2023-06-25 16:36:41.333
23	16	2023-06-25 20:17:22.164
24	16	2023-06-25 23:41:18.876
25	133	2023-06-25 23:51:36.143
26	118	2023-06-25 23:59:38.975
27	118	2023-06-26 00:09:26.822
28	118	2023-06-26 00:19:23.108
29	16	2023-06-26 03:19:41.8
30	16	2023-06-26 03:24:56.856
31	118	2023-06-26 21:54:48.683
32	16	2023-06-26 22:10:38.584
33	16	2023-06-26 22:50:45.114
34	16	2023-06-27 00:20:50.935
35	16	2023-06-27 00:51:13.931
36	16	2023-06-27 01:08:01.622
37	16	2023-06-27 01:33:42.61
38	16	2023-06-27 01:40:44.064
39	16	2023-06-27 15:17:51.581
40	16	2023-06-27 15:18:30.146
41	16	2023-06-27 16:13:57.015
42	16	2023-06-27 19:06:54.302
43	118	2023-06-27 23:44:30.271
44	118	2023-06-27 23:46:08.474
45	16	2023-06-28 16:39:18.007
46	16	2023-06-28 16:41:34.063
47	16	2023-06-28 17:17:02.66
48	16	2023-06-28 23:15:21.551
49	16	2023-06-29 18:24:20.226
50	92	2023-06-29 20:33:57.584
51	92	2023-06-30 15:53:27.594
52	118	2023-07-01 01:50:02.172
53	16	2023-07-01 03:14:16.854
54	16	2023-07-02 23:05:17.199
55	16	2023-07-02 23:05:47.036
56	16	2023-07-02 23:07:32.293
57	16	2023-07-02 23:10:00.763
58	16	2023-07-02 23:10:58.803
59	16	2023-07-02 23:16:26.33
60	16	2023-07-02 23:16:56.636
61	16	2023-07-02 23:26:55.788
\.


--
-- Data for Name: Summary; Type: TABLE DATA; Schema: public; Owner: kalygo
--

COPY public."Summary" (id, "requesterId", content, "condensedCharCount", "originalCharCount", "createdAt", "updatedAt", "processedCharCount", filename) FROM stdin;
1	16	This is a membership agreement between Office Logic, LLC and the member, Noelle Jackson of CMD. The agreement outlines the terms and conditions for accessing and using the office space, including the monthly fees, security deposit, and services provided. The initial term of the agreement will commence on the membership start date and end on the earliest expiration date, with the option to renew or terminate the agreement. The agreement also includes membership terms and conditions, which outline the services provided, maintenance responsibilities, and termination procedures. The agreement is a revocable license to access the office space and receive services, and does not grant any right, title, interest, easement, or lien in or to Office Logic's business or property. Office Logic may terminate the agreement for breach or convenience, and the member must remove all property from the office space and premises upon termination or expiration of the agreement.\n\nThe text outlines the terms and conditions of an agreement between a member and OfﬁceLogic for the use of office space and services. The member is liable for all amounts due or owing as of the effective date of termination or expiration of the agreement, regardless of when they vacate the office space or premises. If the agreement is terminated for breach, the member is liable for all license fees and any other fees owed through the remainder of the term, as well as any broker fees paid by OfﬁceLogic. All fees are subject to change at the discretion of OfﬁceLogic. The member is responsible for conducting background checks on any individuals who will be granted access to the premises and must use good faith efforts to assist OfﬁceLogic with the same. The member is also responsible for the safety and security of their personal property and any liability related to the wrongful access, use, or disclosure of any data or information processed, stored, or transmitted through the services. The member must abide by all rules and policies set forth by OfﬁceLogic and may not assign or sublicense the office space or services to any third party. The member may not alter the office space or premises without prior written consent from OfﬁceLogic and may not store any property or materials in any area of the premises except the office space. The member may not use the office space for retail, medical, or other prohibited uses and may not conduct any illegal activities or offensive behavior in the office space or premises.\n\nThis text outlines the terms and conditions of a membership agreement with OfficeLogic, a provider of office space and services. The agreement covers a range of topics, including acceptable use of the premises, intellectual property and confidentiality, liability, and indemnification. Members are required to maintain insurance coverage and waive claims against OfficeLogic for certain types of damages, while also agreeing to indemnify OfficeLogic for any claims resulting from their own actions or those of their employees or agents. The agreement also includes provisions related to the use of OfficeLogic's name and trademarks, the placement of member information in a directory, and the use of sensors to monitor usage of the premises. OfficeLogic disclaims all warranties and limits its liability for damages, and members must bring any claims within one year of the cause of action's accrual.\n\nThe agreement outlines the terms and conditions for the use of office space and services by a member. The member is required to maintain insurance policies, including personal property insurance, workers' compensation insurance, commercial general liability insurance, and business interruption insurance. The member must also release the office space provider from any liability resulting from claims and cause its insurance company to waive all such claims by way of subrogation or otherwise. The agreement also includes a non-solicitation clause, which prohibits the member from soliciting the employment of any officer, employee, contractor, subcontractor, or service provider of the office space provider. The agreement also outlines the rights and remedies available to the office space provider in the event of a breach by the member. The agreement is governed by the laws of Florida and any dispute arising out of or relating to the agreement will be settled by confidential and binding arbitration. Notices must be delivered in writing and time is of the essence with respect to the performance of each of the member's obligations under the agreement.	4562	47509	2023-06-13 21:27:39.252	\N	0	
16	16	The Supreme Court of the United States has ruled that the Constitution does not confer a right to abortion, overruling the landmark cases of Roe v. Wade and Planned Parenthood of Southeastern Pa. v. Casey. The case in question, Dobbs v. Jackson Women’s Health Organization, involved Mississippi’s Gestational Age Act, which prohibits abortions after 15 weeks except in cases of medical emergency or severe fetal abnormality. The Court found that the right to abortion is not deeply rooted in the nation’s history and tradition, and that the people and their elected representatives should have the authority to regulate abortion. The Court also found that attempts to justify abortion through appeals to a broader right to autonomy and to define one’s “concept of existence” prove too much, and that the critical moral question posed by abortion distinguishes it from other fundamental rights. The Court’s decision was based on a review of the standard used to determine whether the Fourteenth Amendment’s reference to “liberty” protects a particular right, as well as factors that should be considered in deciding when a precedent should be overruled.\n\nThe Supreme Court has overturned Roe v. Wade, the landmark 1973 decision that legalized abortion nationwide. The court ruled in a 6-3 decision that Mississippi's ban on abortions after 15 weeks of pregnancy does not violate the Constitution. The court's decision allows states to regulate or ban abortions before a fetus is viable, which is typically around 24 weeks. The court's decision is a major victory for anti-abortion advocates and a significant setback for abortion rights supporters. The ruling is expected to lead to a wave of new state-level abortion restrictions and legal challenges.\n\nIn the case of Dobbs v. Jackson Women's Health Organization, the Supreme Court has ruled to overrule Roe v. Wade and Planned Parenthood v. Casey, which established a constitutional right to abortion. The court found that the Constitution does not explicitly protect the right to abortion and that the right is not deeply rooted in the nation's history and tradition. The court also found that stare decisis, the doctrine of following precedent, did not require adherence to Roe and Casey. The case involved Mississippi's Gestational Age Act, which prohibits abortions after 15 weeks of pregnancy, except in cases of medical emergency or severe fetal abnormality. The court's decision allows states to regulate or prohibit pre-viability abortions. The ruling has been controversial and has sparked debate about reproductive rights and the role of the Supreme Court in shaping social policy.\n\nThe Supreme Court's decision in the Dobbs v. Jackson Women's Health Organization case is based on the question of whether the Fourteenth Amendment protects the right to an abortion. The Court rejects the argument that the Equal Protection Clause of the Fourteenth Amendment provides a potential home for the abortion right, as it is not a sex-based classification. The Court then turns to Casey's assertion that the abortion right is an aspect of the "liberty" protected by the Due Process Clause of the Fourteenth Amendment. The Court discusses the history and tradition of the term "liberty" and concludes that the Fourteenth Amendment does not protect the right to an abortion. The Court notes that until shortly before Roe v. Wade, there was no support for such a constitutional right, and abortion had long been a crime in every single state. The Court concludes that the right to an abortion is not deeply rooted in the history and tradition of the nation and is not essential to the nation's scheme of ordered liberty.\n\nThe Supreme Court has released an opinion in the case of Dobbs v. Jackson Women's Health Organization, which challenges Mississippi's ban on abortions after 15 weeks of pregnancy. The opinion discusses the history of abortion laws in England and the United States, noting that while common law authorities differed on the severity of punishment for abortions committed at different points in pregnancy, none endorsed the practice. The court also notes that the original ground for drawing a distinction between pre- and post-quickening abortions is not entirely clear, but some have attributed the rule to the difficulty of proving that a pre-quickening fetus was alive. The court ultimately upholds Mississippi's ban on abortions after 15 weeks of pregnancy, stating that the viability standard established in Roe v. Wade and Planned Parenthood v. Casey is "unworkable" and "outdated."\n\nThe Supreme Court's opinion in Dobbs v. Jackson Women's Health Organization argues that a right to abortion is not deeply rooted in the nation's history and traditions. The court cites historical evidence that an unbroken tradition of prohibiting abortion on pain of criminal punishment persisted from the earliest days of the common law until 1973. The court also notes that the vast majority of states criminalized abortion at all stages of pregnancy by 1868, and that no state constitutional provision, statute, judicial decision, or learned treatise supports the existence of an abortion right that predates the latter part of the 20th century. The court dismisses arguments based on alleged legislative motives and suggests that the passage of abortion laws was spurred by a sincere belief that abortion kills a human being.\n\nThe Supreme Court has ruled in favor of Mississippi's ban on abortions after 15 weeks of pregnancy, overturning the landmark Roe v. Wade decision. The court's decision allows states to regulate abortion before viability, which is typically around 24 weeks. The court's majority opinion stated that the Constitution does not confer a right to abortion and that the issue should be left to the states and their elected representatives. The dissenting opinion argued that the decision undermines the right to bodily autonomy and reproductive freedom. The ruling is expected to have significant implications for abortion access in the United States.\n\nThe Supreme Court has issued a ruling in the Dobbs v. Jackson Women's Health Organization case, which challenges the constitutionality of Mississippi's 15-week abortion ban. The Court has overturned Roe v. Wade, the landmark 1973 decision that established a woman's right to an abortion. The Court ruled that the Mississippi law does not violate the Constitution, and that states have the right to regulate abortion. The decision is expected to have far-reaching implications for reproductive rights in the United States. The Court's decision was based on the belief that the Constitution does not provide a right to abortion, and that the issue should be left to the states to decide. The Court's decision has been met with both praise and criticism from various groups.\n\nThe Supreme Court has issued a decision in the case of Dobbs v. Jackson Women's Health Organization, which challenges Mississippi's ban on abortions after 15 weeks of pregnancy. The Court has ruled in favor of Mississippi, effectively overturning the landmark Roe v. Wade decision that established a woman's right to an abortion. The Court's decision was based on five factors that weighed strongly in favor of overruling Roe and Casey, including the nature of their error, the quality of their reasoning, the "workability" of the rules they imposed on the country, their disruptive effect on other areas of the law, and the absence of concrete reliance. The Court's decision has been met with both praise and criticism, with many advocates on both sides of the abortion debate expressing their opinions on the matter.\n\nIn the Dobbs v. Jackson Women's Health Organization case, the Supreme Court reviewed the constitutionality of a Mississippi law that banned abortions after 15 weeks of pregnancy. The Court's opinion criticized the reasoning behind the landmark Roe v. Wade decision, which established a woman's right to an abortion, and argued that the viability line, which allows abortions before a fetus is viable outside the womb, makes no sense. The Court also criticized the way Roe imposed a uniform viability rule that allowed states less freedom to regulate abortion than other western democracies. The Court argued that Roe's reasoning was weak and that even academic commentators who agreed with the decision as a matter of policy were unsparing in their criticism. The Court also noted that when the Court revisited Roe in the Casey decision almost 20 years later, very little of Roe's reasoning was defended or preserved.\n\nThe Supreme Court's decision in Casey did not attempt to strengthen Roe's reasoning, and did not provide a principled defense of the viability line. The Court also imposed a new and problematic "undue burden" test that is difficult to apply and has caused confusion and disagreement among the Courts of Appeals. The test is inherently standardless and its rules are vague and ambiguous, making it impossible to draw a clear line between permissible and unconstitutional restrictions. The Court's experience applying Casey has confirmed that the undue-burden standard was "not built to last" and has generated a long list of Circuit conflicts. The test has proved to be unworkable and seems calculated to perpetuate litigation.\n\nThe Supreme Court has issued a decision in the case of Dobbs v. Jackson Women's Health Organization, which challenges Mississippi's ban on abortions after 15 weeks of pregnancy. The Court has ruled in favor of Mississippi, effectively overturning the landmark Roe v. Wade decision that established a constitutional right to abortion. The Court's decision was based on the argument that the Roe and Casey decisions were wrongly decided and that the legal principles they established were not consistent with the Constitution. The Court also rejected the argument that overruling Roe and Casey would undermine the rule of law or harm reliance interests. The decision returns the issue of abortion to the legislative bodies and allows women on both sides of the issue to seek to affect the legislative process by influencing public opinion, lobbying legislators, voting, and running for office. The Court emphasized that its decision concerns the constitutional right to abortion and no other right, and that nothing in the opinion should be understood to cast doubt on precedents that do not concern abortion.\n\nThe Supreme Court has ruled that the Constitution does not confer a right to abortion, and that the landmark cases of Roe v. Wade and Planned Parenthood v. Casey must be overruled. The Court has applied longstanding principles of stare decisis and decided the case accordingly. The dissent argues that the Court has abandoned stare decisis, but the Court maintains that it has not. The concurrence in the judgment recommends a more measured course, which would hold that if the Constitution protects any right to abortion, the right ends once women have had a reasonable opportunity to obtain an abortion. However, the Court finds serious problems with this approach and concludes that stare decisis cannot justify the new "reasonable opportunity" rule. The Court holds that if the new rule is to become the law of the land, it must stand on its own, but the concurrence makes no attempt to show that this rule represents a correct interpretation of the Constitution. The Court also clarifies that its decision does not call into question precedents that do not concern abortion, such as Griswold, Eisenstadt, Lawrence, and Obergefell.\n\nThe Supreme Court has overruled Roe v. Wade and Casey v. Planned Parenthood, returning the authority to regulate or prohibit abortion to the states and their elected representatives. The court upheld Mississippi's Gestational Age Act, which prohibits abortions after 15 weeks, except in cases of medical emergency or severe fetal abnormality. The court stated that procuring an abortion is not a fundamental constitutional right and that states may regulate abortion for legitimate reasons. The court also stated that rational-basis review is the appropriate standard for constitutional challenges to abortion regulations. The appendix contains statutes criminalizing abortion at all stages of pregnancy in the states existing in 1868.\n\nThe appendix to the Supreme Court's opinion in Dobbs v. Jackson Women's Health Organization lists various state laws from the mid-1800s that criminalized abortion. The laws generally punished those who administered drugs or used instruments to cause a miscarriage, with penalties ranging from fines to imprisonment to hard labor. Some laws distinguished between inducing a miscarriage before and after "quickening," or when the woman could feel fetal movement. The laws also included exceptions for cases where the procedure was necessary to save the woman's life, or where two physicians deemed it necessary. The appendix provides insight into the historical context of abortion regulation in the United States.\n\nThis text is a compilation of various state laws from the mid-1800s to the late 1800s regarding the criminalization of abortion. Each state's law is listed separately and includes the specific language used in the law. The laws generally prohibit the administration of any substance or use of any instrument with the intent to cause a miscarriage, unless it is necessary to preserve the life of the mother. Some laws include exceptions for physicians acting in the discharge of their professional duties or for cases where the fetus is already dead. The penalties for violating these laws range from fines to imprisonment in the state penitentiary for several years.\n\nThe appendix to the Supreme Court's opinion in Dobbs v. Jackson Women's Health Organization contains a list of statutes criminalizing abortion in various states and territories, dating back to the mid-19th century. The statutes range in severity, with some imposing fines and short prison sentences for those who procure abortions, while others classify the act as murder and carry much harsher penalties. Many of the statutes include exceptions for cases where the abortion is necessary to save the life of the mother. The appendix is presented in chronological order of enactment and includes statutes from Hawaii, Washington, Colorado, Idaho, Montana, Arizona, Wyoming, Utah, and various other territories that later became states.\n\nThe text provides a list of state laws from the late 1800s and early 1900s that criminalized abortion, with penalties ranging from imprisonment to fines. Justice Thomas, in his concurring opinion in Dobbs v. Jackson Women's Health Organization, argues that the Due Process Clause of the Fourteenth Amendment does not protect a right to abortion, as it only guarantees process and not substantive rights. He also calls for a reconsideration of all substantive due process precedents, including Griswold v. Connecticut, Lawrence v. Texas, and Obergefell v. Hodges, as they lack a basis in the Constitution and involve judicial policymaking. Thomas argues that substantive due process exalts judges at the expense of the people and is a dangerous legal fiction. He also criticizes the shifting nature of the purported "liberty" supporting the abortion right and argues that the right to abortion is ultimately a policy goal in search of a constitutional justification.\n\nJustice Thomas, in his concurring opinion in the case of Dobbs v. Jackson Women's Health Organization, argues that substantive due process, a legal doctrine used to protect certain rights not explicitly mentioned in the Constitution, has been misused by the Supreme Court in cases related to abortion. He argues that the Court has used substantive due process to create a constitutional right to abortion, which is not supported by the text of the Constitution or American history and tradition. Justice Thomas believes that the issue of abortion should be left to the democratic process, rather than being decided by the Court. He also argues that the Court should eliminate substantive due process from its jurisprudence, as it has been used to make policy judgments that are not supported by the Constitution. Justice Kavanaugh, in his concurring opinion, agrees with Justice Thomas that the Court should return to a position of neutrality on the issue of abortion and leave it to the democratic process. He argues that the Constitution does not grant the Court the authority to create new rights or liberties based on its own moral or policy views. Both Justices agree that the Roe decision, which created a constitutional right to abortion, should be overruled.\n\nIn his concurring opinion in the case of Dobbs v. Jackson Women's Health Organization, Justice Kavanaugh discusses the principle of stare decisis, which is adherence to precedent, and its application to the issue of overruling Roe v. Wade. He argues that while stare decisis is fundamental to the American judicial system, it is not absolute and can be overruled in certain circumstances, such as when a prior decision is egregiously wrong, has caused significant negative consequences, and would not unduly upset legitimate reliance interests. Applying these factors, he agrees with the Court's decision to overrule Roe v. Wade, which he believes was an erroneous decision that exceeded the Court's constitutional authority and caused significant harm. He also addresses related questions, such as the impact on other precedents and other abortion-related legal questions. He concludes that the Constitution is neutral on the issue of abortion and that the Court must be scrupulously neutral as well, returning the issue to the people and their elected representatives in the democratic process.\n\nThe Supreme Court has ruled in favor of Mississippi's Gestational Age Act, which prohibits abortion after the fifteenth week of pregnancy. Chief Justice Roberts agrees that the viability line established by Roe and Casey should be discarded, but he believes that the Court should adhere to principles of judicial restraint and not go further than necessary to dispose of the case. He argues that there is a clear path to deciding the case correctly without overruling Roe all the way down to the studs, by recognizing that the viability line must be discarded and leaving for another day whether to reject any right to an abortion at all. Roberts believes that the Court's dramatic and consequential ruling is unnecessary to decide the case before them and that the broader path the Court chooses entails repudiating a constitutional right that they have previously recognized and expressly reaffirmed applying the doctrine of stare decisis.\n\nThe Supreme Court has issued a ruling in the case of Dobbs v. Jackson Women's Health Organization, which concerns a Mississippi law that bans abortions after 15 weeks of pregnancy. In a 6-3 decision, the Court upheld the law, effectively overturning the landmark Roe v. Wade decision that established a woman's right to choose to have an abortion. Chief Justice John Roberts wrote a concurring opinion in which he argued that the Court should have only struck down the viability rule established in Roe, rather than overturning the entire decision. Justices Stephen Breyer, Sonia Sotomayor, and Elena Kagan wrote a dissenting opinion, arguing that the majority's decision undermines women's autonomy and equality. The ruling is expected to have significant implications for abortion rights in the United States.\n\nThe dissenting opinion in the Dobbs v. Jackson Women's Health Organization case argues that the majority's decision to uphold Mississippi's ban on abortions after 15 weeks is a significant curtailment of women's rights and status as free and equal citizens. The dissenting justices argue that the majority's decision will allow states to impose draconian restrictions on abortion without exceptions for rape or incest, and that enforcement of these restrictions will be left largely to the states' devices. The dissenting justices also argue that the majority's decision threatens other settled freedoms involving bodily integrity, familial relationships, and procreation, and that the majority's cavalier approach to overturning this Court's precedents undermines the doctrine of stare decisis and the rule of law. The dissenting justices conclude that the majority's decision is a significant setback for women's rights and autonomy, and that it will have far-reaching and negative consequences for women's health, well-being, and equality.\n\nIn this dissenting opinion, Justices Breyer, Sotomayor, and Kagan argue that the majority's decision to overturn Roe v. Wade and Planned Parenthood v. Casey is a departure from the Court's precedent and undermines women's constitutional rights. They argue that the right to choose an abortion is grounded in the Fourteenth Amendment's guarantee of "liberty" and that this guarantee encompasses realms of conduct not specifically referenced in the Constitution. The Court's decision in Casey struck a balance between a woman's right to choose and the state's interest in protecting potential life, and the majority's decision erases the woman's interest and recognizes only the state's interest. The dissenting justices also criticize the majority's reliance on historical evidence, arguing that the ratifiers of the Fourteenth Amendment did not perceive women as equals and did not recognize women's rights. They conclude that the majority's decision consigns women to second-class citizenship.\n\nIn the dissenting opinion of Dobbs v. Jackson Women's Health Organization, Justices Breyer, Sotomayor, and Kagan argue that the majority's decision to overturn Roe v. Wade and Planned Parenthood v. Casey is a departure from the Court's longstanding view that women have the right to make personal and consequential decisions about their bodies and lives. They argue that the Constitution protects all individuals, male or female, from the abuse of governmental power or unjustified state interference, and that the Court has rejected the majority's narrow view of how to read the Constitution. The dissenting justices argue that the Constitution is written in general terms to permit future evolution in the scope and meaning of rights, and that the Court has taken up the Framers' invitation to apply them in new ways, responsive to new societal understandings and conditions. They also argue that the Court's precedents protecting bodily integrity and restricting the power of government to interfere with medical decisions or compel medical procedures or treatments are interwoven and part of the fabric of constitutional law and American lives, especially women's lives. The dissenting justices argue that the majority's decision to leave the abortion issue to the states is not a neutral position, but rather takes sides against women who wish to exercise their right to choose and for states that want to bar them from doing so.\n\nThe dissenting opinion in the Dobbs v. Jackson Women's Health Organization case argues that forcing a woman to complete a pregnancy and give birth is a significant intrusion on her body and health. The dissenting justices also argue that the right to choose an abortion is a fundamental aspect of personal identity and liberty, and that it fits into a long line of decisions protecting private choices about family matters, child rearing, intimate relationships, and procreation. The dissenting justices criticize the majority's claim that its decision to overturn Roe v. Wade and Casey v. Planned Parenthood will not affect other constitutional rights, arguing that the majority's reasoning could be used to undermine a range of other rights recognized by the Court. The dissenting justices also express concern that the majority's decision could lead to the reconsideration and overruling of other substantive due process precedents, including Griswold v. Connecticut, Lawrence v. Texas, and Obergefell v. Hodges.\n\nIn their dissenting opinion on the Dobbs v. Jackson Women's Health Organization case, Justices Breyer, Sotomayor, and Kagan argue that the majority's decision to overrule Roe v. Wade and Casey v. Planned Parenthood is a violation of the principle of stare decisis, which is central to the rule of law. They argue that the undue burden standard set out in Casey is workable and has given rise to no unusual difficulties, and that the majority's decision to discard it is based on personal preferences rather than legal principles. They also argue that the majority's commitment to replicating every view about the meaning of liberty held in 1868 has little to recommend it, and that the majority's decision to strip women of agency over their reproductive lives is a violation of the Fourteenth Amendment's protection of liberty. They conclude that the majority's decision substitutes a rule by judges for the rule of law, and that it will have catastrophic consequences for women's rights.\n\nThe dissenting opinion argues that the majority's decision to overturn Roe v. Wade and Planned Parenthood v. Casey is not based on significant legal or factual changes, and instead discards a known, workable, and predictable standard in favor of something novel and probably more complicated. The dissent also notes that subsequent legal developments have only reinforced Roe and Casey, and that no subsequent factual developments have undermined them. The dissent argues that the majority's ruling invites a host of questions about interstate conflicts and does not save judges from unwieldy tests or extricate them from the sphere of controversy. Finally, the dissent argues that the majority's ruling forces the Court to wade further into hotly contested issues, including moral and philosophical ones, that the majority criticizes Roe and Casey for addressing.\n\nThe dissenting Justices in the Dobbs v. Jackson Women's Health Organization case argue that the majority's decision to uphold Mississippi's ban on abortions after 15 weeks is not supported by legal or factual developments. They point out that Mississippi's record on women's health and reproductive rights has not improved since Roe v. Wade and Casey, and that the state's policies on contraception, pregnancy discrimination, and Medicaid coverage are inadequate. The dissenting Justices also note that the global trend has been towards increased provision of legal and safe abortion care, and that the United States will become an international outlier after this decision. They argue that Roe and Casey continue to reflect broad trends in American society, and that the majority's decision to overturn them is not justified by changed circumstances or legal doctrine. The dissenting Justices also reject the majority's comparison of this case to West Coast Hotel Co. v. Parrish and Brown v. Board of Education, arguing that those cases responded to changed law and facts, whereas this case does not. They conclude that the majority's decision to take away a right that individuals have held and relied on for 50 years is not justified by a new and bare majority's declaration that two Courts got the result egregiously wrong.\n\nIn the dissenting opinion of Dobbs v. Jackson Women's Health Organization, Justices Breyer, Sotomayor, and Kagan argue that the majority's decision to overturn Roe v. Wade and Planned Parenthood v. Casey will have profound and disastrous effects on women's lives. They argue that women have relied on the protections of these cases for 50 years and that the disruption of overturning them will be immense. The dissenting justices also argue that the majority's failure to perceive the whole swath of expectations Roe and Casey created reflects an impoverished view of reliance and that the majority's claim that the reliance interests women have in Roe and Casey are too "intangible" for the Court to consider is to ignore the concrete and visceral interests women have in these cases. They conclude that the majority's decision is a radical claim to power that arrogates to itself the authority to overrule established legal principles without even acknowledging the costs of its decisions for the individuals who live under the law.\n\nThe dissenting Justices in the Dobbs v. Jackson Women's Health Organization case argue that the majority's decision to overrule Roe v. Wade and Planned Parenthood v. Casey is a breach of the rule of law and undermines the Court's legitimacy. They argue that the right to obtain an abortion is embedded in our constitutional law and has been reaffirmed by previous decisions, and that nothing has changed to justify overturning those precedents. They also argue that the majority's approach to reliance on precedent is flawed and would preclude a finding of reliance on a wide variety of decisions recognizing constitutional rights. The dissenting Justices criticize Mississippi and other states for ginning up new legal challenges to Roe and Casey, and accuse the majority of acting outside the bounds of the law and relying on dissenting opinions expressing antipathy toward Roe and Casey to justify their decision. They conclude that the majority's decision places in jeopardy other rights, breaches a core rule-of-law principle, and undermines the Court's legitimacy.\n\nIn their dissenting opinion, Justices Breyer, Sotomayor, and Kagan argue that overturning Roe v. Wade and Planned Parenthood of Southeastern Pa. v. Casey would undermine the legitimacy of the Supreme Court and the rule of law. They cite the importance of stare decisis, the principle of respecting precedent, and argue that the prior decisions were not weakened by changes in law or fact. The Justices analyze the 28 cases cited by the majority in support of their decision to overturn Roe and Casey, and argue that none of them are analogous to the current situation. They conclude with sorrow for the millions of American women who have lost a fundamental constitutional protection.	29876	434583	2023-06-14 03:34:01.91	2023-06-14 03:34:01.91	0	
2	16	This is a membership agreement between Office Logic, LLC and the member, Noelle Jackson of CMD. The agreement outlines the terms and conditions for accessing and using the office space, including the monthly fee, security deposit, and last month's fee. The agreement also includes optional services, which are subject to change with reasonable advance notice to the member. The initial term of the agreement will commence on the membership start date and end on the earliest expiration date. If the member does not wish to renew the agreement beyond the earliest expiration date, a non-renewal notice must be received by Office Logic. The agreement is a revocable license to access the office space and receive certain services, and the relationship between Office Logic and the member is that of a licensor and licensee only. The agreement may be terminated for breach or convenience, and the member must remove all of their property from the office space and premises upon termination or expiration of the agreement.\n\nThe text outlines the terms and conditions of an agreement between a member and OfﬁceLogic for the use of office space and services. The member is liable for all amounts due or owing as of the effective date of termination or expiration of the agreement, regardless of when they vacate the premises. If the agreement is terminated for breach, the member is liable for all license fees and broker fees owed through the remainder of the term. The member must pay monthly license fees in advance, and all fees are nonrefundable and noncancellable. OfﬁceLogic may withhold or suspend services if there are outstanding amounts due or if the member is in breach of the agreement. The member must assist OfﬁceLogic with conducting background checks on any individuals who will be granted access to the premises. The member is responsible for the safety and security of their personal property and any data or information processed, stored, or transmitted through the services. The member must abide by all rules and policies set forth by OfﬁceLogic and may not assign or sublicense the office space or services to any third party. The member may not conduct any illegal activities or offensive behavior in the premises or building.\n\nThis text outlines the terms and conditions of a membership agreement with OfficeLogic, a provider of office space and services. The agreement covers a range of topics, including acceptable use of the premises, intellectual property and confidentiality, liability, and indemnification. Members are required to maintain insurance coverage and waive claims against OfficeLogic for certain types of damages, while also agreeing to indemnify OfficeLogic for any claims resulting from their own actions or those of their employees or agents. The agreement also includes provisions related to the use of OfficeLogic's name and trademarks, the placement of member information in a directory, and the use of sensors to monitor usage of the premises. OfficeLogic disclaims all warranties and limits its liability for damages, and members must bring any claims within one year of the cause of action's accrual.\n\nThe agreement outlines the terms and conditions for the use of office space and services by a member. The member is required to maintain insurance policies, including personal property insurance, workers' compensation insurance, commercial general liability insurance, and business interruption insurance. The member must also release the office space provider from any liability resulting from claims and cause its insurance company to waive all such claims by way of subrogation or otherwise. The agreement also includes a non-solicitation clause, which prohibits the member from soliciting the employment of any officer, employee, contractor, subcontractor, or service provider of the office space provider. The agreement also outlines the rights and remedies available to the office space provider in the event of a breach by the member. The agreement is governed by the laws of Florida and any dispute arising out of or relating to the agreement will be settled by confidential and binding arbitration. Notices must be delivered in writing and time is of the essence with respect to the performance of each of the member's obligations under the agreement.	4302	47509	2023-06-13 21:27:39.252	\N	0	
3	16	Kalygo is a software solution that addresses the difficulties of reading, writing, and enforcing contracts. It features A.I. summarization of contracts, collaboration tools for teams, and contract revision tracking using Blockchain for arbitration. Kalygo is seeking feedback to improve its utility and can be signed up for at https://kalygo2.io. Social media accounts for Kalygo include Instagram, YouTube, and Twitter.	420	615	2023-06-13 21:27:39.252	\N	0	
4	16	This is a membership agreement between Office Logic, LLC and the member, Noelle Jackson of CMD. The agreement outlines the terms and conditions for accessing and using the office space, including the monthly fees, security deposit, and services provided. The initial term of the agreement will commence on the membership start date and end on the earliest expiration date, with the option to renew or terminate the agreement. The agreement also includes membership terms and conditions, which outline the services provided, maintenance responsibilities, and termination procedures. The agreement is a revocable license to access the office space and receive services, and does not grant any right, title, interest, easement, or lien in or to Office Logic's business or property. Office Logic may terminate the agreement for breach or convenience, and the member must remove all property from the office space and premises upon termination or expiration of the agreement.\n\nThe text outlines the terms and conditions of an agreement between a member and OfﬁceLogic for the use of office space and services. The member is liable for all amounts due or owing as of the effective date of termination or expiration of the agreement, regardless of when they vacate the office space or premises. If the agreement is terminated for breach, the member is liable for all license fees and any other fees owed through the remainder of the term, as well as any broker fees paid by OfﬁceLogic. All fees are nonrefundable and subject to change. The member must pay a security deposit, which will be refunded within 45 days after termination of the agreement, subject to the satisfaction of the member's obligations. OfﬁceLogic may withhold or suspend services and/or access to the office space and premises while there are any outstanding amounts due or the member is in breach of the agreement. The member must comply with background checks, security measures, and rules and policies set forth by OfﬁceLogic. The member may not assign or sublicense the office space or services, alter the office space or premises, store unapproved items, use the space for retail or illegal activities, or engage in offensive behavior.\n\nThis text outlines the terms and conditions of a membership agreement with OfficeLogic, a provider of office space and services. The agreement covers a range of topics, including acceptable use of the premises, intellectual property and confidentiality, liability, and indemnification. Members are required to maintain insurance coverage and waive claims against OfficeLogic for certain types of damages, while also agreeing to indemnify OfficeLogic for any claims resulting from their own actions or those of their employees or agents. The agreement also includes provisions related to the use of OfficeLogic's name and trademarks, the placement of member information in a directory, and the use of sensors to monitor usage of the premises. OfficeLogic disclaims all warranties and limits its liability for damages, and members must bring any claims within one year of the cause of action's accrual.\n\nThe agreement outlines the terms and conditions for the use of office space and services by a member. The member is required to maintain insurance policies, including personal property insurance, workers' compensation insurance, commercial general liability insurance, and business interruption insurance. The member must also release the office space provider from any liability resulting from claims and cause its insurance company to waive all such claims by way of subrogation or otherwise. The agreement also includes a non-solicitation clause, which prohibits the member from soliciting the employment of any officer, employee, contractor, subcontractor, or service provider of the office space provider. The agreement also outlines the rights and remedies available to the office space provider in the event of a breach by the member. The agreement is governed by the laws of Florida and any dispute arising out of or relating to the agreement will be settled by confidential and binding arbitration. Notices must be delivered in writing and time is of the essence with respect to the performance of each of the member's obligations under the agreement.	4262	47509	2023-06-13 21:27:39.252	\N	0	
5	16	This is a submission of the final draft of an EE (Extended Essay) by Sarah Utrera, with a submission date of October 22, 2021. The document is a Word file with a word count of 4777 and a character count of 24148. The document includes a final grade out of 100 and a Grademark report with general comments from the instructor. The document is divided into 19 pages. No further information is provided.	400	412	2023-06-13 21:27:39.252	\N	0	
6	16	This is a submission of the final draft of an EE (unknown subject) by Sarah Utrera, with a word count of 4777 and character count of 24148. The submission was made on October 22, 2021 at 6:29 PM (UTC-0400) and has a final grade out of 100. The report includes feedback from the instructor on pages 1-19. No further information is provided.	339	412	2023-06-13 21:27:39.252	\N	0	
7	16	The Swank CENC Sample Player has been updated to a dynamic library and renamed to dynvideokit_dev.framework and dynvideokit.framework. There are two versions of the framework, one for development and one for release mode. To support widevine modular and https, two targets are needed, a dev target and a release target. The dev target should embed the frameworks widevine_cdm_sdk_insecure_dev_sim.framework, widevine_cdm_sdk_dev.framework, and dynvideokit_dev.framework. The release target should embed widevine_cdm_sdk_release.framework and dynvideokit.framework. The SwankProtectedMediaLoader class can be used to allow clients to use their own user interface for displaying content. To initiate playback of Widevine Classic Content, the drmProvider property on the SwankPlayerController object must be set before calling play. Widevine classic will only play on a device and not on a simulator.	897	5174	2023-06-13 21:27:39.252	\N	0	
8	16	This is a document that provides evidence of property insurance for 319 15th Street, Huntington Beach, CA 92648. The insurance policy is issued by Seneca Insurance Company and covers building coverage, business income, and general liability. The annual premium for the policy is $2,862. The document also includes information about the insured, the insurance agency, and the policies issued. It is important to note that this document is for informational purposes only and does not confer any rights upon the additional interest named below.	542	2294	2023-06-13 21:27:39.252	\N	0	
9	16	The Swank CENC Sample Player has been updated to a dynamic library and renamed to dynvideokit_dev.framework and dynvideokit.framework. There are two versions of the framework, one for development and one for release mode. To support widevine modular and https, two targets are needed, a dev target and a release target. The dev target should embed the frameworks widevine_cdm_sdk_insecure_dev_sim.framework, widevine_cdm_sdk_dev.framework, and dynvideokit_dev.framework. The release target should embed widevine_cdm_sdk_release.framework and dynvideokit.framework. The SwankProtectedMediaLoader class can be used to allow clients to use their own user interface for displaying content. To initiate playback of Widevine Classic Content, the drmProvider property on the SwankPlayerController object must be set before calling play. Widevine classic will only play on a device and not on a simulator.	897	5174	2023-06-13 21:27:39.252	\N	0	
10	16	he event was significant in the Civil Rights Movement. However, Stockett’s portrayal of African American culture throughout the novel is inaccurate, as it does not accurately represent the unity and support that black families provided for each other during the Jim Crow era. Additionally, the portrayal of abusive men in African American homes is a misrepresentation of black masculinity and manhood during this time period. \n\nAnalysis and Reception of the Work:\n        The Help has received mixed reviews from both critics and readers. Some praise the novel for its portrayal of racial injustice and the bravery of the black maids who spoke out against it. Others criticize the novel for its inaccuracies in portraying African American culture and language. The use of AAVE in the novel has been a point of controversy, as many argue that Stockett’s use of the dialect is inaccurate and offensive. \n        The African American community has also expressed their concerns about the novel. Some argue that the novel perpetuates the idea that white people are the heroes in the fight against racial injustice, while black people are portrayed as helpless victims. Others argue that Stockett’s portrayal of African American culture is inaccurate and offensive. In an article titled “The Help: Black People’s Problems, White People’s Solutions,” author Rebecca Carroll argues that the novel “reinforces the idea that black people need white people to save them.” (Carroll, 2011) \n        Stockett’s misrepresentation of African American culture and language in The Help has caused controversy and criticism from both critics and readers. While some praise the novel for its portrayal of racial injustice, others argue that the novel perpetuates harmful stereotypes and inaccuracies about African American culture. \n\nConclusion:\n        In conclusion, this research paper has evaluated the extent to which Kathryn Stockett was accurate in her use of AAVE dialect and African American culture in her novel The Help. Through a comparison of AAVE to language in the novel and a comparison of African American culture to culture in the novel, it is clear that Stockett’s portrayal of African American culture and language is inaccurate and offensive. Stockett’s misrepresentation of African American culture and language has caused controversy and criticism from both critics and readers, and has perpetuated harmful stereotypes about African Americans. It is important for authors to accurately represent the cultures and languages they write about, and Stockett’s misrepresentation of African American culture and language in The Help serves as a reminder of the importance of cultural sensitivity and accuracy in literature.\n\nThe article discusses the inaccuracies in Kathryn Stockett's novel, The Help, in terms of its portrayal of African American culture and language. The author notes that Stockett's use of African American Vernacular English (AAVE) is inaccurate and may be seen as offensive to speakers of this dialect. Additionally, Stockett's exclusion of violence and danger faced by African Americans during the Civil Rights Movement downplays the true and authentic lives of African Americans during this time period. The article also discusses the criticism of the novel's portrayal of a white savior protagonist, Skeeter, with black characters, Aibileen and Minny, as side characters who are enhancing the story. The author concludes that Stockett's misrepresentation throughout the novel changed the meaning of the work because it caused many people to view her writing as a way to ridicule African Americans.	3619	27383	2023-06-13 21:27:39.252	\N	0	
11	16	This document is an evidence of property insurance issued by ISU Insurance Services on behalf of Palos Verdes Ins., Agency Inc. to 15th LLC, c/o Lido Property Management, for the period of May 31, 2023, to May 31, 2024. The policy covers building coverage, business income, and general liability with a total annual premium of $2,862. The insured property is located at 319 15th Street, Huntington Beach, CA 92648. The document states that it is for informational purposes only and does not amend or alter the coverage provided by the policies listed. It also includes information on cancellation procedures and is copyrighted by ACORD Corporation.	648	2263	2023-06-13 21:27:39.252	\N	0	
12	16	This is a document that provides evidence of property insurance for 319 15th Street, Huntington Beach, CA 92648. The insurance policy is issued by Seneca Insurance Company and covers building coverage, business income, and general liability. The annual premium for the policy is $2,862. The document also includes information about the insured, the insurance agency, and the policies issued. It is important to note that this document is for informational purposes only and does not confer any rights upon the additional interest named below.	542	2294	2023-06-13 21:27:39.252	\N	0	
26	16	The document titled "EE Final Draft" by Sarah Utrera was submitted on October 22, 2021, at 6:29 PM (UTC-0400). The submission ID is 1681464880, and the file name is EE_Final_Draft.docx, with a word count of 4777 and a character count of 24148. The document includes a final grade and a Grademark report with general comments from the instructor. The report spans 19 pages, with each page containing different content related to the final draft.	444	412	2023-06-25 02:14:06.117	2023-06-25 02:14:06.117	0	Draft_Sarah Utrera.txt
27	16	The document is the final draft of an EE (Extended Essay) written by Sarah Utrera, submitted on October 22, 2021, with a word count of 4777 and character count of 24148. The document includes a GRADEMARK REPORT with general comments from the instructor on each of the 19 pages of the EE.	287	412	2023-06-25 02:15:46.332	2023-06-25 02:15:46.332	0	Draft_Sarah Utrera.txt
13	16	The text is a detailed resume of Benjamin Slates, a Senior Full Stack Developer with 10 years of experience in React, Angular, Vue, Node, Typescript, GraphQL, and AWS. He is comfortable with the entire product development life cycle from requirement gathering and problem analysis to design iteration and wireframing, to development and quality assurance, to production support. He has worked as a freelancer on Upwork, as a Full Stack Developer for CousinsMaineLobster, as a Senior React & Blockchain Developer for Plethori, as a Senior Angular & Node developer for Nymbl, as a Senior React Developer for Infinicept, and as a Full Stack Developer for Oohyeah. He has experience in designing and implementing RESTful APIs, utilizing AWS services such as EC2, S3, and RDS for deployment, scaling, and management of web applications, and developing serverless microservices for the cloud in AWS. He has also worked on various blockchain projects on Ethereum, Tron, Optimism, and so on. He has a Bachelor of Science from William Jewell College and has completed an internship as a web developer for Tomisha in Switzerland. References are available upon request.	1158	4888	2023-06-13 22:51:05.666	2023-06-13 22:51:05.666	0	
14	16	her inclusion of this event helps to accurately portray the fear and danger that African Americans faced during this time. However, Stockett also includes inaccurate portrayals of African American culture, such as the use of the term “sassy” to describe the behavior of black women. This term is often used to describe behavior that is seen as disrespectful or rude, and it perpetuates negative stereotypes about African American women. (Greve, 41) Additionally, Stockett’s portrayal of the relationship between white women and their black maids is unrealistic, as it suggests that these relationships were often positive and friendly. In reality, these relationships were often fraught with tension and power imbalances, as white women held all the power in these relationships. (Neal, 2011) Overall, while Stockett’s novel accurately portrays some aspects of African American culture during the 1960s, it also includes many inaccuracies and perpetuates negative stereotypes.\n\nThe article discusses the inaccuracies in Kathryn Stockett's novel, The Help, in terms of its portrayal of African American culture and language. The author notes that Stockett's use of African American Vernacular English (AAVE) is inaccurate and may be seen as offensive to speakers of this dialect. Additionally, Stockett's exclusion of violence and danger faced by African Americans during the Civil Rights Movement downplays the true and authentic lives of African Americans during this time period. The article also discusses the criticism of the novel's portrayal of a white savior protagonist, Skeeter, with black characters, Aibileen and Minny, as side characters who are enhancing the story. The author concludes that Stockett's misrepresentation throughout the novel changed the meaning of the work because it caused many people to view her writing as a way to ridicule African Americans.	1874	27386	2023-06-14 03:16:47.408	2023-06-14 03:16:47.408	0	
15	16	The text is a detailed resume of Benjamin Slates, a Senior Full Stack Developer with 10 years of experience in React, Angular, Vue, Node, Typescript, GraphQL, and AWS. He is comfortable with the entire product development life cycle from requirement gathering and problem analysis to design iteration and wireframing, to development and quality assurance, to production support. He has worked as a freelancer on Upwork, as a Full Stack Developer for CousinsMaineLobster, as a Senior React & Blockchain Developer for Plethori, as a Senior Angular & Node developer for Nymbl, as a Senior React Developer for Infinicept, and as a Full Stack Developer for Oohyeah. He has experience in designing and implementing RESTful APIs, utilizing AWS services such as EC2, S3, and RDS for deployment, scaling, and management of web applications, and developing serverless microservices for the cloud in AWS. He has also worked on various blockchain projects on Ethereum, Tron, Optimism, and so on. He has a Bachelor of Science from William Jewell College and has completed an internship as a web developer for Tomisha in Switzerland. References are available upon request.	1158	4888	2023-06-14 03:20:25.062	2023-06-14 03:20:25.062	0	
17	16	The text is a detailed resume of Benjamin Slates, a Senior Full Stack Developer with 10 years of experience in React, Angular, Vue, Node, Typescript, GraphQL, and AWS. He is comfortable with the entire product development life cycle from requirement gathering and problem analysis to design iteration and wireframing, to development and quality assurance, to production support. He has worked as a freelancer on Upwork, as a Full Stack Developer for CousinsMaineLobster, as a Senior React & Blockchain Developer for Plethori, as a Senior Angular & Node developer for Nymbl, as a Senior React Developer for Infinicept, and as a Full Stack Developer for Oohyeah. He has experience in designing and implementing RESTful APIs, utilizing AWS services such as EC2, S3, and RDS for deployment, scaling, and management of web applications, and developing serverless microservices for the cloud in AWS. He has also worked on various blockchain projects on Ethereum, Tron, Optimism, and so on. He has a Bachelor of Science from William Jewell College and has completed an internship as a web developer for Tomisha in Switzerland. References are available upon request.	1158	4888	2023-06-15 14:37:29.653	2023-06-15 14:37:29.653	0	
18	16	The text is a detailed resume of Benjamin Slates, a Senior Full Stack Developer with 10 years of experience in React, Angular, Vue, Node, Typescript, GraphQL, and AWS. He is comfortable with the entire product development life cycle from requirement gathering and problem analysis to design iteration and wireframing, to development and quality assurance, to production support. He has worked as a freelancer on Upwork, as a Full Stack Developer for CousinsMaineLobster, as a Senior React & Blockchain Developer for Plethori, as a Senior Angular & Node developer for Nymbl, as a Senior React Developer for Infinicept, and as a Full Stack Developer for Oohyeah. He has experience in designing and implementing RESTful APIs, utilizing AWS services such as EC2, S3, and RDS for deployment, scaling, and management of web applications, and developing serverless microservices for the cloud in AWS. He has also worked on various blockchain projects on Ethereum, Tron, Optimism, and so on. He has a Bachelor of Science from William Jewell College and has completed an internship as a web developer for Tomisha in Switzerland. References are available upon request.	1158	4888	2023-06-17 16:07:46.354	2023-06-17 16:07:46.354	0	
28	16	The document is the final draft of an EE (Extended Essay) written by Sarah Utrera, submitted on October 22, 2021, with a word count of 4777 and character count of 24148. The document includes a GRADEMARK REPORT with general comments from the instructor on each of the 19 pages of the EE.	287	412	2023-06-25 02:17:11.922	2023-06-25 02:17:11.922	0	Draft_Sarah Utrera.txt
29	16	The document is the final draft of an EE (Extended Essay) written by Sarah Utrera, submitted on October 22, 2021, with a word count of 4777 and character count of 24148. The document includes a GRADEMARK REPORT with general comments from the instructor on each of the 19 pages of the EE. No further information is provided in the original text.	344	412	2023-06-25 20:31:47.348	2023-06-25 20:31:47.348	0	Draft_Sarah Utrera.txt
19	16	The text is a detailed resume of Benjamin Slates, a Senior Full Stack Developer with 10 years of experience in React, Angular, Vue, Node, Typescript, GraphQL, and AWS. He is comfortable with the entire product development life cycle from requirement gathering and problem analysis to design iteration and wireframing, to development and quality assurance, to production support. He has worked as a freelancer on Upwork, as a Full Stack Developer for CousinsMaineLobster, as a Senior React & Blockchain Developer for Plethori, as a Senior Angular & Node developer for Nymbl, as a Senior React Developer for Infinicept, and as a Full Stack Developer for Oohyeah. He has experience in designing and implementing RESTful APIs, utilizing AWS services such as EC2, S3, and RDS for deployment, scaling, and management of web applications, and developing serverless microservices for the cloud in AWS. He has also worked on various blockchain projects on Ethereum, Tron, Optimism, and so on. He has a Bachelor of Science from William Jewell College and has completed an internship as a web developer for Tomisha in Switzerland. References are available upon request.	1158	4888	2023-06-19 13:51:00.493	2023-06-19 13:51:00.493	0	
20	16	Cristian Duques is a software engineer who has participated in various projects and has experience in the construction and transportation industries. He recently graduated from BrainStation's software engineering bootcamp and possesses a diverse range of skills, including project management, problem-solving, and attention to detail. He is proficient in HTML, CSS, JavaScript, Node, React, Express, MySQL, Agile Development, Document Object Model (DOM) APIs, Web APIs, User Authentication, OAuth, Heroku, and GitHub. He is currently working on a capstone project, a fitness app that will hold clients accountable in monetary terms to their own accomplishments. He also participated in an industry project with BrainStation and UKG, where he planned an interactive control using their AI algorithm and parameters for HR to mitigate toxicity between communication.	863	2765	2023-06-19 13:54:14.027	2023-06-19 13:54:14.027	0	
21	16	By clicking "Yes" or using the Google Tag Manager service, you agree to use the service in accordance with the Google Terms of Service, Privacy Policy, and Google Tag Manager Use Policy. If you use the service to support third-party products or services, you must have an appropriate privacy policy and comply with applicable agreements and regulations. Google is not responsible for third-party tags, but may screen them for compliance. You agree not to engage in unlawful or harmful activity, interfere with the service, upload personally identifiable information, or violate other Google product terms. Your use of the Platform Home is subject to additional terms. Google may collect information about how the service is used to improve and develop it, but will not share this data with other Google products without your consent.	833	3214	2023-06-19 19:09:13.718	2023-06-19 19:09:13.718	0	
22	16	The text is a detailed resume of Benjamin Slates, a Senior Full Stack Developer with 10 years of experience in React, Angular, Vue, Node, Typescript, GraphQL, and AWS. He is comfortable with the entire product development life cycle from requirement gathering and problem analysis to design iteration and wireframing, to development and quality assurance, to production support. He has worked as a freelancer on Upwork, as a Full Stack Developer for CousinsMaineLobster, as a Senior React & Blockchain Developer for Plethori, as a Senior Angular & Node developer for Nymbl, as a Senior React Developer for Infinicept, and as a Full Stack Developer for Oohyeah. He has experience in designing and implementing RESTful APIs, utilizing AWS services such as EC2, S3, and RDS for deployment, scaling, and management of web applications, and developing serverless microservices for the cloud in AWS. He has also worked on various blockchain projects on Ethereum, Tron, Optimism, and so on. He has a Bachelor of Science from William Jewell College and has completed an internship as a web developer for Tomisha in Switzerland. References are available upon request.	1158	4888	2023-06-19 22:40:13.093	2023-06-19 22:40:13.093	0	
23	16	The text is a detailed resume of Benjamin Slates, a Senior Full Stack Developer with 10 years of experience in React, Angular, Vue, Node, Typescript, GraphQL, and AWS. He is comfortable with the entire product development life cycle from requirement gathering and problem analysis to design iteration and wireframing, to development and quality assurance, to production support. He has worked as a freelancer on Upwork, as a Full Stack Developer for CousinsMaineLobster, as a Senior React & Blockchain Developer for Plethori, as a Senior Angular & Node developer for Nymbl, as a Senior React Developer for Infinicept, and as a Full Stack Developer for Oohyeah. He has experience in designing and implementing RESTful APIs, utilizing AWS services such as EC2, S3, and RDS for deployment, scaling, and management of web applications, and developing serverless microservices for the cloud in AWS. He has also worked on various blockchain projects on Ethereum, Tron, Optimism, and so on. He has a Bachelor of Science from William Jewell College and has completed an internship as a web developer for Tomisha in Switzerland. References are available upon request.	1158	4888	2023-06-20 00:00:51.179	2023-06-20 00:00:51.179	0	
24	16	The text is a detailed resume of Benjamin Slates, a Senior Full Stack Developer with 10 years of experience in React, Angular, Vue, Node, Typescript, GraphQL, and AWS. He is comfortable with the entire product development life cycle from requirement gathering and problem analysis to design iteration and wireframing, to development and quality assurance, to production support. He has worked as a freelancer on Upwork, as a Full Stack Developer for CousinsMaineLobster, as a Senior React & Blockchain Developer for Plethori, as a Senior Angular & Node developer for Nymbl, as a Senior React Developer for Infinicept, and as a Full Stack Developer for Oohyeah. He has experience in designing and implementing RESTful APIs, utilizing AWS services such as EC2, S3, and RDS for deployment, scaling, and management of web applications, and developing serverless microservices for the cloud in AWS. He has also worked on various blockchain projects on Ethereum, Tron, Optimism, and so on. He has a Bachelor of Science from William Jewell College and has completed an internship as a web developer for Tomisha in Switzerland. References are available upon request.	1158	4888	2023-06-22 20:42:31.479	2023-06-22 20:42:31.479	0	
25	16	The text is a detailed resume of Benjamin Slates, a Senior Full Stack Developer with 10 years of experience in React, Angular, Vue, Node, Typescript, GraphQL, and AWS. He is comfortable with the entire product development life cycle from requirement gathering and problem analysis to design iteration and wireframing, to development and quality assurance, to production support. He has worked as a freelancer on Upwork, as a Full Stack Developer for CousinsMaineLobster, as a Senior React & Blockchain Developer for Plethori, as a Senior Angular & Node developer for Nymbl, as a Senior React Developer for Infinicept, and as a Full Stack Developer for Oohyeah. He has experience in designing and implementing RESTful APIs, utilizing AWS services such as EC2, S3, and RDS for deployment, scaling, and management of web applications, and developing serverless microservices for the cloud in AWS. He has also worked on various blockchain projects on Ethereum, Tron, Optimism, and so on. He has a Bachelor of Science from William Jewell College and has completed an internship as a web developer for Tomisha in Switzerland. References are available upon request.	1158	4888	2023-06-23 18:34:33.864	2023-06-23 18:34:33.864	0	
30	16	The document titled "EE Final Draft" by Sarah Utrera was submitted on October 22, 2021, at 6:29 PM (UTC-0400). The submission ID is 1681464880, and the file name is EE_Final_Draft.docx, with a word count of 4777 and a character count of 24148. The document includes a final grade and a Grademark report with general comments from the instructor. The report spans 19 pages, with each page containing different content related to the final draft.	444	412	2023-06-25 23:47:46.617	2023-06-25 23:47:46.617	0	Draft_Sarah Utrera.txt
31	118	Un acuerdo entre fundadores es importante para una empresa, ya que establece las relaciones comerciales entre ellos y minimiza la posibilidad de conflictos en el futuro. Este acuerdo debe ser creado antes de la formación de la empresa y debe incluir un guía de conversación y un modelo de acuerdo de fundadores. El modelo de acuerdo debe establecer los derechos, responsabilidades, obligaciones y responsabilidades de cada fundador, así como regular asuntos que no están cubiertos por el acuerdo operativo de la empresa. El objetivo es proteger los intereses de cada fundador y establecer la estructura básica de la empresa. El modelo de acuerdo incluye disposiciones sobre la transferencia de propiedad, la estructura de propiedad, la confidencialidad, la toma de decisiones y la resolución de conflictos, las representaciones y garantías, y la elección de ley. El acuerdo debe ser creado por un abogado y adaptado a las circunstancias específicas de la empresa. Además, los fundadores deben discutir temas como la estrategia, la estructura de propiedad, la gestión, la inversión y la resolución de conflictos. El acuerdo también debe incluir disposiciones sobre la transferencia de propiedad y la protección de la propiedad intelectual.\n\nEl texto habla sobre la estructura de propiedad de una empresa y las restricciones que se pueden establecer en la transferencia de intereses de propiedad. Se mencionan algunas restricciones comunes, como las transferencias permitidas, el derecho de primera oferta y el derecho de primera negativa. También se discute cómo dividir los intereses de propiedad entre los fundadores, considerando factores como la contribución de cada fundador al negocio y la experiencia en la industria. Se sugiere reservar un porcentaje de interés para futuros empleados y se discuten las implicaciones fiscales de hacerlo. El texto también cubre la adquisición de propiedad a través de un esquema de adquisición gradual y la importancia de tener un mecanismo para resolver conflictos entre los fundadores. Se discute la importancia de las representaciones y garantías en un acuerdo de colaboración y se menciona la elección de la ley como una disposición importante en el acuerdo.	2200	33725	2023-06-26 00:01:43.538	2023-06-26 00:01:43.538	0	founders-agreement Kalygo (1).pdf.txt
32	118	El texto original es un contrato de compra-venta de una unidad en el condominio Smart Brickell II en Florida. El comprador y el vendedor están definidos en el contrato, así como el precio de compra y los depósitos requeridos. El vendedor puede utilizar los depósitos del comprador para la construcción del condominio, siempre y cuando se cumplan ciertas condiciones. El comprador reconoce que no tendrá ningún derecho de gravamen sobre la propiedad y renuncia a cualquier derecho de reclamo. El contrato también establece que el comprador debe pagar en efectivo en el momento del cierre y que el vendedor puede haber obtenido financiamiento para la construcción del condominio. El comprador acepta que el vendedor puede utilizar los fondos del comprador para pagar dichos préstamos y renuncia a cualquier derecho de gravamen sobre la propiedad.\n\nEl comprador reconoce y acepta que el vendedor puede hacer cambios en los planes y especificaciones de construcción del condominio y la unidad en cualquier momento para acomodar las necesidades de construcción en el campo y en respuesta a recomendaciones o requisitos de agencias gubernamentales o proveedores de servicios públicos y/o seguros, profesionales de diseño o contratistas, o consultores. El comprador acepta que estos cambios no se considerarán materiales o adversos para él. El comprador también reconoce que los planes y especificaciones presentados a las autoridades gubernamentales pueden no ser idénticos a los planes y especificaciones del vendedor. El comprador acepta que el vendedor puede construir la unidad en una posición diferente o en un plano inverso al modelo y plano de construcción. El comprador también reconoce que los ruidos de las unidades adyacentes o cercanas, o de otros equipos mecánicos, pueden escucharse en su unidad. El comprador acepta que ciertos artículos y materiales no están incluidos en la compra de la unidad, a menos que se especifique lo contrario en un acuerdo por escrito entre el comprador y el vendedor. El comprador reconoce que el vendedor tiene derecho a hacer cambios en los materiales y colores utilizados en la decoración de madera. El comprador reconoce que la fecha estimada de finalización de la construcción es solo una estimación y que el vendedor no está obligado a completar la construcción en esa fecha. El vendedor tiene derecho a cancelar el acuerdo si no se venden al menos el 75% de las unidades en el condominio dentro de los 18 meses posteriores a la fecha en que el primer comprador firma un acuerdo de compra y venta.\n\nEl texto original establece los términos y condiciones de la venta de una propiedad inmobiliaria. El vendedor tiene la discreción de terminar los detalles, la jardinería, las comodidades y la embellecimiento de la propiedad, y el comprador no puede interferir en la construcción. El comprador tiene derecho a inspeccionar la propiedad antes del cierre y debe aceptar la propiedad sujeta a ciertas excepciones permitidas. El vendedor tiene derecho a programar la fecha, hora y lugar del cierre, y el comprador debe cerrar en la fecha programada. Si el comprador no recibe las notificaciones necesarias, no se exime de su obligación de cerrar en la fecha programada. El comprador debe pagar el precio de compra en su totalidad en el momento del cierre. Si el vendedor no puede proporcionar un título de propiedad aceptable, el comprador puede aceptar el título en su condición actual o cancelar la transacción y recibir un reembolso completo de su depósito. Si el comprador está obteniendo financiamiento, puede elegir obtener una póliza de seguro de título de su propia fuente en lugar de recibirla del vendedor.\n\nEl texto establece que el comprador debe pagar ciertos gastos adicionales al precio de compra de la unidad, incluyendo una tarifa de desarrollo, primas de seguro de título, contribuciones de capital, impuestos y cargos gubernamentales, cargos de préstamo, costos de cierre, entre otros. El vendedor no está obligado a tomar ninguna acción correctiva en relación con las objeciones de título y el comprador debe pagar los gastos actuales de la unidad y las cuotas de mantenimiento. En caso de incumplimiento, el vendedor puede rescindir el acuerdo y el comprador debe pagar los daños reales. El litigio debe presentarse en Miami-Dade County y el vendedor puede votar para renunciar a la recolección y mantenimiento de reservas.\n\nEl texto original establece los términos y condiciones de un acuerdo de compra de una unidad en un condominio. El comprador debe pagar una cuota a la asociación de condominios según lo establecido en el presupuesto operativo estimado correspondiente. El vendedor puede mantener oficinas y unidades modelo en la propiedad del condominio mientras ofrezca unidades en venta, pero su uso debe ser razonable y no interferir con el disfrute del comprador. El vendedor pagará comisiones de venta a sus propios agentes y al corredor, si lo hay, pero no tiene la responsabilidad de pagar comisiones a otros corredores o agentes. El comprador no puede asignar o transferir su interés en el acuerdo sin el consentimiento previo por escrito del vendedor. El comprador tiene derecho a cancelar el acuerdo dentro de los 15 días posteriores a la firma o la recepción de una enmienda que modifique la oferta de manera adversa. El vendedor puede hacer cambios en los documentos del condominio, pero si estos cambios modifican la oferta de manera adversa, el comprador tiene derecho a cancelar el acuerdo dentro de los 15 días posteriores a la recepción de la notificación. Si el comprador no cancela dentro de este período, se considera que ratifica el acuerdo y los documentos del condominio. El acuerdo se rige por la ley de Florida y cualquier disputa se resolverá de acuerdo con esa ley.\n\nEl texto original contiene una serie de disposiciones que regulan la compraventa de una propiedad en condominio. Entre ellas, se establece que el comprador debe cumplir con todas las obligaciones en los plazos establecidos, que si hay más de un comprador, todos son igualmente responsables, que no se ofrecen garantías implícitas, que el comprador acepta la posibilidad de que se contrate a un gerente afiliado al vendedor para administrar la propiedad, que el comprador debe devolver los documentos del condominio si se cancela la venta, que el vendedor no se hace responsable de ciertas cuestiones como la presencia de radón o moho, y que el comprador no puede utilizar la propiedad como inversión para revenderla. Además, se establece que el vendedor no garantiza la existencia de acuerdos de licencia o marca con hoteles u otros operadores, que la propiedad puede estar ubicada debajo del nivel de inundación federal, y que el moho es un problema común en los ambientes interiores.\n\nEl resumen se refiere a una divulgación de impuestos de propiedad y otros detalles importantes relacionados con la compra de una unidad de condominio. Se advierte al comprador que no debe confiar en los impuestos actuales del vendedor como la cantidad que el comprador puede estar obligado a pagar en el año siguiente a la compra. Un cambio de propiedad o mejoras en la propiedad pueden desencadenar una reevaluación de la propiedad que podría resultar en impuestos más altos. También se informa al comprador que los presupuestos son solo estimaciones y que los gastos reales pueden variar. Además, se proporciona información sobre la medición de la unidad y se advierte al comprador que no confíe en las declaraciones de los vendedores sobre el potencial de ganancias futuras o cualquier otra ventaja financiera. También se incluyen detalles sobre la renuncia al juicio por jurado y la prohibición de transacciones con personas que cometan o amenacen con cometer o apoyar el terrorismo.\n\nEl texto original se refiere a los requisitos y regulaciones de la Oficina de Control de Activos Extranjeros, Departamento del Tesoro ("OFAC") y de cualquier legislación o Órdenes Ejecutivas en relación con ello. El comprador declara y garantiza al vendedor que ni él ni ninguno de sus socios, miembros, accionistas principales o cualquier otra entidad constituyente o afiliado del comprador, está en la lista de Personas Especialmente Designadas y Bloqueadas mantenida por OFAC de conformidad con la Orden Ejecutiva y/o en cualquier otra lista de terroristas u organizaciones terroristas mantenida de conformidad con las normas y regulaciones de OFAC o de conformidad con cualquier otra Orden Ejecutiva aplicable. Además, se establecen restricciones en el uso de la unidad, incluyendo restricciones en el arrendamiento, reventa, mascotas, estacionamiento y alteraciones y mejoras. También se proporciona información sobre las cuotas de la Asociación de Condom	8682	134111	2023-06-26 00:15:52.606	2023-06-26 00:15:52.606	0	Purchase Agreement - Pre construction.pdf.txt
33	16	The document is the final draft of an EE (Extended Essay) written by Sarah Utrera, submitted on October 22, 2021, with a word count of 4777 and character count of 24148. The document includes a GRADEMARK REPORT with general comments from the instructor on each of the 19 pages of the EE.	287	412	2023-06-26 03:25:16.288	2023-06-26 03:25:16.288	0	Draft_Sarah Utrera.txt
34	16	The text provides a detailed profile of Benjamin Slates, a Senior Full Stack Developer with 10 years of experience in React, Angular, Vue, Node, Typescript, GraphQL, and AWS. He is comfortable with the entire product development life cycle and has experience in requirement gathering, problem analysis, design iteration, wireframing, development, quality assurance, and production support. Benjamin has worked as a freelancer on Upwork, where he refactored front-end and back-end code to optimize the performance of various services and endpoints for React and Node.Js projects. He has also worked as a Full Stack Developer for CousinsMaineLobster, where he built prototypes for company product concepts using React, NodeJs, Typescript, GraphQL, and MongoDB. Additionally, he has worked as a Senior React & Blockchain Developer for Plethori, where he built clean & maintainable front end by using React and GraphQL and implemented Wallet Integration: Web3, ChainCode, Ripple Lib. Benjamin has also worked as a Senior Angular & Node developer for Nymbl, where he built Front-End pages with Angular and Material UI and implemented Back-End with ExpressJs. He has also worked as a Senior React Developer for Infinicept, where he developed significant features and squashed bugs for this React/Asp.Net. Lastly, he has worked as a Full Stack Developer for Oohyeah, where he translated Figma designs into Angular Material UI pages and Rest APIs with Laravel framework and Node. Benjamin has a Bachelor of Science from William Jewell College and has completed an internship as a Web developer - Intern for Tomisha, where he built global components in Nuxt and created a clean project structure. References are available upon request.	1726	4888	2023-06-27 00:21:20.371	2023-06-27 00:21:20.371	0	Angular React Blockchain Benjamin Slates LI 6 5 23.pdf.txt
35	16	This document is an agreement for the purchase and sale of a unit in the Smart Brickell II Condominium in Florida. The agreement outlines the purchase price, payment schedule, and deposit requirements. The buyer acknowledges that the seller may use their deposits for construction purposes, and that any excess deposits may be released from escrow and used for construction purposes. The buyer also acknowledges that they will be solely responsible for making their own financial arrangements and that the seller is not obligated to wait for funding from the buyer's lender. The agreement also includes provisions regarding the seller's financing, subordination, and waiver of buyer lien rights. The document emphasizes that oral representations cannot be relied upon and that buyers should refer to the contract and required documents for accurate representations.\n\nThe buyer acknowledges that the seller's lenders are third-party beneficiaries of the agreement. The unit and the condominium will be constructed according to the seller's plans and specifications, which may be amended from time to time. The buyer agrees that changes made by the seller will not be deemed material or adverse to the offering of the unit. The buyer acknowledges that the plans and specifications on file with applicable governmental authorities may not be identical to the seller's plans and specifications. The buyer agrees that certain items and materials are included in the purchase price, while others are not. The buyer acknowledges that the estimated completion date is not a representation or warranty that construction will be completed by that date. The seller has the right to cancel the agreement if it does not sell at least 75% of the units in the condominium within 18 months.\n\nThis document outlines the terms and conditions of a real estate transaction between a buyer and a seller. The seller has discretion in finishing details, landscaping, amenities, and beautification of the property, and renderings in promotional materials are not representations by the seller. The buyer has the right to inspect the property prior to closing and list any defects, but this will not delay the closing. The seller has the right to postpone the closing for any reason and the buyer must close on the new date. The buyer will receive a special warranty deed and title insurance policy with certain exceptions. The buyer must pay the balance of the purchase price at closing and the seller will have a vendor's lien on the property until all sums are received and cleared. If the buyer is obtaining financing with a Federally-related mortgage loan, they have the option to obtain their own title insurance policy but must still pay the development fee. If there are any defects in title, the buyer must notify the seller before the objection deadline or the defects will be deemed acceptable.\n\nThe buyer must pay additional expenses, fees, and costs when title is delivered at closing, including a development fee, title insurance commitment and policy premiums, working capital contributions, loan fees, closing costs, and other expenses charged by any lender. The seller will pay for the cost of officially recording the deed, documentary stamp tax obligations, and the owner's title insurance policy premium. The buyer and seller will prorate current expenses of the unit and monthly assessments of the association and shared facilities operator(s) as of the closing date. The buyer must prepay the next month's maintenance assessments to the association and shared facilities operator(s) at closing. The buyer and seller will prorate taxes as of the closing date based on the actual tax bill or an estimate by the seller. The prevailing party in any suit or proceeding brought by either buyer or seller with respect to this agreement will be entitled to recovery of its reasonable attorneys' fees and costs incurred in such suit or proceeding or in any appeal thereof. Any such suit or proceeding shall be filed in any appropriate state or federal court of jurisdiction in Miami-Dade County, Florida, and buyer and seller hereby submit to the personal jurisdiction of such courts. The buyer understands that the monthly assessments for the unit payable to the association and shared facilities operator(s) are not guaranteed and may change at any time to cover increases or decreases in actual expenses or in estimates. The seller may vote to waive the collection and maintenance of reserves for any time period permitted under the Act, and a majority of the condominium association's members may vote to continue not to provide any reserves. If such a vote is made to waive reserves, the assessments per unit payable to the condominium association will be as set forth in the applicable estimated operating budget as "Assessments per Unit – Without Reserves."\n\nThe agreement outlines the terms and conditions of the sale of a condominium unit, including the payment of assessments and reserves, the seller's use of the property, sales commissions, notices, transfer or assignment, cancellation rights, and changes to the condominium documents. The buyer must obtain written consent from the seller to assign or transfer their interest in the agreement, and the seller reserves the right to limit the sale of units and refuse to sell more than one unit to a buyer or group of affiliated buyers. The agreement is governed by Florida law, and any disputes will be settled according to Florida law. The buyer has the right to cancel the agreement within 15 days of execution or receipt of any amendment that materially alters or modifies the offering in a manner adverse to the buyer. The seller may make changes to the condominium documents, but the buyer has the right to cancel the agreement if the changes materially alter or modify the offering in a manner adverse to the buyer. The seller is authorized to substitute the final legal description and as-built surveys for the proposed descriptions and plot plans contained in the Declaration of Condominium.\n\nThe agreement outlines various provisions related to the purchase of a condominium unit, including the ability to substitute, combine, or subdivide units prior to the recordation of the Declaration of Condominium, the importance of timely performance by the buyer, and the disclaimer of implied warranties. The agreement also discusses the management of the condominium and the buyer's obligations as a member of the Condominium Association. The buyer is advised of potential issues related to hotel branding, radon gas, flooding, and mold, and is required to certify the accuracy of their taxpayer identification or social security number. The provisions of the agreement will survive after closing.\n\nThe Property Tax Disclosure Summary warns buyers not to rely on the seller's current property taxes as the amount they may be obligated to pay in the year following the purchase. A change of ownership or property improvements triggers reassessments of the property that could result in higher property taxes. The disclosure also states that actual expenditures may vary from budgeted amounts included in the budgets due to factors out of the seller's control. The disclosure provides estimates only and represents an approximation of future expenses based on facts and circumstances existing at the time of the preparation of the budget by the developer. The disclosure also includes information on the measurement of unit square footage, construction defects, the Construction Industries Recovery Fund, shared facilities operators, the use of buyer deposits, and additional disclaimers. The agreement also includes a waiver of jury trial and prohibits transactions with persons who commit or threaten to commit or support terrorism.\n\nThe document outlines various clauses related to the purchase of a unit in the Smart Brickell II Condominium. It includes clauses related to compliance with OFAC regulations, English language translation, noise and construction disturbances, voting rights, restrictions on unit use and leasing, assessments, and furniture packages. The document also includes a receipt for condominium documents and a frequently asked questions section. The seller reserves the right to substitute any items or materials included in the standard items list for items of equal or better quality.	8352	134111	2023-06-27 00:33:20.692	2023-06-27 00:33:20.692	0	Purchase Agreement - Pre construction.pdf.txt
36	16	The text provides a detailed profile of Benjamin Slates, a Senior Full Stack Developer with 10 years of experience in React, Angular, Vue, Node, Typescript, GraphQL, and AWS. He is comfortable with the entire product development life cycle and has experience in requirement gathering, problem analysis, design iteration, wireframing, development, quality assurance, and production support. He is highly experienced with ReactJS, Angular, Vue, and NodeJS including ExpressJS, GraphQL, Redux, Webpack, Docker, Jenkins CI, and Ansible. He has worked as a freelancer on Upwork, as a Full Stack Developer for CousinsMaineLobster, Plethori, Nymbl, and Infinicept, and as an AngularJs & Laravel Full Stack Developer for Oohyeah. He has also completed an internship as a Web Developer for Tomisha. He has experience in utilizing AWS services such as EC2, S3, and RDS for deployment, scaling, and management of web applications. He has developed RESTful APIs to enable seamless communication between the front-end and back-end systems. He has also worked on serverless microservices for the cloud in AWS. He has developed features including shopping logic, creating backend endpoints interaction between Shopify API and backend endpoints and building clean and pixel-perfect pages. He has also implemented user authentication and dashboard pages, and showed printed image results that include stickers that users want to show in their product. He has built clean & maintainable front end by using React and GraphQL and implemented Wallet Integration: Web3, ChainCode, Ripple Lib. He has developed ERC20, ERC721, NFT MarketPlace, Dex, and many other Defi projects on Ethereum, Tron, Optimism, and so on. He has worked closely with a Solidity Developer to create Decentralized Web Applications. He has translated Figma designs into Angular Material UI pages and Rest APIs with Laravel framework and Node. He has faced challenges such as 3rd Party APIs, Social login function with Google, Facebook, Twitter, Music Streaming Function, Notification with socket.io, AWS S3 storage for audio resources, Paypal payment gateway for Marketplace, User roles and permissions management, Git, Task Management, Teamwork. He has a Bachelor of Science from William Jewell College, Liberty, and has completed internships as a Web developer for Tomisha. References are available upon request.	2365	4888	2023-06-27 00:42:43.667	2023-06-27 00:42:43.667	0	Angular React Blockchain Benjamin Slates LI 6 5 23.pdf.txt
37	16	The text provides a detailed profile of Benjamin Slates, a Senior Full Stack Developer with 10 years of experience in React, Angular, Vue, Node, Typescript, GraphQL, and AWS. He is comfortable with the entire product development life cycle and has experience in requirement gathering, problem analysis, design iteration, wireframing, development, quality assurance, and production support. Benjamin has worked as a freelancer on Upwork, where he refactored front-end and back-end code to optimize the performance of various services and endpoints for React and Node.Js projects. He has also worked as a Full Stack Developer for CousinsMaineLobster, where he built prototypes for company product concepts using React, NodeJs, Typescript, GraphQL, and MongoDB. Additionally, he has worked as a Senior React & Blockchain Developer for Plethori, where he built clean & maintainable front end by using React and GraphQL and implemented Wallet Integration: Web3, ChainCode, Ripple Lib. Benjamin has also worked as a Senior Angular & Node developer for Nymbl, where he built Front-End pages with Angular and Material UI and implemented Back-End with ExpressJs. He has also worked as a Senior React Developer for Infinicept, where he developed significant features and squashed bugs for this React/Asp.Net. Lastly, he has worked as a Full Stack Developer for Oohyeah, where he translated Figma designs into Angular Material UI pages and Rest APIs with Laravel framework and Node. Benjamin has a Bachelor of Science from William Jewell College and has completed an internship as a Web developer - Intern for Tomisha, where he built global components in Nuxt and created a clean project structure. References are available upon request.	1726	4888	2023-06-27 01:38:27.039	2023-06-27 01:38:27.039	0	Angular React Blockchain Benjamin Slates LI 6 5 23.pdf.txt
38	16	The text provides a detailed profile of Benjamin Slates, a Senior Full Stack Developer with 10 years of experience in React, Angular, Vue, Node, Typescript, GraphQL, and AWS. He is comfortable with the entire product development life cycle and has experience in requirement gathering, problem analysis, design iteration, wireframing, development, quality assurance, and production support. He is highly experienced with ReactJS, Angular, Vue, and NodeJS including ExpressJS, GraphQL, Redux, Webpack, Docker, Jenkins CI, and Ansible. He has worked as a freelancer on Upwork, as a Full Stack Developer for CousinsMaineLobster, Plethori, Nymbl, and Infinicept, and as an AngularJs & Laravel Full Stack Developer for Oohyeah. He has also completed an internship as a Web Developer for Tomisha. He has experience in utilizing AWS services such as EC2, S3, and RDS for deployment, scaling, and management of web applications. He has developed RESTful APIs to enable seamless communication between the front-end and back-end systems. He has also worked on serverless microservices for the cloud in AWS. He has developed features including shopping logic, creating backend endpoints interaction between Shopify API and backend endpoints and building clean and pixel-perfect pages. He has also implemented user authentication and dashboard pages, and showed printed image results that include stickers that users want to show in their product. He has built clean & maintainable front end by using React and GraphQL and implemented Wallet Integration: Web3, ChainCode, Ripple Lib. He has developed ERC20, ERC721, NFT MarketPlace, Dex, and many other Defi projects on Ethereum, Tron, Optimism, and so on. He has worked closely with a Solidity Developer to create Decentralized Web Applications. He has translated Figma designs into Angular Material UI pages and Rest APIs with Laravel framework and Node. He has faced challenges such as 3rd Party APIs, Social login function with Google, Facebook, Twitter, Music Streaming Function, Notification with socket.io, AWS S3 storage for audio resources, Paypal payment gateway for Marketplace, User roles and permissions management, Git, Task Management, Teamwork. He has a Bachelor of Science from William Jewell College, Liberty, and has completed internships as a Web developer for Tomisha. References are available upon request.	2365	4888	2023-06-27 15:20:31.295	2023-06-27 15:20:31.295	0	Angular React Blockchain Benjamin Slates LI 6 5 23.pdf.txt
39	16	The text provides a detailed profile of Benjamin Slates, a Senior Full Stack Developer with 10 years of experience in React, Angular, Vue, Node, Typescript, GraphQL, and AWS. He is comfortable with the entire product development life cycle and has experience in requirement gathering, problem analysis, design iteration, wireframing, development, quality assurance, and production support. Benjamin has worked as a freelancer on Upwork, where he refactored front-end and back-end code to optimize the performance of various services and endpoints for React and Node.Js projects. He has also worked as a Full Stack Developer for CousinsMaineLobster, where he built prototypes for company product concepts using React, NodeJs, Typescript, GraphQL, and MongoDB. Additionally, he has worked as a Senior React & Blockchain Developer for Plethori, where he built clean & maintainable front end by using React and GraphQL and implemented Wallet Integration: Web3, ChainCode, Ripple Lib. Benjamin has also worked as a Senior Angular & Node developer for Nymbl, where he built Front-End pages with Angular and Material UI and implemented Back-End with ExpressJs. He has also worked as a Senior React Developer for Infinicept, where he developed significant features and squashed bugs for this React/Asp.Net. Lastly, he has worked as a Full Stack Developer for Oohyeah, where he translated Figma designs into Angular Material UI pages and Rest APIs with Laravel framework and Node. Benjamin has a Bachelor of Science from William Jewell College and has completed an internship as a Web developer - Intern for Tomisha, where he built global components in Nuxt and created a clean project structure. References are available upon request.	1726	4888	2023-06-27 16:16:05.983	2023-06-27 16:16:05.983	0	Angular React Blockchain Benjamin Slates LI 6 5 23.pdf.txt
40	16	The text provides a detailed profile of Benjamin Slates, a Senior Full Stack Developer with 10 years of experience in React, Angular, Vue, Node, Typescript, GraphQL, and AWS. He is comfortable with the entire product development life cycle and has experience in requirement gathering, problem analysis, design iteration, wireframing, development, quality assurance, and production support. Benjamin has worked as a freelancer on Upwork, where he refactored front-end and back-end code to optimize the performance of various services and endpoints for React and Node.Js projects. He has also worked as a Full Stack Developer for CousinsMaineLobster, where he built prototypes for company product concepts using React, NodeJs, Typescript, GraphQL, and MongoDB. Additionally, he has worked as a Senior React & Blockchain Developer for Plethori, where he built clean & maintainable front end by using React and GraphQL and implemented Wallet Integration: Web3, ChainCode, Ripple Lib. Benjamin has also worked as a Senior Angular & Node developer for Nymbl, where he built Front-End pages with Angular and Material UI and implemented Back-End with ExpressJs. He has also worked as a Senior React Developer for Infinicept, where he developed significant features and squashed bugs for this React/Asp.Net. Lastly, he has worked as a Full Stack Developer for Oohyeah, where he translated Figma designs into Angular Material UI pages and Rest APIs with Laravel framework and Node. Benjamin has a Bachelor of Science from William Jewell College and has completed an internship as a Web developer - Intern for Tomisha, where he built global components in Nuxt and created a clean project structure. References are available upon request.	1726	4888	2023-06-27 19:09:14.883	2023-06-27 19:09:14.883	0	Angular React Blockchain Benjamin Slates LI 6 5 23.pdf.txt
41	16	This document is an agreement for the purchase of a unit in the Smart Brickell II Condominium in Florida. The agreement outlines the purchase price, payment schedule, and deposit requirements. The buyer acknowledges receipt of the Condominium Documents and agrees to pay all closing costs and fees. The seller may use deposits in excess of 10% of the purchase price for construction purposes, and the buyer waives any lien or claim against the property. The agreement also includes a disclaimer that oral representations cannot be relied upon and references the documents required by Florida law.\n\nThe agreement outlines the terms and conditions of the purchase of a condominium unit, including the buyer's acknowledgement that the plans and specifications for the unit may be changed by the seller in response to construction needs or governmental requirements. The buyer also acknowledges that certain items and materials, such as wall coverings and furniture, are not included in the purchase price unless specifically provided for in a rider or schedule to the agreement. The completion date of the unit is estimated but not guaranteed, and the seller has the right to cancel the agreement if a presale threshold is not met within 18 months. The buyer acknowledges and agrees to these terms and conditions.\n\nThis text outlines the terms and conditions of a real estate transaction between a seller and a buyer. The seller has the discretion to finish details, landscaping, amenities, and beautification of the property without impediment. The buyer has the right to inspect the property prior to closing and list any defects, which the seller must correct at their cost within a reasonable period of time. The buyer must take title subject to certain exceptions, including taxes, assessments, and restrictions recorded in the public records. The seller has the right to schedule the closing date, and the buyer must pay the balance of the purchase price and any additional amounts owed at closing. The buyer may elect to obtain a title insurance commitment and policy for the property from their own sources rather than from the seller. If the buyer fails to close, the seller may keep the deposit as liquidated damages.\n\nThe document outlines additional expenses that the buyer must pay in addition to the purchase price for the unit, including a development fee, title insurance premiums, working capital contributions, loan fees, closing costs, and other charges. The seller is responsible for certain costs at closing, such as recording the deed and paying documentary stamp tax obligations. The document also covers default by either party, litigation, jurisdiction, and venue, and maintenance fees. The buyer acknowledges that the estimated operating budgets provided in the condominium documents are only estimates and subject to change. The provisions of the document will survive closing.\n\nThe agreement outlines the rights and obligations of the buyer and seller in the sale of a condominium unit. The seller has the right to waive the collection and maintenance of reserves, use the property for sales purposes, and pay sales commissions to in-house salespersons and co-brokers. The buyer is responsible for paying commissions to any other brokers or sales agents they have dealt with. The agreement also includes provisions for notices, transfer or assignment of the agreement, limitations on sales, and cancellation rights for the buyer. The agreement is subject to Florida law and any disputes will be settled according to it. The seller may make changes to the condominium documents, but the buyer has the right to cancel the agreement if the changes materially alter or modify the offering in a manner adverse to them. The agreement also includes provisions for recording, waiver of liens, and the condominium unit exemption under the Interstate Land Sales Full Disclosure Act.\n\nThe section of the original text discusses various provisions and disclaimers related to the purchase of a condominium unit. It states that any substitution, combination, subdivision, addition, or determination will not be considered a material or adverse change in the offering and that the performance of all obligations by the buyer on the precise times stated in the agreement is of absolute importance. The section also mentions that if more than one person signs the agreement as a buyer, each will be equally liable for full performance of all duties and obligations. The text disclaims all implied warranties of fitness for a particular purpose, merchantability, and habitability, and all other implied or express warranties of any kind or character. It also discusses the management agreement and the affiliation of the manager with the seller. The section further mentions the return of condominium documents, the survival of provisions after closing, and the completion of construction. It also discusses the risk of loss, the designation of a registered agent, the buyer's certification, and the incorporation of definitions and disclaimers from the condominium documents. The text also mentions the negotiation process, the seller's representations, and additional disclosures and acknowledgments related to hotel branding, radon gas, flood disclosures, mold disclaimer, and property tax disclosure summary. Finally, the section mentions the budgets and the assumption of responsibility for loss, damage, or liability resulting from flooding.\n\nThe expenditures for the Unit may vary from the budgeted amounts included in the Budgets due to factors such as changes in costs, environmental considerations, and natural disasters. The Buyer should consider these potential increases in the budget that may occur before and after closing. The figures contained in the Budgets are estimates only and represent an approximation of future expenses based on facts and circumstances existing at the time of the preparation of the budget by the developer. Any claims for construction defects are subject to the notice and cure provisions of Chapter 558, Florida Statutes. There are two generally accepted methods of measuring the square footage of units in residential condominiums, the Survey Method and the Architectural Method. The estimated square footage of the Unit, as determined under the Architectural Method, will be greater than the estimated square footage as determined under the Survey Method. The Seller reserves the right to amend the Condominium Documents to reflect the actual as-built boundaries, measurements, and dimensions of the Unit. The Unit Owners will be assessed by the applicable Shared Facilities Operator for Shared Facilities Expenses. The provisions of the Agreement will survive closing. The Buyer's rights under this Agreement are subject to the USA PATRIOT ACT and the Executive Order No. 13224. The Buyer represents and warrants to the Seller that neither the Buyer nor any of its partners, members, principal shareholders, or any other constituent entity or affiliate will engage in prohibited transactions with persons who commit or threaten to commit or support terrorism.\n\nThe agreement includes several sections related to the sale and purchase of a unit in the Smart Brickell II Condominium in Miami, Florida. Section 48 states that the buyer and seller, along with their members, partners, shareholders, directors, officers, employees, agents, contractors, subcontractors, and successors and assigns, are not listed on any terrorist or terrorist organization lists maintained by OFAC or pursuant to any other applicable Executive Orders. Section 49 acknowledges that the agreement was negotiated in English and that it is the buyer's responsibility to ensure proper translation if necessary. Section 50 clarifies that masculine/feminine terms used in the agreement apply in the masculine/feminine/neuter where necessary. Section 51 warns the buyer that nearby construction and other activities may disturb them and affect their views. Section 52 explains that the buyer must provide information and execute documents in accordance with the Geographic Targeting Order if applicable. Section 53 acknowledges that the primary inducement for the buyer to purchase is the unit itself, not the proposed improvements. Section 54 clarifies that the agreement is not binding until executed by both parties. Section 55 discloses that the Prospectus for the Condominium may be revised to conform to comments received from the Division. Section 56 states that the agreement is the entire contract for sale and purchase of the unit and can only be amended by a written instrument signed by both parties. The receipt for Condominium documents is also included.\n\nThe document outlines the terms and conditions of the purchase agreement for the Smart Brickell II Condominium in Miami, Florida. The buyer has the right to void the agreement by delivering written notice of their intention to cancel within 15 days of receiving any amendment that materially alters or modifies the offering in an adverse manner. The buyer may also extend the time for closing for up to 15 days after receiving all required documents. The buyer's right to void the agreement terminates at closing. The document also includes a list of documents that the buyer has received or made available for inspection. The buyer has restrictions on the use and leasing of their unit, and they are required to pay assessments to the Condominium Association and Shared Facilities Operator. The document also includes a frequently asked questions section and a list of standard furniture items included in the purchase. The seller reserves the right to substitute any items or materials included in the list of standard items for items of equal or better quality.	9741	137821	2023-06-27 19:23:59.961	2023-06-27 19:23:59.961	0	Purchase Agreement - Pre construction.txt
42	16	The document is the final draft of an EE (Extended Essay) written by Sarah Utrera, submitted on October 22, 2021, with a word count of 4777 and character count of 24148. The document includes a GRADEMARK REPORT with general comments from the instructor on each of the 19 pages of the EE.	287	412	2023-06-27 21:38:27.475	2023-06-27 21:38:27.475	0	Draft_Sarah Utrera.txt
43	16	The provided text is a submission of an EE (Electrical Engineering) final draft by Sarah Utrera. The submission was made on October 22, 2021, at 06:29 PM (UTC-0400). The submission ID is 1681464880, and the file name is "EE_Final_Draft.docx" with a size of 43.97K. The word count of the document is 4777, and the character count is 24148. The text also mentions a final grade, but no specific information about the grade is provided. The remaining pages of the document are listed from page 1 to page 19, but the content of these pages is not included in the given text.	570	412	2023-06-28 16:45:38.615	2023-06-28 16:45:38.615	0	Draft_Sarah Utrera.txt
44	16	Benjamin Slates is a Senior Web Developer with 10 years of experience in various technologies such as React, Angular, Vue, Node, Typescript, GraphQL, and AWS. He is skilled in the entire product development life cycle, from requirement gathering to production support. Benjamin has a strong background in JavaScript and Typescript development, delivering quality code and intuitive user experiences. He is highly experienced with ReactJS, Angular, Vue, and NodeJS, including various tools and frameworks such as ExpressJS, GraphQL, Redux, Webpack, Docker, Jenkins CI, and Ansible. Benjamin is passionate about working with both large and small teams to deliver mission-critical apps.\n\nIn his employment history, Benjamin worked as a Freelancer on Upwork, where he optimized the performance of React and Node.Js projects by refactoring code and implementing RESTful APIs. He also utilized AWS services for deployment and management of web applications. At CousinsMaineLobster, Benjamin worked as a Full Stack Developer, building prototypes and creating a platform for order management and customer fulfillment logistics. He also developed serverless microservices in AWS. As a Senior React & Blockchain Developer at Plethori, Benjamin built clean and maintainable front ends using React and GraphQL. He also worked on various Defi projects on Ethereum, Tron, and Optimism. At Nymbl, Benjamin worked as a Senior Angular & Node developer, building front-end pages with Angular and Material UI and implementing back-end with ExpressJs. He also integrated Fabric.js for printing stickers and images in products. At Infinicept, Benjamin worked as a Senior React Developer, developing features and fixing bugs for their payment operations platform. Lastly, at Oohyeah, Benjamin worked as a Full Stack Developer, translating designs into Angular Material UI pages and Rest APIs with Laravel framework and Node.\n\nBenjamin holds a Bachelor of Science degree from William Jewell College, where he conducted research on equity investments and developed a company marketing website. He also gained experience as a web developer intern at Tomisha, where he worked on global components and back-end and database structures.\n\nReferences are available upon request.	2248	4888	2023-06-28 23:17:40.787	2023-06-28 23:17:40.787	0	Angular React Blockchain Benjamin Slates LI 6 5 23.pdf.txt
45	118	This document is a parking application form that includes rules and regulations for monthly parking at a specific location. The form requires the applicant to provide their personal information, including their email address, license plate number, and contact details. It also includes information about the company, such as the customer account number and keycard number.\n\nThe form states that the parking contract is valid during normal garage hours and does not include special event parking. It clarifies that ABM Parking Services does not assume responsibility for the safety or security of the vehicle or its contents. The permit only grants the license to park, and no bailment is created. In the event of a lawsuit, the applicant agrees to defend and indemnify ABM Parking Services.\n\nThe form also includes instructions for monthly permit holders, such as parking in designated areas and not in reserved spaces. It warns that vehicles parked illegally or in reserved areas may be towed at the owner's expense. Keycard holders are advised not to take a ticket from the dispenser, as it will be charged at the prevailing rate. Each parking attendant and manager is responsible for missing tickets.\n\nThe form emphasizes that monthly parking authorization permits are non-transferable and that the keycard should not be used by anyone other than the designated user. It also states that parking privileges can be canceled by either ABM Parking Services or the customer with a 30-day written notice.\n\nOther rules and regulations mentioned in the form include reporting any damage caused by the customer's vehicle, following instructions from garage personnel and posted signage, not leaving tickets or keycards in vehicles, and not leaving valuables in the vehicle.\n\nThe form also mentions fees and charges, such as a keycard and processing fee, replacement card fee, and late fee. It states that monthly parking fees are due on the first of every month and that failure to pay may result in parking privileges being suspended or canceled.\n\nOverall, this document is a detailed parking application form that outlines the terms and conditions for monthly parking at a specific location.	2188	7643	2023-07-01 01:50:46.204	2023-07-01 01:50:46.204	0	BLANK Omni Parking Application.pdf.txt
\.


--
-- Data for Name: SummaryCredits; Type: TABLE DATA; Schema: public; Owner: kalygo
--

COPY public."SummaryCredits" (id, "accountId", amount) FROM stdin;
1	16	0
3	92	7
2	118	17
\.


--
-- Data for Name: VectorSearchCredits; Type: TABLE DATA; Schema: public; Owner: kalygo
--

COPY public."VectorSearchCredits" (id, "accountId", amount) FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: kalygo
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
7bba676a-e860-47e1-8514-444498d1d546	a2c7a218017faf08de0906839fa2d36df56ebba41a913e1379f85c241eb033d0	2023-06-25 01:41:56.392504+00	20230624232616_add_original_filename_to_summary_table	\N	\N	2023-06-25 01:41:56.387997+00	1
6bd8ef73-754d-404d-a11f-8a74750430f7	8928c8da04c70b3bec3fb818cae8f9e9878e7fb3e1c729013d2d02a6b74c5717	2023-05-14 15:37:33.087252+00	20230514131747_init	\N	\N	2023-05-14 15:37:33.078005+00	1
9fb985f7-ab44-4c18-8abd-3eeacfb0f935	f9d0a62c632cf10b6e0bd73ff33ba48be062f78518de766b9755923a3c768001	2023-05-15 17:32:51.051896+00	20230515151037_create_account_model	\N	\N	2023-05-15 17:32:51.040461+00	1
91fe2b1f-f779-4237-8a12-436b47c7cc52	81d6ca8889fbd6ce399b9ed6cbaac9a43db311e7b98c2418e841cd0f910b0411	2023-05-15 18:42:19.848425+00	20230515180236_make_email_for_account_unique	\N	\N	2023-05-15 18:42:19.841694+00	1
fbd0f09f-9b14-4cf7-8484-17014d9412d5	d5f32526ae42dfe95c31b2868379816274296353360f54e82fddc8f1f7ffd925	2023-06-25 20:05:01.323463+00	20230625170903_create_summary_credits_and_vector_search_credits_tables	\N	\N	2023-06-25 20:05:01.310228+00	1
302ab25d-87d1-4971-80a9-c47a35e8adbc	b18fd5534c47c6375c26b5a6d518352b7ad65b66b4a5ba808d962fbff3780ac7	2023-05-15 21:18:07.154688+00	20230515210009_simple_feedback_form	\N	\N	2023-05-15 21:18:07.14153+00	1
994d1e34-5dc2-4cb6-90fd-9e15fb1379ec	8c8732f524d877a6343775af8b022e86011a4984d73531efbcd3a6dd08662ef0	2023-05-30 18:23:52.773202+00	20230530013623_add_stripe_id_to_account	\N	\N	2023-05-30 18:23:52.768705+00	1
1e0f1a35-f564-4ec8-9e40-c6ae697d73d5	d75594caab923080f8f95fe3d09ee52ded01b71d76e9e2c47b40a7b500c410da	2023-06-12 16:01:51.454978+00	20230612151918_saving_summaries_for_account	\N	\N	2023-06-12 16:01:51.436759+00	1
082ea564-8c2f-402e-95b6-a42aa6f67797	20ae52a2d05ce0154fe77110dab0c5025c6aa45cb0c76695c7655874b2e0ba09	2023-06-25 20:05:01.334078+00	20230625174614_make_account_to_summary_credits_and_vector_search_credits_one_to_one	\N	\N	2023-06-25 20:05:01.326125+00	1
8014066b-6fe4-4835-80c8-cbc3d07aa5ba	2ec081c6b2645ee47979b43fd0b1c969e06da92541b13b9996521e775e5b3fee	2023-06-12 16:01:51.45938+00	20230612153303_adding_fields_to_summary_table	\N	\N	2023-06-12 16:01:51.455914+00	1
60adff6b-633d-4764-b11d-2b9990fe48a9	934416d09cfaea67312eb1f086b24f1911d19aafd7b4aa04d1983b960e8e1f9f	2023-06-13 21:27:39.255831+00	20230613194145_add_timestamps_to_account_and_summary_tables	\N	\N	2023-06-13 21:27:39.250049+00	1
fd072ae3-7fca-4b6b-934c-07969ceab3f9	7b08b40c49c2196a649380ab770e6f85f8dd90469218b3f9e4d66f4aa802f392	2023-06-19 06:12:43.380748+00	20230618230516_track_subscription_plan_of_account	\N	\N	2023-06-19 06:12:43.372429+00	1
029429e1-c835-474f-8e8d-a6355036d394	abac18ea9cd00fc549516ba3bcfad3e853fa139c33e05e17aa5a6e732d15ac98	2023-06-25 20:05:01.339414+00	20230625175352_remove_unneeded_columns_from_account_table	\N	\N	2023-06-25 20:05:01.335333+00	1
43d06242-378a-4d95-8bf6-01f521094c3d	3e663f4dedeb8d8b7816cccc3aa199b707042cea0146d4d1f756e199b5ee20a1	2023-06-19 06:12:43.386408+00	20230619013748_make_stripe_id_required_for_account	\N	\N	2023-06-19 06:12:43.382055+00	1
e8b38f29-7b05-4fce-806e-557eb0fb32a9	4505a360a53efc093b464923908e99dfaa61baafeba4d5291d73afc7a2da6eda	2023-06-19 06:12:43.391248+00	20230619014611_change_default_value_of_stripe_id	\N	\N	2023-06-19 06:12:43.387571+00	1
376362b9-dbeb-4926-9025-21c1f41f2e3f	d8811d0cd2127040972c3ff2a1764f6f6dfe76be9469ed383afaa01d512b930c	2023-06-21 22:37:56.068013+00	20230621222502_track_logins_for_mau_metric	\N	\N	2023-06-21 22:37:56.057095+00	1
d03436ca-79fd-4bee-a007-2f7cabd092f4	03c45f8d7847c04abd0c631accdd5e65ff55d586fa0d3d1047cb8aed21f27e87	2023-06-26 02:50:41.916235+00	20230626014726_add_column_to_summary_table	\N	\N	2023-06-26 02:50:41.911551+00	1
162bb43b-2aa0-4766-91fd-1f52fecf73ff	11d500ee2a9d07d4becfb545c14e191725b7c53af6c1e1d8debf499c7c58ce8a	2023-06-26 02:50:41.921899+00	20230626014935_copy_column_values_to_new_column_for_summary_table	\N	\N	2023-06-26 02:50:41.917372+00	1
86a1a86a-1599-43f4-9692-79e95d0d327b	066bd1c598eb30d454c2ff69a6570c92966dbf34da5b8957c9926cb5a015409a	2023-06-26 02:50:41.926744+00	20230626015226_remove_column_from_summary_table	\N	\N	2023-06-26 02:50:41.922986+00	1
\.


--
-- Name: Account_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kalygo
--

SELECT pg_catalog.setval('public."Account_id_seq"', 156, true);


--
-- Name: Feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kalygo
--

SELECT pg_catalog.setval('public."Feedback_id_seq"', 3, true);


--
-- Name: Login_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kalygo
--

SELECT pg_catalog.setval('public."Login_id_seq"', 61, true);


--
-- Name: SummaryCredits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kalygo
--

SELECT pg_catalog.setval('public."SummaryCredits_id_seq"', 3, true);


--
-- Name: Summary_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kalygo
--

SELECT pg_catalog.setval('public."Summary_id_seq"', 45, true);


--
-- Name: VectorSearchCredits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kalygo
--

SELECT pg_catalog.setval('public."VectorSearchCredits_id_seq"', 1, false);


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: kalygo
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Feedback Feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: kalygo
--

ALTER TABLE ONLY public."Feedback"
    ADD CONSTRAINT "Feedback_pkey" PRIMARY KEY (id);


--
-- Name: Login Login_pkey; Type: CONSTRAINT; Schema: public; Owner: kalygo
--

ALTER TABLE ONLY public."Login"
    ADD CONSTRAINT "Login_pkey" PRIMARY KEY (id);


--
-- Name: SummaryCredits SummaryCredits_pkey; Type: CONSTRAINT; Schema: public; Owner: kalygo
--

ALTER TABLE ONLY public."SummaryCredits"
    ADD CONSTRAINT "SummaryCredits_pkey" PRIMARY KEY (id);


--
-- Name: Summary Summary_pkey; Type: CONSTRAINT; Schema: public; Owner: kalygo
--

ALTER TABLE ONLY public."Summary"
    ADD CONSTRAINT "Summary_pkey" PRIMARY KEY (id);


--
-- Name: VectorSearchCredits VectorSearchCredits_pkey; Type: CONSTRAINT; Schema: public; Owner: kalygo
--

ALTER TABLE ONLY public."VectorSearchCredits"
    ADD CONSTRAINT "VectorSearchCredits_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: kalygo
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Account_email_key; Type: INDEX; Schema: public; Owner: kalygo
--

CREATE UNIQUE INDEX "Account_email_key" ON public."Account" USING btree (email);


--
-- Name: Feedback_feedback_key; Type: INDEX; Schema: public; Owner: kalygo
--

CREATE UNIQUE INDEX "Feedback_feedback_key" ON public."Feedback" USING btree (feedback);


--
-- Name: SummaryCredits_accountId_key; Type: INDEX; Schema: public; Owner: kalygo
--

CREATE UNIQUE INDEX "SummaryCredits_accountId_key" ON public."SummaryCredits" USING btree ("accountId");


--
-- Name: VectorSearchCredits_accountId_key; Type: INDEX; Schema: public; Owner: kalygo
--

CREATE UNIQUE INDEX "VectorSearchCredits_accountId_key" ON public."VectorSearchCredits" USING btree ("accountId");


--
-- Name: Login Login_accountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kalygo
--

ALTER TABLE ONLY public."Login"
    ADD CONSTRAINT "Login_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES public."Account"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SummaryCredits SummaryCredits_accountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kalygo
--

ALTER TABLE ONLY public."SummaryCredits"
    ADD CONSTRAINT "SummaryCredits_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES public."Account"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Summary Summary_requesterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kalygo
--

ALTER TABLE ONLY public."Summary"
    ADD CONSTRAINT "Summary_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES public."Account"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: VectorSearchCredits VectorSearchCredits_accountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kalygo
--

ALTER TABLE ONLY public."VectorSearchCredits"
    ADD CONSTRAINT "VectorSearchCredits_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES public."Account"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DATABASE kalygo; Type: ACL; Schema: -; Owner: postgres
--

GRANT ALL ON DATABASE kalygo TO kalygo;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO kalygo;


--
-- PostgreSQL database dump complete
--

--
-- Database "postgres" dump
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.0
-- Dumped by pg_dump version 15.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE postgres;
--
-- Name: postgres; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C.UTF-8';


ALTER DATABASE postgres OWNER TO postgres;

\connect postgres

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE postgres; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON DATABASE postgres IS 'default administrative connection database';


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO kalygo;


--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database cluster dump complete
--

