import type { CSSkin } from './skins';

export const SKINS_API_URL = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json';

export async function fetchSkins(): Promise<CSSkin[]> {
  const response = await fetch(SKINS_API_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch skins: ${response.status}`);
  }

  const payload = await response.json();

  if (Array.isArray(payload)) {
    return payload as CSSkin[];
  }

  if (payload && typeof payload === 'object' && Array.isArray((payload as { skins?: unknown }).skins)) {
    return (payload as { skins: CSSkin[] }).skins;
  }

  throw new Error('Unexpected skins API response');
}
