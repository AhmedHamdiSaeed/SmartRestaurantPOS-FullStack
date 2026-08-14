import {
  Component, inject, DestroyRef, OnInit,
  ChangeDetectionStrategy, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { KitchenStore } from '../../store/kitchen.store';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';
import { KitchenStation } from '../../../../core/models/kitchen.model';
import { KitchenMockService } from '../../services/kitchen-mock.service';

@Component({
  selector: 'app-kitchen-monitor',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './kitchen-monitor.component.html',
  styles: [`
    .kitchen-monitor {
      padding: var(--space-xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-xl);
      height: 100%;
      overflow-y: auto;
    }

    .monitor-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--space-md);
    }
    .monitor-title { font-size: var(--text-2xl); font-weight: 800; }
    .live-badge { display: flex; align-items: center; gap: 6px; }

    /* ---- Gauge ---- */
    .overall-load {
      display: flex;
      align-items: center;
      gap: var(--space-xl);
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      padding: var(--space-xl);
    }
    .overall-load__gauge { flex-shrink: 0; }
    .gauge-svg { width: 200px; height: 110px; }
    .overall-stats { display: flex; flex-direction: column; gap: var(--space-md); flex: 1; }
    .overall-stat { display: flex; flex-direction: column; }
    .overall-stat__val { font-size: var(--text-3xl); font-weight: 800; color: var(--text-primary); line-height: 1; }
    .overall-stat__label { font-size: var(--text-sm); color: var(--text-muted); margin-top: 2px; }

    /* ---- Sparkline ---- */
    .sparkline-container {
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: var(--space-md);
    }
    .sparkline { width: 100%; height: 40px; display: block; }
    .sparkline-labels { display: flex; justify-content: space-between; margin-top: 4px; }

    /* ---- Station grid ---- */
    .stations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--space-md);
    }
    .station-card {
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: var(--space-md);
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      transition: border-color var(--transition-normal);
    }
    .station-card--busy { border-color: rgba(249,115,22,0.35); }
    .station-card--overloaded {
      border-color: rgba(239,68,68,0.5);
      animation: stationPulse 2s infinite;
    }
    @keyframes stationPulse {
      0%, 100% { border-color: rgba(239,68,68,0.5); }
      50%       { border-color: rgba(239,68,68,0.9); }
    }
    .station-card__header { display: flex; align-items: center; gap: var(--space-sm); }
    .station-icon { font-size: 22px; flex-shrink: 0; }
    .station-card__name { font-size: var(--text-base); font-weight: 600; flex: 1; }
    .station-card__load { font-size: var(--text-base); font-weight: 700; }
    .station-bar {
      height: 6px;
      background: var(--bg-overlay);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    .station-bar__fill {
      height: 100%;
      border-radius: var(--radius-full);
      transition: width 0.8s ease, background 0.5s ease;
    }
    .station-card__meta {
      display: flex;
      justify-content: space-between;
      font-size: var(--text-sm);
      color: var(--text-muted);
    }
  `]
})
export class KitchenMonitorComponent implements OnInit {
  protected readonly kitchenStore = inject(KitchenStore);
  protected readonly kitchenService = inject(KitchenMockService);
  private readonly destroyRef = inject(DestroyRef);

  readonly sparklineWidth = 300;

  ngOnInit(): void {
    this.kitchenStore.initialize();
    this.kitchenStore.startStream(this.destroyRef);
  }

  alertLevelLabel(): string {
    const map = { green: 'Normal', yellow: 'Busy', orange: 'High Load', red: 'Overloaded' };
    return map[this.kitchenStore.alertLevel()] ?? 'Normal';
  }

  trendIcon(): string {
    const t = this.kitchenStore.loadTrend();
    return t === 'rising' ? '↑' : t === 'falling' ? '↓' : '→';
  }

  trendColor(): string {
    const t = this.kitchenStore.loadTrend();
    return t === 'rising' ? 'var(--text-danger)' : t === 'falling' ? 'var(--text-success)' : 'var(--text-secondary)';
  }

  historyLength(): number { return this.kitchenStore.history().length; }

  /** SVG arc dash for gauge (semicircle = ~251.2px circumference) */
  gaugeDash(): string {
    const total = 251.3; // π * 80
    const half = total / 2;
    const fill = (this.kitchenStore.overallLoad() / 100) * half;
    return `${fill} ${total}`;
  }

  needleX(): number {
    const angle = (this.kitchenStore.overallLoad() / 100) * Math.PI;
    return 100 + 65 * Math.cos(Math.PI - angle);
  }

  needleY(): number {
    const angle = (this.kitchenStore.overallLoad() / 100) * Math.PI;
    return 100 - 65 * Math.sin(Math.PI - angle);
  }

  sparklinePoints(): string {
    const history = this.kitchenStore.history();
    if (history.length < 2) return '';
    const w = this.sparklineWidth;
    const step = w / (history.length - 1);
    return history.map((h, i) => `${i * step},${40 - (h.load / 100) * 36}`).join(' ');
  }

  stationIcon(station: KitchenStation): string {
    const icons: Record<string, string> = {
      grill: '🥩', fryer: '🍟', salad: '🥗',
      dessert: '🍰', drinks: '🥤', packaging: '📦',
    };
    return icons[station.type] ?? '🍳';
  }

  stationColor(station: KitchenStation): string {
    if (station.currentLoad >= 90) return 'var(--load-critical)';
    if (station.currentLoad >= 75) return 'var(--load-high)';
    if (station.currentLoad >= 60) return 'var(--load-medium)';
    return 'var(--load-low)';
  }
}
