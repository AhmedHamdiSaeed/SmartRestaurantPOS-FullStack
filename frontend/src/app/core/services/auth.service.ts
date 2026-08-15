import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, AuthUser, RefreshTokenRequest } from '../models/auth.model';
import { CurrentUser } from '../models/app.model';
import { mapAuthUser } from '../utils/api-mapper.util';

const TOKEN_KEY = 'smartpos_token';
const REFRESH_TOKEN_KEY = 'smartpos_refresh_token';
const USER_KEY = 'smartpos_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _user = signal<AuthUser | null>(this.loadUser());
  private readonly _token = signal<string | null>(this.loadToken());

  readonly user = computed(() => this._user());
  readonly token = computed(() => this._token());
  readonly isAuthenticated = computed(() => !!this._token());

  readonly currentUser = computed((): CurrentUser | null => {
    const u = this._user();
    if (!u) return null;
    return {
      id: u.id,
      name: u.name,
      role: u.role,
      branch: u.branch,
      avatar: u.avatar,
    };
  });

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/v1/auth/login`, request).pipe(
      tap(response => this.persistSession(response))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/v1/auth/register`, request).pipe(
      tap(response => this.persistSession(response))
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    const payload: RefreshTokenRequest = { refreshToken };
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/v1/auth/refresh`, payload).pipe(
      tap(response => this.persistSession(response)),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      this.http.post(`${environment.apiUrl}/api/v1/auth/logout`, { refreshToken }).subscribe({
        error: () => {} // ignore error on logout
      });
    }

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  private persistSession(response: AuthResponse): void {
    const user = mapAuthUser(response.user as unknown as { id: string; username: string; name: string; role: string; branch: string; avatar?: string });
    localStorage.setItem(TOKEN_KEY, response.token);
    if (response.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    }
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._token.set(response.token);
    this._user.set(user);
  }

  private loadToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private loadUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) as AuthUser : null;
    } catch {
      return null;
    }
  }
}
