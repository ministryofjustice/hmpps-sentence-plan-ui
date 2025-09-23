-- Add auth client (auth_code flow) for local dev. Client secret is clientsecret
INSERT INTO oauth_client_details (client_id, access_token_validity, additional_information, authorities, authorized_grant_types, autoapprove, client_secret, refresh_token_validity, resource_ids, scope, web_server_redirect_uri)
VALUES ('sentence-plan-ui-auth-client', 3600, '{}', null, 'authorization_code,refresh_token', 'read,write', '$2a$10$lBwbziQlLfiCnn8Kj1PfMujEcLdsJYlYSNJvBRO638gCYTS9yN0xm', 43200, null, 'read,write', 'http://localhost:3001/sign-in/callback,http://localhost:3001/sign-in/hmpps-auth/callback');

-- Add system client (S2S calls) for local dev. Client secret is clientsecret
INSERT INTO oauth_client_details (client_id, access_token_validity, additional_information, authorities, authorized_grant_types, autoapprove, client_secret, refresh_token_validity, resource_ids, scope, web_server_redirect_uri)
VALUES ('sentence-plan-ui-system-client', 1200, '{}', 'ROLE_RISK_INTEGRATIONS_RO, PROBATION_API__SENTENCE_PLAN__CASE_DETAIL, VIEW_PRISONER_DATA, ROLE_SENTENCE_PLAN_READ, ROLE_SENTENCE_PLAN_WRITE', 'client_credentials', 'read,write', '$2a$10$lBwbziQlLfiCnn8Kj1PfMujEcLdsJYlYSNJvBRO638gCYTS9yN0xm', 43200, null, 'read,write', null);

-- It appends ROLE_ behind the scenes?
INSERT INTO roles (role_id, role_code, role_name, create_datetime, role_description, admin_type)
VALUES ('7efb8c07-4260-468c-9f39-8c9509a3b694', 'SENTENCE_PLAN', 'Sentence Plan User', '2021-10-15 21:35:52.056667', null, 'DPS_ADM');

INSERT INTO user_role (role_id, user_id) SELECT role_id, user_id from roles, users where username = 'AUTH_ADM' and role_code = 'SENTENCE_PLAN';
