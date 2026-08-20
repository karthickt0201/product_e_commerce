import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, delay, switchMap, tap } from 'rxjs';
import { CurrentUser, MockJwtPayload, StoredUser, UserRole } from '../models/user.model';
import { base64UrlDecode, base64UrlEncode, sha256 } from '../utils/hash.util';

const SESSION_KEY = 'pc.session.token';
const TOKEN_TTL_MS = 1000 * 60 * 60 * 4; // 4 hour mock session

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  /** Private writable signal — every other signal in the app reads the readonly views below. */
  private readonly _currentUser = signal<CurrentUser | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly role = computed<UserRole | null>(() => this._currentUser()?.role ?? null);

  constructor() {
    this.rehydrateFromSession();
  }

  /** Simulates a network round trip (600ms) against the local mock user store. */
  login(email: string, password: string): Observable<CurrentUser> {
    return this.http.get<StoredUser[]>('assets/users.json').pipe(
      delay(600),
      switchMap((users) =>
        this.buildAuthResult(users, email, password).pipe(
          tap((user) => {
            this.persistSession(user);
            this._currentUser.set(user);
          })
        )
      )
    );
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
    this._currentUser.set(null);
  }

  private buildAuthResult(users: StoredUser[], email: string, password: string): Observable<CurrentUser> {
    return new Observable<CurrentUser>((subscriber) => {
      sha256(password).then((hashed) => {
        const match = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === hashed
        );
        if (!match) {
          subscriber.error(new Error('Invalid email or password.'));
          return;
        }
        const { passwordHash, ...user } = match;
        subscriber.next(user as CurrentUser);
        subscriber.complete();
      });
    });
  }

  private persistSession(user: CurrentUser): void {
    const now = Date.now();
    const payload: MockJwtPayload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      iat: now,
      exp: now + TOKEN_TTL_MS,
    };
    const token = `${base64UrlEncode({ alg: 'mock', typ: 'JWT' })}.${base64UrlEncode(payload)}.mock-signature`;
    sessionStorage.setItem(SESSION_KEY, token);
  }

  private rehydrateFromSession(): void {
    const token = sessionStorage.getItem(SESSION_KEY);
    if (!token) return;

    try {
      const [, payloadSegment] = token.split('.');
      const payload = base64UrlDecode<MockJwtPayload>(payloadSegment);
      if (payload.exp < Date.now()) {
        sessionStorage.removeItem(SESSION_KEY);
        return;
      }
      this._currentUser.set({
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        role: payload.role,
      });
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }
}
