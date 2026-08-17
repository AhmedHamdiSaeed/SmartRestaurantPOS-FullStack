import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, AuthUser } from '../models/auth.model';
import { CurrentUser } from '../models/app.model';
import { mapAuthUser } from '../utils/api-mapper.util';

const TOKEN_KEY = 'smartpos_token';
const USER_KEY = 'smartpos_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/api/v1/auth';
  readonly currentUser = signal<CurrentUser | null>(this.getUserFromStorage());

  constructor(private http: HttpClient, private router: Router) {}

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, req).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, req).pipe(
      tap(res => this.handleAuthSuccess(res))
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
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  private persistSession(response: AuthResponse): void {
    const user = mapAuthUser(response.user as unknown as { id: string; username: string; name: string; role: string; branch: string; avatar?: string });
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._token.set(response.token);
    this._user.set(user);
  }

  private getUserFromStorage(): CurrentUser | null {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }
}
