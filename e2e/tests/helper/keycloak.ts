// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
// SPDX-License-Identifier: EUPL-1.2
import crypto from 'crypto';
import { Browser, BrowserType, chromium, firefox, webkit } from 'playwright';
import util from 'util';

import { config } from '../config';
import { KeycloakPage } from '../pages/KeycloakPage';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export const userCredentials: Record<
  string,
  { username: string; password: string; email: string; firstName: string; lastName: string }
> = {
  Alice: { username: 'alice', password: 'alice', email: 'alice%s@example.com', firstName: 'Alice', lastName: 'Hansen' },
  Bob: { username: 'bob', password: 'bob', email: 'bob%s@example.com', firstName: 'Bob', lastName: 'Burton' },
};
type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
};

function base64url(buffer: Buffer): string {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateCodeVerifier(): string {
  return base64url(crypto.randomBytes(32));
}

function generateCodeChallenge(verifier: string): string {
  return base64url(crypto.createHash('sha256').update(verifier).digest());
}

async function getAdminAccessToken(): Promise<TokenResponse> {
  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);

  const authUrl =
    `${config.KC_HOST}/auth/realms/master/protocol/openid-connect/auth` +
    `?client_id=security-admin-console` +
    `&response_type=code` +
    `&scope=openid` +
    `&redirect_uri=${config.KC_HOST}/auth/admin/master/console/` +
    `&code_challenge=${challenge}` +
    `&code_challenge_method=S256`;

  const browserName = process.env.BROWSER ?? 'chromium';

  let browserType: BrowserType<Browser>;
  switch (browserName) {
    case 'firefox':
      browserType = firefox;
      break;
    case 'webkit':
      browserType = webkit;
      break;
    case 'smoke-firefox':
      browserType = firefox;
      break;
    case 'smoke-webkit':
      browserType = webkit;
      break;
    default:
      browserType = chromium;
  }

  const browser = await browserType.launch({
    headless: true,
  });

  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  const kcPage = new KeycloakPage({ page });
  const code = new URL(await kcPage.login(authUrl, config.KC_ADMIN, config.KC_ADMIN_PASSWORD)).searchParams.get('code');
  await browser.close();

  if (!code) {
    throw new Error('Auth code not found');
  }

  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('client_id', 'security-admin-console');
  params.append('code', code);
  params.append('redirect_uri', `${config.KC_HOST}/auth/admin/master/console/`);
  params.append('code_verifier', verifier);

  const res = await fetch(`${config.KC_HOST}/auth/realms/master/protocol/openid-connect/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  const data = (await res.json()) as TokenResponse;
  return data;
}

async function createKeycloakUser(
  token: string,
  username: string,
  email: string,
  firstName: string,
  lastName: string
): Promise<string | undefined> {
  const url = `${config.KC_HOST}/auth/admin/realms/${config.KC_REALM}/users`;
  const payload = {
    username,
    email,
    firstName: firstName,
    lastName: lastName,
    enabled: true,
    emailVerified: false,
    groups: ['/TestGroup'],
    requiredActions: [],
    attributes: {
      locale: '',
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Create user failed: ${res.status} ${err}`);
  }

  const location = res.headers.get('location');
  const userId = location?.split('/').pop();

  return userId;
}

async function resetUserPassword(params: {
  userId: string;
  token: string;
  newPassword: string;
  temporary?: boolean;
}): Promise<void> {
  const url = `${config.KC_HOST}/auth/admin/realms/${config.KC_REALM}/users/${params.userId}/reset-password`;

  const payload = {
    type: 'password',
    value: params.newPassword,
    temporary: params.temporary ?? false,
  };

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }
}

export async function initializeUser(
  user: { username: string; password: string; email: string; firstName: string; lastName: string },
  testId: string | number
): Promise<string> {
  const tokenData = await getAdminAccessToken();
  const token = tokenData.access_token;
  const userId = await createKeycloakUser(
    token,
    `${user.username}_${testId}`,
    util.format(user.email, testId),
    user.firstName,
    user.lastName
  );

  if (!userId) {
    throw new Error('User ID not returned');
  }

  await resetUserPassword({
    userId,
    token,
    newPassword: user.password,
    temporary: false,
  });
  return userId;
}

export async function deleteUser(userId: string): Promise<void> {
  const url = `${config.KC_HOST}/auth/admin/realms/${config.KC_REALM}/users/${userId}`;
  const tokenData = await getAdminAccessToken();

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json, text/plain, */*',
      Authorization: `Bearer ${tokenData.access_token}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to delete user: ${response.status} ${text}`);
  }
}

export async function getAccessTokenOfUser(username: string, password: string): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: 'Frontend',
    username,
    password,
  });

  const res = await fetch(`${config.KC_HOST}/auth/realms/${config.KC_REALM}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  return res.json();
}
