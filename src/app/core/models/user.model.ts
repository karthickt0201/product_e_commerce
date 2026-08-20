export type UserRole = 'admin' | 'user';

/** Shape stored in the mock user store (users.json). Password is a SHA-256 hash, never plaintext. */
export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

/** Public-facing identity — never carries the password hash beyond the auth service. */
export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

/** Decoded payload of the mock (base64) JWT. */
export interface MockJwtPayload {
  sub: string;
  name: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}
