import { useState, useCallback, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export interface AuthUser {
  name: string;
  email: string;
  picture: string;
}

const STORAGE_KEY = 'csgoapp_auth_token';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY);
    if (token) {
      try {
        const decoded = jwtDecode<AuthUser & { exp: number }>(token);
        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((credential: string) => {
    const decoded = jwtDecode<AuthUser>(credential);
    localStorage.setItem(STORAGE_KEY, credential);
    setUser(decoded);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return { user, loading, login, logout };
}