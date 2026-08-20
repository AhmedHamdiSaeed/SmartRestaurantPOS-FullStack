import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../../core/services/order.service';
import { Order, OrderStatus } from '../../../../core/models/order.model';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-order-board',
  standalone: true,
  imports: [CommonModule, FormsModule, TimeAgoPipe, BadgeComponent],
  template: `
    <div class="board-container">
      <div class="filter-bar">
        <input type="text" class="form-input search-input" [(ngModel)]="searchTerm" (ngModelChange)="loadOrders()" placeholder="Search order # or customer..." />
        <div class="chips">
          @for (c of channels; track c) {
            <button class="chip" [class.active]="selectedChannel === c" (click)="setChannel(c)">{{ c | titlecase }}</button>
          }
        </div>
      </div>

      <div class="kanban-grid">
        @for (col of columns; track col.status) {
          <div class="column">
            <div class="column-header" [style.borderTopColor]="col.color">
              <h3>{{ col.label }}</h3>
              <span class="count">{{ getOrdersByStatus(col.status).length }}</span>
            </div>
            <div class="column-cards">
              @for (order of getOrdersByStatus(col.status); track order.id) {
                <div class="order-card card animate-fade-in" (click)="selectedOrder = order">
                  <div class="card-header">
                    <span class="order-num">#{{ order.orderNumber }}</span>
                    <app-badge [color]="getChannelColor(order.channel)">{{ order.channel }}</app-badge>
                  </div>
                  <div class="customer">{{ getCustomerDisplayName(order) }}</div>
                  <div class="card-footer">
                    <span class="items-count">{{ order.items.length || 0 }} items</span>
                    <span class="price">{{ order.total | currency:'SAR ':'symbol':'1.2-2' }}</span>
                  </div>
                  <div class="time">{{ order.createdAt | timeAgo }}</div>
                  <div class="actions" (click)="$event.stopPropagation()">
                    @if (col.nextStatus) {
                      <button class="btn btn-primary btn-sm" (click)="advanceStatus(order, col.nextStatus)">Move to {{ col.nextLabel }} →</button>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>

      @if (selectedOrder) {
        <div class="modal-backdrop" (click)="selectedOrder = null">
          <div class="modal card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Order Details - #{{ selectedOrder.orderNumber }}</h2>
              <button class="close-btn" (click)="selectedOrder = null">✕</button>
            </div>
            <div class="modal-body">
              <p><strong>Customer:</strong> {{ getCustomerDisplayName(selectedOrder) }}</p>
              <p><strong>Status:</strong> {{ selectedOrder.status }}</p>
              <p><strong>Channel:</strong> {{ selectedOrder.channel }}</p>
              <hr />
              <h4>Items:</h4>
              <ul>
                @for (item of selectedOrder.items; track item.name) {
                  <li>{{ item.quantity }}x {{ item.name }} - {{ item.price * item.quantity }} SAR</li>
                }
              </ul>
              <hr />
              <p class="total-row"><strong>Total:</strong> {{ selectedOrder.total }} SAR</p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .board-container { display: flex; flex-direction: column; gap: 20px; }
    .filter-bar { display: flex; gap: 16px; align-items: center; }
    .search-input { max-width: 300px; }
    .chips { display: flex; gap: 8px; }
    .chip { padding: 6px 14px; border-radius: 9999px; background: var(--bg-surface); border: 1px solid var(--border-normal); color: var(--text-secondary); cursor: pointer; font-size: 13px; }
    .chip.active { background: var(--brand-primary); color: var(--text-inverse); border-color: var(--brand-primary); }
    .kanban-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .column { background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px solid var(--border-normal); display: flex; flex-direction: column; }
    .column-header { padding: 14px 16px; border-top: 3px solid #3b82f6; display: flex; justify-content: space-between; align-items: center; }
    .column-header h3 { font-size: 14px; font-weight: 700; }
    .count { background: var(--bg-overlay); padding: 2px 8px; border-radius: 9999px; font-size: 12px; }
    .column-cards { padding: 12px; display: flex; flex-direction: column; gap: 12px; min-height: 500px; }
    .order-card { cursor: pointer; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .order-num { font-weight: 700; font-size: 14px; color: var(--brand-primary); }
    .customer { font-size: 13px; font-weight: 600; margin-bottom: 12px; }
    .card-footer { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-secondary); }
    .price { font-weight: 700; color: var(--text-primary); }
    .time { font-size: 11px; color: var(--text-muted); margin-top: 6px; }
    .actions { margin-top: 10px; }
    .btn-sm { padding: 6px 12px; font-size: 12px; width: 100%; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; }
    .modal { width: 450px; padding: 24px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .close-btn { background: none; border: none; color: var(--text-muted); font-size: 18px; cursor: pointer; }
    .total-row { font-size: 16px; font-weight: 700; color: var(--brand-primary); }
  `]
})
export class OrderBoardComponent implements OnInit {
  orders: Order[] = [];
  searchTerm = '';
  selectedChannel = 'all';
  channels = ['all', 'walkin', 'delivery', 'online'];
  selectedOrder: Order | null = null;

  columns = [
    { label: 'Received', status: 'RECEIVED', color: '#3b82f6', nextStatus: 'PREPARING', nextLabel: 'Preparing' },
    { label: 'Preparing', status: 'PREPARING', color: '#f59e0b', nextStatus: 'READY', nextLabel: 'Ready' },
    { label: 'Ready', status: 'READY', color: '#10b981', nextStatus: 'DELIVERED', nextLabel: 'Delivered' },
    { label: 'Delivered', status: 'DELIVERED', color: '#8b5cf6', nextStatus: 'COMPLETED', nextLabel: 'Completed' }
  ];

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadOrders();
    // Auto-refresh orders every 10 seconds for real-time Kanban board updates
    setInterval(() => this.loadOrders(), 10000);
  }

  loadOrders() {
    this.orderService.getOrders({
      channel: this.selectedChannel,
      search: this.searchTerm
    }).subscribe({
      next: data => this.orders = data,
      error: err => console.error('Failed to load orders:', err)
    });
  }

  setChannel(ch: string) {
    this.selectedChannel = ch;
    this.loadOrders();
  }

  getOrdersByStatus(status: string) {
    if (!this.orders) return [];
    return this.orders.filter(o => o.status && o.status.toString().toUpperCase() === status.toUpperCase());
  }

  getCustomerDisplayName(order: any): string {
    if (!order) return 'Guest';
    return order.customerName || (order.customer && order.customer.name) || 'Guest';
  }

  getChannelColor(ch: string) {
    const channelUpper = ch ? ch.toString().toUpperCase() : '';
    if (channelUpper === 'WALKIN') return '#06b6d4';
    if (channelUpper === 'DELIVERY') return '#8b5cf6';
    return '#10b981';
  }

  advanceStatus(order: Order, nextStatus: string) {
    // Optimistic UI status transition
    order.status = nextStatus as OrderStatus;
    this.orderService.updateStatus(order.id, nextStatus).subscribe({
      next: () => this.loadOrders(),
      error: (err) => {
        console.error('Failed to update order status:', err);
        this.loadOrders();
      }
    });
  }
}
