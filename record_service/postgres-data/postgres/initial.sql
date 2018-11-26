--
-- PostgreSQL database dump
--

-- Dumped from database version 11.1 (Debian 11.1-1.pgdg90+1)
-- Dumped by pg_dump version 11.1 (Debian 11.1-1.pgdg90+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.records DROP CONSTRAINT IF EXISTS records_creator_id_fkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.records DROP CONSTRAINT IF EXISTS records_pkey;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.records;
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
a54eb2bb-6988-4ace-8648-2f816f7291bb	1c47508c-8933-4eda-ba7d-f6b28d5e1138	f	bed7b35c-d10e-405e-8e87-0d262e02cf66	Document 1	2018-07-01 20:28:11.793174
520feaab-b7af-4c80-9868-fa9f0790fc14	1c47508c-8933-4eda-ba7d-f6b28d5e1138	f	0c57fda0-0d5a-49ba-a4ce-9264b068f73d	Document 2	2018-07-01 20:28:11.793301
f274037b-38a9-4111-924b-1c1e8bda618d	1c47508c-8933-4eda-ba7d-f6b28d5e1138	f	Qmc5gCcjYypU7y28oCALwfSvxCBskLuPKWpK4qpterKC7z	Document 3	2018-07-01 20:28:11.793174
867e8a16-9bdd-4d80-b8f7-2351d57d06b0	9e69a899-e321-4fc6-ab71-0776316a8733	f	bed7b35c-d10e-405e-8e87-0d262e02cf66	Document 1	2018-07-01 20:28:11.793174
775672e2-d666-4291-b166-5fbc3cb90c32	9e69a899-e321-4fc6-ab71-0776316a8733	f	0c57fda0-0d5a-49ba-a4ce-9264b068f73d	Document 2	2018-07-01 20:28:11.793301
221e4df5-40f4-41cf-b3d9-29b76bcda7b9	9e69a899-e321-4fc6-ab71-0776316a8733	f	Qmc5gCcjYypU7y28oCALwfSvxCBskLuPKWpK4qpterKC7z	Document 3	2018-07-01 20:28:11.793174
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: testuser
--

COPY public.users (id, email, password, public_key, private_key) FROM stdin;
1c47508c-8933-4eda-ba7d-f6b28d5e1138	a	pbkdf2:sha256:50000$4PesDHP7$84cd2a908e0e63896091c88dfdcda3884ea3b9764f1db04b6dd7587d8bf62f2a	-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqX4WJvKuKwxUTDqt6flt\nNIDUZ6zp3h6NW325zq6mWjFUFsuiaKpfS7+875t1ctrIUxRGDUeBMsJntfRH3nGS\nPuIlDo9RRw03diFuttRzK5eaRv8Iw4sKijC6ty2XZjQ7H/SarCtralewsSxj0ucZ\nxNHKMzVen7d4rxxgTWQUg4f770zxJSfAcZATDpPGyiLlbJiN3yjjLJjUwoxp3NiE\nE+7BW3qwaCQpvx38z78Dvb16S5J4sD7uYDNYB+rjAyiWd9p8cfTvdL9mrk3AJBF5\n/s2nKZaNQYdGy7tRqjRVe+6C3u1LWflthVwDMlcI9dYTbSrh47I0u1WsvkC9YFpq\nyQIDAQAB\n-----END PUBLIC KEY-----\n	-----BEGIN RSA PRIVATE KEY-----\nProc-Type: 4,ENCRYPTED\nDEK-Info: AES-256-CBC,D7A622D1CE2A24D5F30C5B0FDC197F0C\n\nNzNgd/0qyoSpBcGejjiGPE2hAIA01AQ+6anup0XC2Y/NXsFnu8yhDu0uVkx3Pj9K\nWNCWk3GVrzTv14gx8jpBzWW11gYylp3K4cE7GXg/B6sFk71z+5rP3Ily+gdhkMhI\ndVgFq7RFjnBdAQhzkkc9Lml2iff0f2cfh+cWRS25FSQOes33uFn8QZwYI1lREvnt\nQvP7rqsZdAeWm/a9lcR8tDsN3SzaoHwbmfdI5OOn35+E7s3fSOIEW220PLvChPQZ\nxH4q5dAsImNzGNHBNdqKqxjZ+/QfJ9LrSg3P4gdEEL0EDxSfJOXLWBQKXPrZLJav\nf+wEVkc3U+LysSFOsg24UvcobuCreMFJtxTPehvtn/OOcFMeSh7yqrHgF+tqnXTk\nwVKerpWvm4B4yGvQrVDEbnXRa+WxuxJPtdXezrPtozYOHEBavdsiUs8ftHMw3JnE\nsggboesjkk0aSlzRi2O34NEE7v5UTKSugPeN9jELXX5UFCWYw43biQgl5UuonIo/\nR0ffIZkyL65k+vIq8E4P4wbvWJZDMpAqqHy7O5cH30EyCafqUciqZq9jE6Q4CgQ/\n0mDUINsIH82qkV88AbpT6PeaYW3NJKcYbXfCpDvYwyted4rXYDp7hIZxgeslGe/b\nNv91hAhnfnDC2hfe0k+V8l1osstyluSJ44X7bneIPeS6MRLOXM8dtnJeD9wM2cq3\nOluvp2oLPOzaMKdNOojPhCejFU0B+uU95iTZ6nhweUUh0KsBgKd+uzoPOotUNU2d\nAKu+0+S0z/zZKbRC4jMD/B8HU5y5Ebu4J/8sMgkoR4b7a0V2KKUh63hPc40gPGD8\nVx7M+rknjYn7jgUDlXY3qXRc9oYw9+1ZWi17oGSyFXJNgtcNNjtcTiPEKXa/eu4w\nPDda1UVBB7g4v2FpABA8amAiEHTaps9BM9K+eyoQR1R8VAng80JRvmqAxCMrqZIk\nWd3D370j7E6Q/dEmac70S6dtqmfAHl1nJSTeaZ1p4XBp+/Kir2kAGZdL6YzBYNVc\nq1q0AV8zreUfCUisn77spys4qcQGoDxAtzmFby3Zn3gFEit1JNgCVQH41evUUNRI\nB2959TyV1lR7EqzIeK0JfP27CxZdgg8861qj/tAN1Wa6Dzh0Dyn3F7CyOId7bXIl\nxVsh6MTBf2qklnKcriud3zpROonkK2paPALzmlImfqJIEndKL5s5NWqg3ht8TUDY\nsD5vyJc2jodxrWLnzrHlWtOZK/iDwLld6PLHSF5THf3o/I3T98jjN2hTHB1vsnSr\ntQe8ifmSaM5/Ijjz/6q0AzgDPw/t6g0wSTME5kGuIxWtJK5QKYFLDeFDZQIcTHsZ\nRR0m/dxDw5DRGyArC146C75Bc+1PIfZBddH1YNAuIEHvUU/DQdLpIDN31vbe5Xva\nGwm7GnQIObogAGvusLtmT3hm4RWOOm1lx5sYOyqmeeS03eAXOFvnWYHXO8BbqGNU\noT1o7e3C/akWMZ4WjON071PcOxuyoJIgfB7PvxetqMIn+5Jsoij1/xtzn4UqFZQp\nKqfRtxJGg2t5y9yrJ0LtQNj/0sDywn+SoCdEsQopaYcPPffW/Pnsn0aloLz4NPVl\n-----END RSA PRIVATE KEY-----\n
9e69a899-e321-4fc6-ab71-0776316a8733	test@medfs.com	pbkdf2:sha256:50000$MtdisMUD$39194a840d5f6d0eb86d6dd02cbb1555babaef4d29142a2216625092ba90f1a1	-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxrGKoMOp/O/2TUbBJSFA\nA6NDoJBYVvfYSX5cEGx4jHNAAkAYTSBSF80fCvdS6kXyTBXg6cY2lSTKH9XaRCtF\nDYFLa8PJVg6SH9gvkP0qGf/CKOIGy5Cam2SRdM0WQNkhXbJfV6ekXcjToRTQ1+mN\nn7qs7zGx+a+HGbYtl5L+yWTsdrFEWKQq21NyxSfzVlaR4u1Psx2w0AjqvptmW7xS\n3MctPf2U+WMu+PSA5DqiSiF02Cqdzvw2A2u0358or4wAD+UphNbPHl/LYeLEWd5U\nqKFxlzHH63HA4DGfMMEeMmtJ3hLSDtXl+UK7gnwopQxxeUU2mcrxCKLZ3OvaWOUX\nfQIDAQAB\n-----END PUBLIC KEY-----\n	-----BEGIN RSA PRIVATE KEY-----\nProc-Type: 4,ENCRYPTED\nDEK-Info: AES-256-CBC,661B7DA003181163FD894EB6D17C50BE\n\nyFUG5TXXjMtIrcM6LjQD//+dbAs23Tw1e+Ad8tIupzrHJYVXzTdJa1zSbeGO5b1O\nzsiFx5QsCpS4Ko53+jkUNy3zRlk02QmFURAjKetdyJwe84FaejE2IwQmMlAeHo17\n4uCbcnZLTtWEADPE0lgyx6Y1ZzktiyHdkvYwuaS3Cn1RnQ45A1AABLAjDgTf7PhF\nlBHgi5wAKuTbNr2gsRDsRSkp9pkiWQspsJwyLaM0MSam6yu7WNeROQUe2hE427z6\nfuk+hjDCgxeE9wSAU91uNKH/hpCwkXyuwXPeoaVPRYAdASjw6W8BvxS0g94Y+iN0\n0/hXiMVxCZzk1Ah0rymo5t0p11Am4ISWOkKc3giFXBsGYnszKmP7lrD/v4XEJiRN\nQ8fQHlf+7WU4OHlEx+et9qO1iEO89EtLAU2Lf+Fu049j1SO5Cc40HJSjvwlY5LEg\nLZZosY70P5FhdxDSAb0O59E5j6ReDuQlTh11lk/8ZDMIY0v1hIdYbWPQChFL2fmI\nTQX+pONL11Z80OsSCRO2XpASJp/gwdNqvlgpQs51pFt6gV5wQ8oPo24WlP799fTU\nwqbjNcljK9gWp+PxPw6YBth+CIWWBzghPmdw5x9U5ahXwqdhXSXzSqryr8PLJM/X\nZDsE/o4a42UCllT4wWjD8bbj246TZTf6dFPo7CpzCUVzNZx6Oj1NRb9aYxQRo4SM\nRakkm/xYcUTLLFLKFqeZ5tt7tvLEW2q8VaZbsgxRfqM4HE6fwcsW//IhLmnvn/QZ\njKMLLGjYuUBgLShwHAVwf5DCCqs3WHIBIznEuqt9jQlrAlTrNxgE040Jua+a4KFq\nZMR9yhUwyjOUjoFs6ijaOJZGuueeFA41rSee1xMQ2wQKzNYJz4iSeeFboTGMsip/\nSyZhB6KhaQvYGr4xFXpVrGFYtu+XdJPfUgbxGkR4RhUofnypvHUIi/TrB5+yYfnm\nB8HBfAlggwFrq9eJNnBu3Cf399rxhpypxqzzj2qcLHxRm5jBo9HuDx/w/bQNQM5u\nKArfTiQF023FVF99fwY7fx20BE3+hBcO2zxVHMrknNv8VL3Ykm3TBfZ4lu9rSaMA\n0k7z+RIqYkH34DTUjq1PN28cgyV58LP5hQ6BOXa0fcLVy8qcN0XKAwsXIG0XAxdb\njkn1GIpjHQ/jTinM3kTlo7ULMuZHUbkxtSChcXskXumXGnBebEv5ZUlA6oYnySqD\no3WSIpHzjguLkTLCasyVMtoYUOz8pTTPjGLiMvA/+fcOlo6IxHwdf5ujBbmGy5WD\nCq/ICUcddyMI4tYOkuwEhnRZ1a0X6RrK9ZOLpQjggzmxvSxrAQweN+onh1X6F0dT\nuGcuZz9lKVyvzkWEy5ei2JsZvDWAWTDN6fuB8/+pts0oXPpF6Uj3ebS9xvRfM1QW\nC9RJ5yZ0LY2cFR1y3omdYSyn9bkqYM4H5nskz1KQLF6VW+CwLmC3KGqr8Qc+h0Lm\nrpIxVNaNyMkyLMBEe+DPnGXyaUFsbqf+poxjbkIOa41ZlUhr9wBBX3Z5FNcWSYQA\nHdqK5OWT/YF2Wya+tIhlLSuDdKZtM7HdlDzlBGqlN9sspiGaMtA0hGIvDm2A+AUx\n-----END RSA PRIVATE KEY-----\n
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

