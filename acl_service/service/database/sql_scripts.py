dump_script = """
INSERT INTO "public"."permission" ("id", "is_readonly") VALUES ('20464c99-996f-4a4e-93a9-05f58e2546a5', 't'),
('ae5158c5-3d36-4cbe-b57e-9f361de1eddb', 'f');

INSERT INTO "public"."acl" ("user_id", "record_id", "permission_id") VALUES ('42bc901c-d3ab-411b-8eaf-69ce01cc3b2c', '10df9bfe-cdfa-40b5-9990-4a0b5acd4c50', '20464c99-996f-4a4e-93a9-05f58e2546a5'),
('42bc901c-d3ab-411b-8eaf-69ce01cc3b2c', '920a237b-5db0-4ae3-bb28-e62adbe13cb4', '20464c99-996f-4a4e-93a9-05f58e2546a5'),
('42bc901c-d3ab-411b-8eaf-69ce01cc3b2c', '9afe9eb0-00ca-49b5-946f-457d8cf466fb', '20464c99-996f-4a4e-93a9-05f58e2546a5'),
('42bc901c-d3ab-411b-8eaf-69ce01cc3b2c', 'a91b95ca-ef78-4e80-b2b8-d7805574d486', '20464c99-996f-4a4e-93a9-05f58e2546a5'),
('42bc901c-d3ab-411b-8eaf-69ce01cc3b2c', 'aa19e0ca-491a-49f6-aa34-ba89de48d227', '20464c99-996f-4a4e-93a9-05f58e2546a5'),
('42bc901c-d3ab-411b-8eaf-69ce01cc3b2c', 'aa450caa-5c1b-41e5-8b88-cd7d29dd8263', '20464c99-996f-4a4e-93a9-05f58e2546a5'),
('42bc901c-d3ab-411b-8eaf-69ce01cc3b2c', 'c243f0a3-d918-4488-94a6-92a4406bc30d', '20464c99-996f-4a4e-93a9-05f58e2546a5'),
('42bc901c-d3ab-411b-8eaf-69ce01cc3b2c', 'ce8b4926-1acf-4caa-aba7-bd0a02fbb4c9', '20464c99-996f-4a4e-93a9-05f58e2546a5'),
('42bc901c-d3ab-411b-8eaf-69ce01cc3b2c', 'dcfea1e9-d503-49f7-ad0e-b41bdfb1a56c', '20464c99-996f-4a4e-93a9-05f58e2546a5'),
('42bc901c-d3ab-411b-8eaf-69ce01cc3b2c', 'f637264f-ecb5-4908-b2e0-069661db5fa5', '20464c99-996f-4a4e-93a9-05f58e2546a5'),
('ba44c2e0-4b70-4d2a-8798-caa5895434a2', '10df9bfe-cdfa-40b5-9990-4a0b5acd4c50', 'ae5158c5-3d36-4cbe-b57e-9f361de1eddb'),
('ba44c2e0-4b70-4d2a-8798-caa5895434a2', '847f4e82-61c1-48ee-a77a-d1762d7188db', 'ae5158c5-3d36-4cbe-b57e-9f361de1eddb'),
('ba44c2e0-4b70-4d2a-8798-caa5895434a2', '920a237b-5db0-4ae3-bb28-e62adbe13cb4', 'ae5158c5-3d36-4cbe-b57e-9f361de1eddb'),
('ba44c2e0-4b70-4d2a-8798-caa5895434a2', '9afe9eb0-00ca-49b5-946f-457d8cf466fb', 'ae5158c5-3d36-4cbe-b57e-9f361de1eddb'),
('ba44c2e0-4b70-4d2a-8798-caa5895434a2', 'a91b95ca-ef78-4e80-b2b8-d7805574d486', 'ae5158c5-3d36-4cbe-b57e-9f361de1eddb'),
('ba44c2e0-4b70-4d2a-8798-caa5895434a2', 'aa19e0ca-491a-49f6-aa34-ba89de48d227', 'ae5158c5-3d36-4cbe-b57e-9f361de1eddb'),
('ba44c2e0-4b70-4d2a-8798-caa5895434a2', 'aa450caa-5c1b-41e5-8b88-cd7d29dd8263', 'ae5158c5-3d36-4cbe-b57e-9f361de1eddb'),
('ba44c2e0-4b70-4d2a-8798-caa5895434a2', 'c243f0a3-d918-4488-94a6-92a4406bc30d', 'ae5158c5-3d36-4cbe-b57e-9f361de1eddb'),
('ba44c2e0-4b70-4d2a-8798-caa5895434a2', 'ce8b4926-1acf-4caa-aba7-bd0a02fbb4c9', 'ae5158c5-3d36-4cbe-b57e-9f361de1eddb'),
('ba44c2e0-4b70-4d2a-8798-caa5895434a2', 'dcfea1e9-d503-49f7-ad0e-b41bdfb1a56c', 'ae5158c5-3d36-4cbe-b57e-9f361de1eddb'),
('ba44c2e0-4b70-4d2a-8798-caa5895434a2', 'f637264f-ecb5-4908-b2e0-069661db5fa5', 'ae5158c5-3d36-4cbe-b57e-9f361de1eddb'),
('f6bc7939-deb1-4bc9-b77b-aa5dc9e98209', '847f4e82-61c1-48ee-a77a-d1762d7188db', 'ae5158c5-3d36-4cbe-b57e-9f361de1eddb');

"""
