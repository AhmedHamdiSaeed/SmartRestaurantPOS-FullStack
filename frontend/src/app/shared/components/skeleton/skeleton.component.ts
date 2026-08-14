import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './skeleton.component.html',
  styles: [`
    .skeleton-wrapper { display: flex; flex-direction: column; }
  `]
})
export class SkeletonComponent {
  @Input() count = 1;
  @Input() width = '100%';
  @Input() height = '16px';
  @Input() radius = 'var(--radius-sm)';
  @Input() gap = 'var(--space-sm)';

  get items(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}
