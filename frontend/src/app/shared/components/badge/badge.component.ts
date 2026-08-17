import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngStyle]="badgeStyle">
      @if (showDot) { <span class="badge-dot"></span> }
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      line-height: 1;
    }
    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: currentColor;
    }
  `]
})
export class BadgeComponent {
  @Input() color = '#f59e0b';
  @Input() bg = 'rgba(245, 158, 11, 0.15)';
  @Input() showDot = true;

  get badgeStyle() {
    return {
      color: this.color,
      backgroundColor: this.bg,
      border: `1px solid ${this.color}33`
    };
  }
}
