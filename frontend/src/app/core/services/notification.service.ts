// ============================================================
// Notification Service — Signal-based Toast notifications
// ============================================================
import { Injectable, signal, computed } from '@angular/core';
import { Toast, NotificationType } from '../models/app.model';

let toastIdCounter = 0;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = computed(() => this._toasts());

  show(
    type: NotificationType,
    title: string,
    message?: string,
    duration = 4500
  ): Toast {
    const toast: Toast = {
      id: `toast_${++toastIdCounter}`,
      type,
      title,
      message,
      duration,
      timestamp: new Date(),
    };

    this._toasts.update(t => [...t, toast]);

    if (duration && duration > 0) {
      setTimeout(() => this.dismiss(toast.id), duration);
    }

    return toast;
  }

  success(title: string, message?: string): Toast {
    return this.show('success', title, message);
  }

  error(title: string, message?: string, persistent = false): Toast {
    return this.show('error', title, message, persistent ? 0 : 6000);
  }

  warning(title: string, message?: string): Toast {
    return this.show('warning', title, message, 5000);
  }

  info(title: string, message?: string): Toast {
    return this.show('info', title, message);
  }

  dismiss(id: string): void {
    this._toasts.update(t => t.filter(toast => toast.id !== id));
  }

  dismissAll(): void {
    this._toasts.set([]);
  }
}
