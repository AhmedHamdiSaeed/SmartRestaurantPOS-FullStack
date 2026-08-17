import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KitchenService } from '../../../../core/services/kitchen.service';
import { KitchenLoad } from '../../../../core/models/kitchen.model';

@Component({
  selector: 'app-kitchen-monitor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kitchen-container">
      @if (loadData) {
        <div class="overview-card card">
          <div class="load-gauge">
            <span class="load-val">{{ loadData.overallLoad }}%</span>
            <span class="load-label">Kitchen Load</span>
          </div>
          <div class="stats">
            <div>Active Orders: <strong>{{ loadData.queueDepth }}</strong></div>
            <div>Estimated Delay: <strong>{{ loadData.estimatedDelay }} min</strong></div>
            <div>Status: <span class="badge-alert" [style.background]="getAlertColor(loadData.alertLevel)">{{ loadData.alertLevel | uppercase }}</span></div>
          </div>
        </div>

        <div class="stations-grid">
          @for (s of loadData.stations; track s.id) {
            <div class="station-card card">
              <div class="station-header">
                <h4>{{ s.name }}</h4>
                <span class="status-badge" [class.overloaded]="s.status === 'OVERLOADED'">{{ s.status }}</span>
              </div>
              <div class="progress-bar">
                <div class="fill" [style.width.%]="s.currentLoad" [style.background]="getLoadColor(s.currentLoad)"></div>
              </div>
              <div class="station-info">
                <span>Load: {{ s.currentLoad }}%</span>
                <span>Active: {{ s.activeOrders }}/{{ s.maxCapacity }}</span>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .kitchen-container { display: flex; flex-direction: column; gap: 24px; }
    .overview-card { display: flex; align-items: center; justify-content: space-around; padding: 24px; }
    .load-gauge { text-align: center; }
    .load-val { font-size: 42px; font-weight: 800; color: var(--brand-primary); display: block; }
    .load-label { font-size: 12px; color: var(--text-muted); }
    .stats { display: flex; flex-direction: column; gap: 8px; font-size: 14px; }
    .badge-alert { padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; color: #fff; }
    .stations-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .station-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .status-badge { font-size: 11px; padding: 2px 8px; border-radius: 4px; background: var(--bg-overlay); color: var(--text-secondary); }
    .status-badge.overloaded { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .progress-bar { height: 8px; background: var(--bg-elevated); border-radius: 4px; overflow: hidden; margin-bottom: 8px; }
    .fill { height: 100%; transition: width 0.3s ease; }
    .station-info { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); }
  `]
})
export class KitchenMonitorComponent implements OnInit {
  loadData: KitchenLoad | null = null;

  constructor(private kitchenService: KitchenService) {}

  ngOnInit() {
    this.refresh();
    setInterval(() => this.refresh(), 5000);
  }

  refresh() {
    this.kitchenService.getKitchenLoad().subscribe(data => this.loadData = data);
  }

  getAlertColor(level: string) {
    if (level === 'red') return '#ef4444';
    if (level === 'orange') return '#f97316';
    if (level === 'yellow') return '#f59e0b';
    return '#10b981';
  }

  getLoadColor(load: number) {
    if (load > 80) return '#ef4444';
    if (load > 60) return '#f59e0b';
    return '#10b981';
  }
}
