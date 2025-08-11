UPDATE oauth_client_details
SET web_server_redirect_uri = 'http://localhost:3000/sign-in/hmpps-auth/callback,http://localhost:3000,http://localhost:3000/sign-in/handover/callback'
WHERE client_id = 'sentence-plan-client';

-- It appends ROLE_ behind the scenes?
INSERT INTO roles (role_id, role_code, role_name, create_datetime, role_description, admin_type)
VALUES ('7efb8c07-4260-468c-9f39-8c9509a3b694', 'SENTENCE_PLAN_USER', 'Sentence Plan User', '2021-10-15 21:35:52.056667', null, 'DPS_ADM');

INSERT INTO user_role (role_id, user_id) SELECT role_id, user_id from roles, users where username = 'AUTH_ADM' and role_code = 'SENTENCE_PLAN_USER';
