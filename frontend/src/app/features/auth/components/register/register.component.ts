import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { UserRole } from '../../../../core/models/app.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register.component.html',
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-xl);
      background:
        radial-gradient(ellipse at 20% 20%, rgba(245,158,11,0.12) 0%, transparent 50%),
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
    .auth-logo { text-align: center; margin-bottom: var(--space-xl); }
    .auth-logo__icon { font-size: 48px; }
    .auth-logo__title { font-size: var(--text-2xl); font-weight: 800; color: var(--brand-primary); margin-top: var(--space-sm); }
    .auth-logo__sub { color: var(--text-muted); font-size: var(--text-sm); }
    .form-group { margin-bottom: var(--space-md); }
    .form-label { display: block; font-size: var(--text-sm); font-weight: 600; color: var(--text-secondary); margin-bottom: var(--space-xs); }
    .form-input, .form-select {
      width: 100%;
      padding: var(--space-md);
      background: var(--bg-surface);
      border: 1px solid var(--border-normal);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: var(--text-base);
    }
    .auth-btn {
      width: 100%;
      padding: var(--space-md);
      margin-top: var(--space-md);
      background: linear-gradient(135deg, var(--brand-primary), var(--brand-primary-dark));
      color: #0b0d14;
      font-weight: 700;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
    }
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
    .auth-footer { text-align: center; margin-top: var(--space-xl); color: var(--text-muted); font-size: var(--text-sm); }
    .auth-footer a { color: var(--brand-primary); font-weight: 600; }
  `],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly roles: { value: UserRole; label: string }[] = [
    { value: 'cashier', label: 'Cashier' },
    { value: 'manager', label: 'Manager' },
    { value: 'kitchen', label: 'Kitchen Staff' },
    { value: 'support', label: 'Support' },
  ];

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    name: ['', Validators.required],
    role: ['cashier' as UserRole, Validators.required],
    branch: ['Riyadh Main', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { username, password, name, role, branch } = this.form.getRawValue();

    this.auth.register({ username, password, name, role: role.toUpperCase(), branch }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Registration failed');
      },
    });
  }
}
