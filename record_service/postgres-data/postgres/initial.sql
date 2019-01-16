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
ALTER TABLE IF EXISTS ONLY public.record_keys DROP CONSTRAINT IF EXISTS record_keys_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.record_keys DROP CONSTRAINT IF EXISTS record_keys_record_id_fkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.records DROP CONSTRAINT IF EXISTS records_pkey;
ALTER TABLE IF EXISTS ONLY public.record_keys DROP CONSTRAINT IF EXISTS record_keys_pkey;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.records;
DROP TABLE IF EXISTS public.record_keys;
SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: record_keys; Type: TABLE; Schema: public; Owner: testuser
--

CREATE TABLE public.record_keys (
    record_id uuid NOT NULL,
    user_id uuid NOT NULL,
    encrypted_key text NOT NULL,
    iv text NOT NULL
);


ALTER TABLE public.record_keys OWNER TO testuser;

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
-- Data for Name: record_keys; Type: TABLE DATA; Schema: public; Owner: testuser
--

COPY public.record_keys (record_id, user_id, encrypted_key, iv) FROM stdin;
8d008c48-4afc-4546-992c-0d9fa0805bd2	81948f08-cb02-4428-b7ce-4889c0fcddf1	87220dc315e94df5c518219d45156016bb3009f77afd04ba2fc44b2484ab4c6ad57336b8d4415035d9d9b656f5a850cc045754898c7e6521023130b1c3ea5c5eb467eaca241847a1d16e4de1bea50c875c4456342461cfb73d6314e3d6e91fb6f5f907483a619ade381504e3036b9e8f45ae7acba334f60fc552dc3ef88e9b73e82b503cb89a7e4495eb73a75dae43ede2c0911f6d8c2be4a9a31fbef5bfbfb3374fb7cf80e9d58c042b531dca8819c1eca78caf79ddf53afd58d02335307eb06676d6195c9db1ef5c8c2b84ded5f3f99c7a218ccbd0f4da0e122b29121b300abf6cc62840c376b2d794e1393a3dcfc42bb071207eec4306544973d8ae57c34d	5f83c88fea5ee09c1a58390b7cd7d829
8d008c48-4afc-4546-992c-0d9fa0805bd2	282e129a-e578-4b21-b068-c71c2e84c839	11a5292efc3bf3eddeeb83f01a659bbdc7046af800032371658d5b4023c674a346cf59d4a47ac6000bc086bf8a623b4c9aadc0b30dc12d4f44374efd1e5979fa038ad22bc479a50c3f3b47608268bd1d7f2441e5a51433e15e52b6df2d17285d1adcb7ae4cb839b1c3541f2835b6051eb6c5220f30bd90ded38bf49b5977d2f144986e5a885c065cf5dd68b76e97c45c6cd01d6535b0da80e0f57e976780169f75fb98c9ea45320d73ac6539d7d75e40d0229d0ef9d2b0f207ed7a813c75542dbc67fd3326152c5f173ecea2d60a8c01c4c6c38453c54756e38a0461bf296407c86bf83c534d035ac9a23c6ee36c7df972b2bb03aea780938c1d966ed78a5f4b	5f83c88fea5ee09c1a58390b7cd7d829
22efb8c2-c8eb-433d-96d1-9a6c6d64a254	81948f08-cb02-4428-b7ce-4889c0fcddf1	305c9b6a5ea2eb7f58fe95597323af51a7a3a842d1ba21bf48a5ab88d77870f5a2b348186d9419648ec5035fb1859759fccc93d27cdf74a331e15595bd626f59f12ee71e5db60e2907ee7942eff55c64e23886867e2958deb60872416c0a0d684a79e02e2883a0b37358dab067516f80ca4ca38b3b00ac8dcc1a1ab1022e1130036ece593b0bced81611dd5b0827e0b4a7473612ef0ae31bfa59121e19264130ebb4e9301d0bb58979e56bcf6091079a02e1b7ef445f3d88bb4e5d482a143bbfd639367264bfd24f2deee7a4053796d40e88cd9dd8a7fbe0e88e283bf926f66ede94c7fd0e9f8bc60eb134f09ace8293fde2c76471cbcfa3e5a64788f6c2b350	766ab2ed599f89cda86e1c67ffe58704
22efb8c2-c8eb-433d-96d1-9a6c6d64a254	282e129a-e578-4b21-b068-c71c2e84c839	3cb22ffefda365fee9194fc692f70220a79f31b6020c78d2ce33929f922c35dcde6dd0cd116d510529d7273eb5234a0d7a5cd3bb72b4431fdb6bf6c74fb0395cc0e55b1e7b494121c3f0ee09827a837750acb8e3c111a36f6d4899cd4387ee91bbe5ec05f615bd19dc2c3430fe248c0b70eb925e06eb97351d6d3e75b4e442fc025c28f8e7287687babd77a94d6a86c165d12c3b2fc77b9d38701de845b666070dc68a235cfd3b2946cf9cc7b35603d1b0a165dd6a958ceb79ca6ea70f6a8fec6fd05e0c3610121f6a92f0a3e7c10c6968bb464f2e4035df5425833cb78dcae543fb7b769bc9d52166df5209b8029f82fe3e6053032dac058a37f4eeac6ce861	766ab2ed599f89cda86e1c67ffe58704
65d00a18-a39e-47f7-8f62-b151e5fd93d3	81948f08-cb02-4428-b7ce-4889c0fcddf1	0c14a1e722cf57974bc3cf4d7cb453a352c510491504e25d58a1bdfd14079d8a6222575f13f85f3d7bf4abefed8f29fbe2f06bb97a831d6f2d61db21b3b22510477d8da9a2cc7838d995447c77f1faa6aabeea7a2eeaf2b051dc444beee644c2b1b10edfd9d32eba0a8c3928f7410abb2c1cb12fc929b3b25cc0fb1adab16b09ea47ca9d437676107c59f49694b8f195809c26e52aaf8c180556782db7057bf183b31c28623c38a48d899cae8de87a342fea6a4ca658ce3ba55062322266eea126a4eff392affadb625f62ae9c03b791f230c3f91ce8f5f3f73974e615d0b2086a31869af3ba8b494e4a30b887fbd918bfee1794153b79260efe201cde1ddcff	0582d8951f08b5e3979dab7969d4a48d
65d00a18-a39e-47f7-8f62-b151e5fd93d3	282e129a-e578-4b21-b068-c71c2e84c839	2b15247197dc090345592c62ba092027d9d79cd081ec7b2b7af1a2a16a631a88a1f38b7f5d67f52709133b0f5c7b9b89b2b1f424be193cc57b26f169fca38c3abaa488c2ac4022de9b04e2e14cf9fe74038bbed8232d98673ab0b7b5bace1bc052e237cb89fbb309e16772becf6bdbad25460836b777514201281403c72b12bb30f154057fb09942c4a8a6117088fef76db5bbf226331e018bd389b651d9091da390e7dd119d1fb8c9e9f81467c216081ee8f05fc5dfc1ec86e24800440b2b3314f7d7eb200d532e82657f9b65e1473ddbe6c07652b23173a8a288eb6afd2fe74bd8824c364b73d4d21b8ff09efb669bfd8884587e47178bd1aad1cec45f3e90	0582d8951f08b5e3979dab7969d4a48d
7e6fdfb9-056d-46f9-b8fa-6b3677d0baf8	282e129a-e578-4b21-b068-c71c2e84c839	1a7d45440dbc9213ed507d2a9581b4a6ec6cdf3c85c10e7fd343d9050df1907dc314928349ebd573102a1a6c961148e7059e4791756e6a9dd819f0da478a3f63d60e5aaba1c1d3f0141cdc10c279c537c0393db702ca5ecd3e03a66576d35b0b6c3fdb02f9d57d6daa73286700ad01cb0654551a7f357040e02a96a0789f1e0e35051554b4eb0b049e71a0f6984388dd609eb2b2eb823ee0950e207ff82ad2a5ca47a611ac2ce16fcff0b13b108252d8c7671872192c61a4c9b0d6d0d962cc6b2305e67027d18b93f327955e66fe2e950fc1f0f5eeeb6aca2840f538c45365abfd6141cd0e8571bd802ff93efb4d12e7769cce7dc92c8dee54ef493bd3a14f04	d67051fb4c11e9abd6be4624b4520593
7e6fdfb9-056d-46f9-b8fa-6b3677d0baf8	81948f08-cb02-4428-b7ce-4889c0fcddf1	b9435e4cbaab4363ec89c8714e9bce15409aaed9f9ea70be4a3a40eac4b7db0835d7d9f478695f29c3f609020e097dc22aed2697e794ec43620c08e162bd76da1d3e8938f74e528db3976191e4acbadbf676f41ebfdd04292549ef930afd1a80797f0088ae61fbeb7ecf46c15c7f2162d1ccbb17e12ecdd8ec3c1eeb02f66a611ba53b90fbf2e3bd1b107d17450c55fd9ed6a0053dae2e3a5f292bf7ac826171168c190ca15b269494063ef5b90efa0a2efd82ff8f9a59ae31ad497db373180330822d9ac2fbad3b7f3e34cab8311de683dd45ba7063d56267ab8d99599178987802f05a93164b0e1dba286dfd809ed68269aa76e1d259b06d81aad0da5dda7f	d67051fb4c11e9abd6be4624b4520593
\.


--
-- Data for Name: records; Type: TABLE DATA; Schema: public; Owner: testuser
--

COPY public.records (id, creator_id, archived, record_hash, filename, created) FROM stdin;
8d008c48-4afc-4546-992c-0d9fa0805bd2	282e129a-e578-4b21-b068-c71c2e84c839	f	QmT3JbtQkc6m9SzmzCJ5D2KhwGnXUy93N3BA85NxaxHnLY	Document1.txt	2019-01-16 20:41:31.49604
22efb8c2-c8eb-433d-96d1-9a6c6d64a254	282e129a-e578-4b21-b068-c71c2e84c839	f	QmaHfiJgtfAfrMo6JQ9Zv8xWykBfcsWwcfWF3ZHYNA5F1Y	Document2.txt	2019-01-16 20:41:40.43042
65d00a18-a39e-47f7-8f62-b151e5fd93d3	282e129a-e578-4b21-b068-c71c2e84c839	f	QmSeMLdkdLtaTGftszWhpRVcFG9gJoPcrgXB1sit1d5NSp	Document3.txt	2019-01-16 20:41:48.349944
7e6fdfb9-056d-46f9-b8fa-6b3677d0baf8	81948f08-cb02-4428-b7ce-4889c0fcddf1	f	QmNVwrPTEmUfH6Nzf7RL7wA1EQ2ZrRE73XcvoLZfTP1Y36	Document4.txt	2019-01-16 20:42:30.153431
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: testuser
--

COPY public.users (id, email, password, public_key, private_key) FROM stdin;
282e129a-e578-4b21-b068-c71c2e84c839	a	pbkdf2:sha256:50000$hKmTpcht$31fc0941109d730eba83662d3749e24407a48102d0c7785365f4ea42fb9bc239	-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2BNIgCJvDhxR/OpADhNw\niL+SX4DWcP5LOnHU2/czphjorLdkLO4IGb1xFWBKVE9POC3hOQJ5eP1mKU5tsewl\nWuq87iw+apG1VpjaNiHsgXcCFbOdYjNWZ+km+03jq7Vba4BZrarIUIZGueNbPhQC\nI4YtzomMDxtI8/88EYlzJqwJ9SXK6n+vpsxfx0i/v4Zz0dO5cK6BTEWWZ/tmqF+q\nfeXxHM9ZnlBsHXl7Ci7FXmTBuHLHoh7YF5CoLtMyCQQUuiYp87vvnwrjjC25ek5d\nLg/bncgSgzOx0dlsU3+FczDaVAdpHhqTDeZZqjyr05yqKQRb1t4n8/KvZeVFXmAb\n3wIDAQAB\n-----END PUBLIC KEY-----\n	-----BEGIN RSA PRIVATE KEY-----\nProc-Type: 4,ENCRYPTED\nDEK-Info: AES-256-CBC,A950E7ABFCC6B60923D44F73A8D4DCDE\n\neXUOKmUT04zSO7quhHh9VvE13kWZoORpS9vanvIxur7WHBN9O7lXQ+vD/FeJ9/4+\n+m1gPCcbz1MjlLyDC6KikkdsAOBjLvhGZTOC9NGQE8XDlU6A3OV8hDb+jne3OPkU\nmWz48ld/w/Fz6eMU4z7XqiSDz3oQeUnk2bS2r500HlNhUiXCrvtYQbRGeerctOvN\n43QonQcLj+kPGYV8KACCwudpfpyh8hZvdlUs4a2Tfl63mH9HBJAnVG34fNE6Yr8/\nLeuLpS42KQrF/j3h0JN2d9LOv8wa4I30HhAirccandpuq4fbSzkzCoYPywO+h4W7\nC8BZjINqV1V/wXRphfHINvIGBZpDleUsGcmcwyLBWhhw6MM09391HPpEr/oxM1DZ\n/9zy6+w1fyufvOs7q8iq0suD9967KOj+y0aRuuM9xAm9RlNrnMVY8qcfvwdvPgXF\naTyhahZKBMcEvYBQP4GJ5sf7DQhM4FgzeGAnTg5ClGlZJb1HR6qRdGHFBlwENrSX\nclAs7cl0JxIwny6PW6aESxMqxpqlWdzy193ZL/l8dsYE1bummrmUf6Q544Kd282s\nmBDPmrWssCK+w78zHx/YEOSpx5b/6ES/Hd+Ob7sCGjR1wTewHFY0vfwNvWkEiKzq\nLPxgwmRr+UdJ2lWZWCQETCwDgM26v5HY3yUte3G63LqPI1MwI8MLGnV3y8Bw6yJp\nbxi5gqxBDSfTiMRkO1UDBKR9nzmm4sJFQUI4QCCJNYyvCXNdcp/PIttvR1sdP5kP\nkn10lThZ9aR0KnjUK1BGjYWR7zDJkuk0qT9iWZex6IXQGXWY5ywL3HahkdKWTLTK\noRsDgCm4ZCfjPuRRyDfAgl1JnfjPS+yCspSQJ4CNIztovJ2M10drgTduK6Cj5w2d\n9qX2YoPCUSobYlNmzRXJNGMXQj28Z6EbLnbOT/2wZxWRd/i8T0wuoQrxmfLnSPXs\nuqUQDHnV0D5zNiCrmwD2ziW1Vi+ksSguGeNrPXlCkDzUgp+skWAVPLx+ZkCkonpl\nnr1D0epxTD3LI+JBcaoYz+8Jg+K1Pnf1HWR/0pz1twGpZhWhqlP2LUJ9OZD79b3N\nA+HBbB0tPRYe2fm2bQmvJV75qxM6Fg0aG0TWDWVwmOzaqHcKjtWLEoC0Ao5sAW9V\ntGBuknXHura4/dKpyYd+1s5rsZXaFxixKck8d2lEZmBMSBpFyAIAgVumjXjG1SIL\nhO/R88aw13cY85j/BrGEb/fPtt1ZIKLA62n3i3Iy1ULixY35orkThloMYyZ77IMH\nVAKFC7DnOgww0zFOpnl5YbjceOBbEzDMM6HmKBrNAGJ/7wYJ0ywKX6lQnX7O/edX\nvCtY53ROYB6yAhIMunux/xErv5NL/+pZZ6m4DQNcs0FK/spbSHLdd6I8OUPeMAsd\n5kntqg8RVsUVkB4I63AMv6YeHTSULfD1TRqCE/MT8IqoQFFxSDPH45HW2pwqXQCJ\n6izM6ovltY64sXzDs2sMCgHaCEP4WEq+5tt/Xkrl82HdTd1nXuPjkbuHNUXYS/e/\nSMVjIUPdmfWlhn0hBaKI+6TOJXuZmRuVZcR2ppNluPhI868YN43fFPA0UzEWQt5o\n-----END RSA PRIVATE KEY-----\n
81948f08-cb02-4428-b7ce-4889c0fcddf1	test@medfs.com	pbkdf2:sha256:50000$bEgfW3Ua$71e8738cabd371a4996c858303e53f7d8a16280eaf4402cdfb88035778aa8cb1	-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5Z+aMhjtoaMa04V0RwkT\n3nX0/MJ1C0blmcAh9VAEwe/+zC0S3drW42FZBY5zp452QvfrXKjjaf7tQPwlsw5h\nGeWY8PxE7PCVa77p+RnD/4+fEUOaSvNv58IaEZDB1FeOh7a4J+TMvjeUF22OPhUn\ne1MFi0NBqrWyEPmz+omsynSx0s057aMkumGJH6B2bw5OQUOzPfgIDOtsRU/uD/25\nyP1UtdWRz8VUYxHxFr+1Eyd8oxHv2UndjlctU7mAKyYjdbikSaKKv2S07iBluetO\nw5PAJRPbq6Af5KDog6pqGb+ChtqHXE4vPq3/Wx+xk1FaSNy30Y1DVyK7OoTHJrPY\nwwIDAQAB\n-----END PUBLIC KEY-----\n	-----BEGIN RSA PRIVATE KEY-----\nProc-Type: 4,ENCRYPTED\nDEK-Info: AES-256-CBC,EA3BCD4FFB35358A1A548BE03739BC72\n\nHjPd4d7daBdly6pQR3wAOz5HQrF10pel4UcPZCiyBv5tsNi3HBH/r51WrwzXcUM7\n06Hcr/3Atd5WPWT/47+agPfDSlb+TAnDw9Q2RNNmJBdr+joJcxGXpmB8//3/YRF+\nG2G1ffjujc1pl6FaKCsu7x3k28EHeCjHfZgXf95XcScqamD7YfiyVdtjoQ7rnK1H\nWsUsRpTeVqM78lWUgX4/bjHh6pbXJHSUBeKb0Lyu23pVWR9n8MfbV/vl+sg+SVLF\ncFckaJHAnKYhAV1nP8pCqhX9DB6yckd+TGd9faZzyTdJp+KJoBbC+hbv5tnZnJJN\nTZcNtdSkh+kafoT4hiqi5snEABOn0QRzZ78vL9HEUMF7zVHiwShQf0sSZOc+Zi18\nu0pNyv/KpDhB4AjzSWMAE5SvKX6KKzDxz3Z20ZZ+EDsGpirZglZUIYfAdhoHByWG\n6t3P8fXbPPmppHhHJFF34TJB5uzt0BRR7pm3iHfXd7D0J1Xalhr9rjk4Bsc7vpfm\nhZ847kfbB0hvM9q/K7RoH+g+4W/QCFSslL3dAA1NY32HWOzpniju0Eylfqxj1a2i\nZ3JmHCEW2k6GBa9DLU7RiWLcaUfZA6Scb7Eafyf9qXsYSThJ1Ed+ZwuxVGN0QmcA\nB7oWT6L2kzWYl7YaXKs0LhiWB45uyy3ogd7upbS+SSvr06SZ/2OCijOtopwuOauY\nQRtmu8KDJYsmL/rt3RlUQSRsL+URb3Lpfh1OePZuUzTzEy9nrt/Y39hIixCAVDvz\nXvhlw5Ds03/YLqLXOqxOox1w1fNxKj4fZXDILzwjfKJ+Ic0w0uXvmcANWpTIU3gf\nZD1YQ03EyCc0wETa0AV4eBPWM2EElcgUCpMzgcaPjgJUP87HmzsqPTCShQS6c+kx\n3xVYa/5cp3UIS6wdvZNeIZj8/zhwlxzLedjQ1+pMqH4ITanmhByf0PL5bsBLYZ7s\nR/7O8Ajstl9VW+cKQpNnhOXsvL1pfTLv3Y+jc9DqDvc+qiS4a3cGY+88H+smruQt\nCyBnC+tCyvEBTnzai9sYJ1pc359Kzpgz2o6a4nMhw3mM7Z+d60NoN0yW5mZ4UOLr\nmQgn8SGqNJm9wIPA+FzxiOmI6uYJyg3fXXEdob9w5ujlOeonOj1pSXqLbOH0mmcu\nN4FfA1hKkYvaMAQzqrPD/PU8OeUaXYsPNwegAlOqEqIRAiPPDQDCxGEo3k2RquDf\nEl1Lz7Z9jN2KayiOh10qyrhUtYmHadu5vwjNvqcmx3p400jbS40ClK4yc02DakEZ\n006qG9zxyP0kOL1AbydpZisaQ4ys7o6WU5jr/jmZBHF5YUtsgWqLITJdqGoCHiC3\nPxQ3clZe4GYT4mdl32IKOjZdqO15KxGrby1n4BUhmvs6xCW2A7BFddLBiv1jFCKX\nLwGNoT3h8XBenlEm8PMUW5/3/oXH53FVENiHgdPRQmtOhGbLJgEbnVkhzmrJWnPI\nkEH1+qtPEY+4ffQ+AtZYkrGSvVlrFshy78dU5cdIUhLkoqvby9Oh/oNjyQguztSP\nCwnmrNwzxVAhhoWJYmUguv64QRayMZPGZhPj/xTZjt+UE8VQoA5MButQoTkwTrDa\n-----END RSA PRIVATE KEY-----\n
\.


--
-- Name: record_keys record_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: testuser
--

ALTER TABLE ONLY public.record_keys
    ADD CONSTRAINT record_keys_pkey PRIMARY KEY (record_id, user_id);


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
-- Name: record_keys record_keys_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: testuser
--

ALTER TABLE ONLY public.record_keys
    ADD CONSTRAINT record_keys_record_id_fkey FOREIGN KEY (record_id) REFERENCES public.records(id);


--
-- Name: record_keys record_keys_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: testuser
--

ALTER TABLE ONLY public.record_keys
    ADD CONSTRAINT record_keys_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: records records_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: testuser
--

ALTER TABLE ONLY public.records
    ADD CONSTRAINT records_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

