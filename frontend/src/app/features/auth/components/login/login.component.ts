import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-xl);
      background:
        radial-gradient(ellipse at 20% 20%, rgba(245,158,11,0.12) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.08) 0%, transparent 50%),
        var(--bg-base);
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
      background: var(--bg-elevated);
      border: 1px solid var(--border-normal);
      border-radius: var(--radius-xl);
      padding: var(--space-2xl);
      box-shadow: var(--shadow-xl);
    }
    .auth-logo {
      text-align: center;
      margin-bottom: var(--space-xl);
    }
    .auth-logo__icon { font-size: 48px; }
    .auth-logo__title {
      font-size: var(--text-2xl);
      font-weight: 800;
      color: var(--brand-primary);
      margin-top: var(--space-sm);
    }
    .auth-logo__sub { color: var(--text-muted); font-size: var(--text-sm); }
    .form-group { margin-bottom: var(--space-lg); }
    .form-label {
      display: block;
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: var(--space-xs);
    }
    .form-input {
      width: 100%;
      padding: var(--space-md);
      background: var(--bg-surface);
      border: 1px solid var(--border-normal);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: var(--text-base);
    }
    .form-input:focus {
      outline: none;
      border-color: var(--brand-primary);
      box-shadow: 0 0 0 3px rgba(245,158,11,0.15);
    }
    .auth-btn {
      width: 100%;
      padding: var(--space-md);
      background: linear-gradient(135deg, var(--brand-primary), var(--brand-primary-dark));
      color: #0b0d14;
      font-weight: 700;
      font-size: var(--text-base);
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: transform var(--transition-fast), opacity var(--transition-fast);
    }
    .auth-btn:hover:not(:disabled) { transform: translateY(-1px); }
    .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .auth-error {
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.3);
      color: var(--text-danger);
      padding: var(--space-md);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-lg);
      font-size: var(--text-sm);
    }
    .auth-footer {
      text-align: center;
      margin-top: var(--space-xl);
      color: var(--text-muted);
      font-size: var(--text-sm);
    }
    .auth-footer a { color: var(--brand-primary); font-weight: 600; }
    .demo-hint {
      margin-top: var(--space-lg);
      padding: var(--space-md);
      background: var(--bg-surface);
      border-radius: var(--radius-md);
      font-size: var(--text-xs);
      color: var(--text-muted);
      line-height: 1.6;
    }
  `],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    username: ['admin', Validators.required],
    password: ['admin123', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Invalid username or password');
      },
    });
  }
}
