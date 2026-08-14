import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { Toast } from '../../../core/models/app.model';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast.component.html',
  styles: [`
    .toast-container {
      position: fixed;
      top: 80px;
      right: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: var(--z-toast);
      max-width: 360px;
      pointer-events: none;
    }
    .toast {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 14px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-normal);
      background: var(--bg-elevated);
      backdrop-filter: blur(12px);
      box-shadow: var(--shadow-lg);
      pointer-events: all;
      position: relative;
      overflow: hidden;
      min-width: 280px;
      animation: slideInRight 0.3s ease forwards;
    }
    .toast--success { border-color: rgba(52,211,153,0.4); }
    .toast--error   { border-color: rgba(248,113,113,0.4); }
    .toast--warning { border-color: rgba(251,191,36,0.4); }
    .toast--info    { border-color: rgba(96,165,250,0.4); }

    .toast__icon { font-size: 18px; flex-shrink: 0; }
    .toast__content { flex: 1; min-width: 0; }
    .toast__title {
      font-weight: 600;
      font-size: var(--text-sm);
      color: var(--text-primary);
      line-height: 1.3;
    }
    .toast__message {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      margin-top: 2px;
      line-height: 1.4;
    }
    .toast__close {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 2px 6px;
      font-size: 12px;
      border-radius: var(--radius-sm);
      line-height: 1;
      flex-shrink: 0;
      transition: color var(--transition-fast);
    }
    .toast__close:hover { color: var(--text-primary); }
    .toast__progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 2px;
      width: 100%;
      background: var(--brand-primary);
      transform-origin: left;
      animation: progress linear forwards;
    }
    @keyframes progress {
      from { transform: scaleX(1); }
      to   { transform: scaleX(0); }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(20px); }
      to   { opacity: 1; transform: translateX(0); }
    }
  `]
})
export class ToastComponent {
  private readonly notificationService = inject(NotificationService);
  readonly toasts = computed(() => this.notificationService.toasts());

  toastIcon(type: Toast['type']): string {
    const icons: Record<Toast['type'], string> = {
      success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️',
    };
    return icons[type];
  }

  dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }
}
