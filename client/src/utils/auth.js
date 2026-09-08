import { jwtDecode } from 'jwt-decode';

/**
 * Single source of truth for "what role is the current user" on the client.
 * Reads the same localStorage keys every part of the app already uses
 * (accessToken / role) — no change to what's stored or how login/logout work,
 * just one consistent way to read it instead of the 3 patterns that existed
 * before (some pages read localStorage 'role' directly, others decoded the JWT).
 */
export function getCurrentRole() {
  const token = localStorage.getItem('accessToken');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      if (decoded?.role) return decoded.role;
    } catch {
      // fall through to the localStorage fallback below
    }
  }
  return localStorage.getItem('role');
}
