--
-- PostgreSQL database dump
--

-- Dumped from database version 10.4 (Debian 10.4-2.pgdg90+1)
-- Dumped by pg_dump version 10.4 (Debian 10.4-2.pgdg90+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE ONLY public.records DROP CONSTRAINT records_creator_id_fkey;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
ALTER TABLE ONLY public.records DROP CONSTRAINT records_pkey;
DROP TABLE public.users;
DROP TABLE public.records;
DROP EXTENSION plpgsql;
DROP SCHEMA public;
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: records; Type: TABLE; Schema: public; Owner: testuser
--

CREATE TABLE public.records (
    id uuid NOT NULL,
    creator_id uuid NOT NULL,
    archived boolean NOT NULL,
    record_hash text NOT NULL,
    filename text NOT NULL,
    created timestamp without time zone NOT NULL
);


ALTER TABLE public.records OWNER TO testuser;

--
-- Name: users; Type: TABLE; Schema: public; Owner: testuser
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    public_key text NOT NULL,
    private_key text NOT NULL
);


ALTER TABLE public.users OWNER TO testuser;

--
-- Data for Name: records; Type: TABLE DATA; Schema: public; Owner: testuser
--

COPY public.records (id, creator_id, archived, record_hash, filename, created) FROM stdin;
a54eb2bb-6988-4ace-8648-2f816f7291bb	d1227778-23dd-4435-a239-a2132bd3d814	f	bed7b35c-d10e-405e-8e87-0d262e02cf66	Document 1	2018-07-01 20:28:11.793174
520feaab-b7af-4c80-9868-fa9f0790fc14	d1227778-23dd-4435-a239-a2132bd3d814	f	0c57fda0-0d5a-49ba-a4ce-9264b068f73d	Document 2	2018-07-01 20:28:11.793301
f274037b-38a9-4111-924b-1c1e8bda618d	72baaa21-0d1b-4408-8576-6c4b23dc59ca	f	Qmc5gCcjYypU7y28oCALwfSvxCBskLuPKWpK4qpterKC7z	Document 3	2018-07-01 20:28:11.793174
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: testuser
--

COPY public.users (id, email, password, public_key, private_key) FROM stdin;
03239acf-9468-4ab7-a2ec-188ac03e8117	a	pbkdf2:sha256:50000$kaUg6QQL$0ad72ef87de3a390cc4f3a8b28ccae7b6f22c930a187cd2c8b62195dd2aba6f5	-----BEGIN PUBLIC KEY-----\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAE18KnTWpnMayq3YbmjWRsCyJg6nLTLwDq\n/VLqeXzcODgrPJ9poPzzuw2eXR/MLQlKnliAnHQ4DqsO3fT8efnxQA==\n-----END PUBLIC KEY-----\n	-----BEGIN EC PRIVATE KEY-----\nProc-Type: 4,ENCRYPTED\nDEK-Info: AES-256-CBC,AA450A3FC620B6D32187CD2FCBE6D0A2\n\nk9ungl8lY+iWmBhZiQ3X608+sETx9Lya3xJrRqlxPm+d0PcJapNkYYt6dOj+Lm8Q\nIzosfCX+k27zWQ4hIJe2fnCD5GeLA99FnvUbxaTzr5yEF09BhWSV/ArIkyK/qaNY\nbtTjt5aWtI3qbYsSPfOxtlyY+eFE0ete6YaI5s587mU=\n-----END EC PRIVATE KEY-----\n
4ad3cd14-351e-4916-a32e-6cacc81ceb15	v	pbkdf2:sha256:50000$4xwf9kB0$11983f5910e91d8459f279ace79c9f79d7a460264e4f1f1ac69601fd569f011a	-----BEGIN PUBLIC KEY-----\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEwpNPUrUTcvl9Kjf9c1qGFpcu37MQklhS\nR5+pVx7eV+XxoQ6h5Alq2ocnWLYa++KUKsMKGHaDrEiHiRTmgmm1Bg==\n-----END PUBLIC KEY-----\n	-----BEGIN EC PRIVATE KEY-----\nProc-Type: 4,ENCRYPTED\nDEK-Info: AES-256-CBC,DD0E00893DC2DA75AFB1FC10E82137DB\n\nxerRFx5ZnNvr2Sht8GijfQ8hMAX+6rfsaiHPpF9sbH4WyUOXjBy07Y3IUMkcMSaC\ncozW1BOWeeHqWC6IRQqaLAemdqURhCvh6C8AeISpXJoF6ekE2GieM7Rz9z66XPMz\nNLOE9hudPnXmSN1VqIp+Rb0eaMKGIsLTUn8V6mX1fbU=\n-----END EC PRIVATE KEY-----\n
399c23fc-396a-495a-b449-db71a808544a	test@medfs.com	pbkdf2:sha256:50000$zKByxlgZ$cd8ee9563f8927612f286117fd4b6abf0e719599cfa191681c067e027d0bc34c	-----BEGIN PUBLIC KEY-----\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAElhWCKE7wS8m+D2iO7VsfEdkhzRM3nGJg\n7yc8EFaHElWIV1fArgtp2lnXYfISTX+g7hApC1N20rdBCjk6ThjRSQ==\n-----END PUBLIC KEY-----\n	-----BEGIN EC PRIVATE KEY-----\nProc-Type: 4,ENCRYPTED\nDEK-Info: AES-256-CBC,845E25B5C0169F16A41C3AE4B75231C1\n\npS9VhWSHpRA7bJt3TnK19OjGSc53J67LDJTORZnOHKYcAuDk0sTF645dLr4MwG1p\nxLNrEvBjPmkv7hAkaw5B5ODcbnyFZKcNSyQlXpXCwiyG58Gt5QJDbl9uQ4gllB4O\nz19w0D7FMntR5LdGuXurw2DH2N8MvZzeG+9ybcAVcjk=\n-----END EC PRIVATE KEY-----\n
\.


--
-- Name: records records_pkey; Type: CONSTRAINT; Schema: public; Owner: testuser
--

ALTER TABLE ONLY public.records
    ADD CONSTRAINT records_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: testuser
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: records records_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: testuser
--

ALTER TABLE ONLY public.records
    ADD CONSTRAINT records_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

