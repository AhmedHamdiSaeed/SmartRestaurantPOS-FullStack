import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="glow-bg"></div>
      <div class="login-card card animate-fade-in">
        <div class="brand">
          <span class="logo">⚡</span>
          <h2>Sahm <span class="accent">POS</span></h2>
          <p class="subtitle">Smart Restaurant Management Microservices</p>
        </div>

        @if (errorMessage) {
          <div class="alert alert-danger">{{ errorMessage }}</div>
        }

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Username</label>
            <input type="text" class="form-input" [(ngModel)]="username" name="username" placeholder="Enter username (e.g. admin)" required />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" [(ngModel)]="password" name="password" placeholder="Enter password" required />
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>

          <div class="demo-hints">
            <p><strong>Demo Logins:</strong></p>
            <p><span>admin</span> / <span>admin123</span> (Manager)</p>
            <p><span>cashier1</span> / <span>pass123</span> (Cashier)</p>
          </div>
        </form>

        <div class="auth-footer">
          Don't have an account? <a routerLink="/register">Register</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      background: var(--bg-base);
      overflow: hidden;
      padding: 20px;
    }
    .glow-bg {
      position: absolute;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(139, 92, 246, 0.05) 50%, transparent 70%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
    }
    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 36px;
      z-index: 1;
      box-shadow: var(--shadow-lg);
    }
    .brand {
      text-align: center;
      margin-bottom: 28px;
    }
    .logo {
      font-size: 40px;
      display: block;
      margin-bottom: 8px;
    }
    .brand h2 {
      font-size: 24px;
      font-weight: 800;
      color: var(--text-primary);
    }
    .accent {
      color: var(--brand-primary);
    }
    .subtitle {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 4px;
    }
    .btn-block {
      width: 100%;
      margin-top: 12px;
      padding: 12px;
    }
    .alert-danger {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
      padding: 10px 14px;
      border-radius: var(--radius-md);
      font-size: 13px;
      margin-bottom: 16px;
    }
    .demo-hints {
      margin-top: 20px;
      padding: 12px;
      background: var(--bg-elevated);
      border-radius: var(--radius-md);
      font-size: 12px;
      color: var(--text-secondary);
    }
    .demo-hints span {
      color: var(--brand-primary);
      font-family: monospace;
    }
    .auth-footer {
      text-align: center;
      margin-top: 20px;
      font-size: 13px;
      color: var(--text-secondary);
    }
    .auth-footer a {
      color: var(--brand-primary);
      text-decoration: none;
      font-weight: 600;
    }
  `]
})
export class LoginComponent {
  username = 'admin';
  password = 'admin123';
  loading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.username || !this.password) return;
    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/orders']);
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Invalid credentials or backend unavailable';
      }
    });
  }
}
