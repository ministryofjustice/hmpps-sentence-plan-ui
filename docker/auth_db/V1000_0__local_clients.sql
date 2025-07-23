UPDATE oauth_client_details
SET web_server_redirect_uri = 'http://localhost:3000/sign-in/hmpps-auth/callback,http://localhost:3000,http://localhost:3000/sign-in/handover/callback'
WHERE client_id = 'sentence-plan-client';
