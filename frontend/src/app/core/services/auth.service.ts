import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, CurrentUser } from '../models/auth.model';

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

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY) || !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token');
  }

  private handleAuthSuccess(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem('token', res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    localStorage.setItem('user', JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }

  private getUserFromStorage(): CurrentUser | null {
    try {
      const u = localStorage.getItem(USER_KEY) || localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }
}
