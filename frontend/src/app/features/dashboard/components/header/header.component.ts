import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="header-left">
        <h1 class="page-title">Live POS Operations</h1>
      </div>
      <div class="header-right">
        <div class="status-indicator">
          <span class="dot"></span> Microservices Gateway :8080
        </div>
        @if (user(); as u) {
          <div class="user-profile">
            <span class="avatar">{{ u.avatar || '👨‍🍳' }}</span>
            <div class="user-info">
              <span class="name">{{ u.name }}</span>
              <span class="role">{{ u.role }}</span>
            </div>
            <button class="btn btn-ghost btn-icon" (click)="logout()" title="Sign Out">🚪</button>
          </div>
        }
      </div>
    </header>
  `,
  styles: [`
    .header {
      height: var(--header-height);
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-normal);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .page-title { font-size: 18px; font-weight: 700; color: var(--text-primary); }
    .header-right { display: flex; align-items: center; gap: 20px; }
    .status-indicator { font-size: 12px; color: var(--text-secondary); display: flex; align-items: center; gap: 6px; background: var(--bg-elevated); padding: 4px 10px; border-radius: 9999px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block; box-shadow: 0 0 8px #10b981; }
    .user-profile { display: flex; align-items: center; gap: 10px; }
    .avatar { font-size: 20px; }
    .user-info { display: flex; flex-direction: column; }
    .name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .role { font-size: 11px; color: var(--brand-primary); text-transform: lowercase; }
    .btn-icon { padding: 6px 10px; font-size: 16px; }
  `]
})
export class HeaderComponent {
  user = this.authService.currentUser;
  constructor(private authService: AuthService) {}
  logout() { this.authService.logout(); }
}
