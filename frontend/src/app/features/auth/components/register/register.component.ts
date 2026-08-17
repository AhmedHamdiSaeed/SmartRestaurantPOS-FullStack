import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card card animate-fade-in">
        <div class="brand">
          <h2>Create Account</h2>
          <p class="subtitle">Join Sahm POS Platform</p>
        </div>

        @if (errorMessage) {
          <div class="alert alert-danger">{{ errorMessage }}</div>
        }

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-input" [(ngModel)]="name" name="name" required />
          </div>

          <div class="form-group">
            <label class="form-label">Username</label>
            <input type="text" class="form-input" [(ngModel)]="username" name="username" required />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" [(ngModel)]="password" name="password" required />
          </div>

          <div class="form-group">
            <label class="form-label">Role</label>
            <select class="form-input" [(ngModel)]="role" name="role">
              <option value="CASHIER">Cashier</option>
              <option value="MANAGER">Manager</option>
              <option value="KITCHEN">Kitchen Staff</option>
              <option value="SUPPORT">Support</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading">
            {{ loading ? 'Creating...' : 'Register' }}
          </button>
        </form>

        <div class="auth-footer">
          Already registered? <a routerLink="/login">Sign In</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-base); padding: 20px; }
    .login-card { width: 100%; max-width: 420px; padding: 36px; }
    .brand { text-align: center; margin-bottom: 24px; }
    .brand h2 { font-size: 22px; font-weight: 700; color: var(--text-primary); }
    .subtitle { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
    .btn-block { width: 100%; margin-top: 12px; padding: 12px; }
    .alert-danger { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; padding: 10px 14px; border-radius: var(--radius-md); font-size: 13px; margin-bottom: 16px; }
    .auth-footer { text-align: center; margin-top: 20px; font-size: 13px; color: var(--text-secondary); }
    .auth-footer a { color: var(--brand-primary); text-decoration: none; font-weight: 600; }
  `]
})
export class RegisterComponent {
  name = '';
  username = '';
  password = '';
  role = 'CASHIER';
  loading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.username || !this.password || !this.name) return;
    this.loading = true;

    this.authService.register({
      name: this.name,
      username: this.username,
      password: this.password,
      role: this.role,
      branch: 'Riyadh Main'
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/orders']);
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Registration failed';
      }
    });
  }
}
