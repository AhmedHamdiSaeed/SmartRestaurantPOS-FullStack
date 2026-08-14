import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './empty-state.component.html',
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-3xl) var(--space-xl);
      text-align: center;
      gap: var(--space-sm);
    }
    .empty-state__icon {
      font-size: 48px;
      margin-bottom: var(--space-md);
      opacity: 0.6;
    }
    .empty-state__title {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text-primary);
    }
    .empty-state__desc {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      max-width: 280px;
      line-height: 1.6;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = '📭';
  @Input() title = 'Nothing here yet';
  @Input() description = '';
  @Input() actionLabel = '';
  @Output() actionClick = new EventEmitter<void>();
}
