const API_URL = 'http://localhost:4000';

export async function getFavorites(userEmail: string) {
  const res = await fetch(`${API_URL}/favorites/${userEmail}`);
  return res.json();
}

export async function addFavorite(userEmail: string, skinId: string, skinName: string, skinImage?: string) {
  const res = await fetch(`${API_URL}/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userEmail, skinId, skinName, skinImage }),
  });
  return res.json();
}

export async function removeFavorite(userEmail: string, skinId: string) {
  const res = await fetch(`${API_URL}/favorites`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userEmail, skinId }),
  });
  return res.json();
}