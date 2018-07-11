--
-- PostgreSQL database dump
--

-- Dumped from database version 10.4 (Debian 10.4-2.pgdg90+1)
-- Dumped by pg_dump version 10.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

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
    acl_id uuid NOT NULL,
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
    password text NOT NULL
);


ALTER TABLE public.users OWNER TO testuser;

--
-- Data for Name: records; Type: TABLE DATA; Schema: public; Owner: testuser
--

COPY public.records (id, creator_id, acl_id, archived, record_hash, filename, created) FROM stdin;
a54eb2bb-6988-4ace-8648-2f816f7291bb	d1227778-23dd-4435-a239-a2132bd3d814	e0a9e0c5-f5aa-4a38-bdad-fd2288efcabf	f	bed7b35c-d10e-405e-8e87-0d262e02cf66	Document 1	2018-07-01 20:28:11.793174
520feaab-b7af-4c80-9868-fa9f0790fc14	d1227778-23dd-4435-a239-a2132bd3d814	1b34bcd4-da1a-475d-90f8-c8078003cddf	f	0c57fda0-0d5a-49ba-a4ce-9264b068f73d	Document 2	2018-07-01 20:28:11.793301
f274037b-38a9-4111-924b-1c1e8bda618d	72baaa21-0d1b-4408-8576-6c4b23dc59ca	e0a9e0c5-f5aa-4a38-bdad-fd2288efcabf	f	Qmc5gCcjYypU7y28oCALwfSvxCBskLuPKWpK4qpterKC7z	Document 3	2018-07-01 20:28:11.793174
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: testuser
-- Password for v: v

COPY public.users (id, email, password) FROM stdin;
d1227778-23dd-4435-a239-a2132bd3d814	test@medfs.com	pbkdf2:sha256:50000$pKERsF80$236c3f68775bfb8b2ffd474289b293a7220fcc0ef3d38369182ee084a127571d
72baaa21-0d1b-4408-8576-6c4b23dc59ca	v	pbkdf2:sha256:50000$YpvW0tae$2c2e7bc8561dd6477f599841d0809d3c6ec7474154adba10b86d5ace33e9df43
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
-- PostgreSQL database dump complete
--

