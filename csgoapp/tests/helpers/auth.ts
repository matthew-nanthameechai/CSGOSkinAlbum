import { Page } from '@playwright/test';

interface FakeUser {
  name: string;
  email: string;
  picture: string;
}

// Builds a fake (unsigned) JWT — enough to satisfy jwtDecode, which only
// reads the payload and never checks a real signature.
function buildFakeToken(user: FakeUser): string {
  const header = { alg: 'none', typ: 'JWT' };
  const payload = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // expires 1 hour from now
  };

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  return `${encode(header)}.${encode(payload)}.fakesignature`;
}

export async function loginAsTestUser(page: Page, user: FakeUser = {
  name: 'Test User',
  email: 'testuser@example.com',
  picture: 'https://example.com/avatar.png',
}) {
  const token = buildFakeToken(user);

  // Put the token in localStorage BEFORE any app code runs
  await page.addInitScript((t) => {
    window.localStorage.setItem('csgoapp_auth_token', t);
  }, token);
}