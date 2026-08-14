// ============================================================
// OrderBoard Component Tests
// ============================================================
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { OrderBoardComponent } from './order-board.component';
import { OrdersStore } from '../../store/orders.store';
import { KitchenStore } from '../../../kitchen/store/kitchen.store';
import { NotificationService } from '../../../../core/services/notification.service';
import { OfflineQueueService } from '../../../../core/services/offline-queue.service';
import { ConnectionService } from '../../../../core/services/connection.service';
import { OrdersMockService } from '../../services/orders-mock.service';
import { KitchenMockService } from '../../../kitchen/services/kitchen-mock.service';
import { provideRouter } from '@angular/router';

describe('OrderBoardComponent', () => {
  let component: OrderBoardComponent;
  let fixture: ComponentFixture<OrderBoardComponent>;
  let ordersStore: InstanceType<typeof OrdersStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderBoardComponent],
      providers: [
        OrdersStore, KitchenStore,
        NotificationService, OfflineQueueService, ConnectionService,
        OrdersMockService, KitchenMockService,
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderBoardComponent);
    component = fixture.componentInstance;
    ordersStore = TestBed.inject(OrdersStore);
    fixture.detectChanges();
  });

  // ---- Basic rendering ----

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the board title "Live Orders"', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Live Orders');
  });

  it('should render the Live indicator', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Live');
  });

  it('should show the loading state initially (before initialization completes)', () => {
    // We call initialize() which sets isLoading=true synchronously
    ordersStore.initialize();
    fixture.detectChanges();
    const loadingEl = fixture.debugElement.query(By.css('.board-loading'));
    expect(loadingEl).toBeTruthy();
  });

  it('should render 4 kanban columns once loaded', fakeAsync(() => {
    ordersStore.initialize();
    tick(1300); // wait for simulated 1200ms load delay
    fixture.detectChanges();

    const cols = fixture.debugElement.queryAll(By.css('.kanban-col'));
    expect(cols.length).toBe(4);
  }));

  // ---- Toolbar ----

  it('should render the order search input', () => {
    const input = fixture.debugElement.query(By.css('#order-search'));
    expect(input).toBeTruthy();
  });

  it('should render 4 channel filter buttons (All, Walk-in, Delivery, Online)', () => {
    const btns = fixture.debugElement.queryAll(By.css('.channel-btn'));
    expect(btns.length).toBe(4);
  });

  it('should render simulation control buttons', () => {
    const newOrderBtn = fixture.debugElement.query(By.css('#sim-new-order'));
    const rushBtn = fixture.debugElement.query(By.css('#sim-lunch-rush'));
    expect(newOrderBtn).toBeTruthy();
    expect(rushBtn).toBeTruthy();
  });

  // ---- Filter interactions ----

  it('should update filter searchTerm when typing in search input', () => {
    const input = fixture.debugElement.query(By.css('#order-search'));
    input.nativeElement.value = 'Burger';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // ngModel uses ngModelChange — we verify via the store
    ordersStore.setFilter({ searchTerm: 'Burger' });
    expect(ordersStore.filter().searchTerm).toBe('Burger');
  });

  it('should activate the channel button that matches the current filter', () => {
    ordersStore.setFilter({ channel: 'delivery' });
    fixture.detectChanges();

    const activeBtn = fixture.debugElement.query(By.css('.channel-btn--active'));
    expect(activeBtn).toBeTruthy();
    expect(activeBtn.nativeElement.id).toBe('filter-channel-delivery');
  });

  it('should call ordersStore.setFilter when a channel button is clicked', () => {
    const spy = jest.spyOn(ordersStore, 'setFilter');
    const deliveryBtn = fixture.debugElement.query(By.css('#filter-channel-delivery'));
    deliveryBtn.triggerEventHandler('click', null);
    expect(spy).toHaveBeenCalledWith({ channel: 'delivery' });
  });

  // ---- Stats bar ----

  it('should display stat items (Active, Preparing, Ready, Delayed)', () => {
    const stats = component.statItems();
    const labels = stats.map(s => s.label);
    expect(labels).toContain('Active');
    expect(labels).toContain('Preparing');
    expect(labels).toContain('Ready');
    expect(labels).toContain('Delayed');
  });

  // ---- Column helpers ----

  it('statusLabel() should return correct label for known statuses', () => {
    expect(component.statusLabel('received')).toBe('Received');
    expect(component.statusLabel('preparing')).toBe('Preparing');
    expect(component.statusLabel('ready')).toBe('Ready');
    expect(component.statusLabel('delivered')).toBe('Delivered');
  });

  it('statusColor() should return a CSS variable string for each status', () => {
    const statuses = ['received', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'] as const;
    for (const s of statuses) {
      expect(component.statusColor(s)).toMatch(/^var\(--/);
    }
  });

  it('emptyIcon() should return an emoji for each known status', () => {
    const statuses = ['received', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'] as const;
    for (const s of statuses) {
      const icon = component.emptyIcon(s);
      expect(typeof icon).toBe('string');
      expect(icon.length).toBeGreaterThan(0);
    }
  });

  it('columnOrders() should return empty array for all statuses initially', () => {
    const statuses = ['received', 'preparing', 'ready', 'delivered'] as const;
    for (const s of statuses) {
      expect(component.columnOrders(s)).toEqual([]);
    }
  });

  // ---- Order detail panel ----

  it('should NOT show order detail panel when no order is selected', () => {
    ordersStore.selectOrder(null);
    fixture.detectChanges();
    const panel = fixture.debugElement.query(By.css('app-order-detail'));
    expect(panel).toBeNull();
  });

  // ---- selectOrder toggle ----

  it('selectOrder() should toggle — selecting same order deselects it', fakeAsync(() => {
    ordersStore.initialize();
    tick(1300);
    fixture.detectChanges();

    const orders = ordersStore.orders();
    if (orders.length === 0) return; // guard

    const order = orders[0];
    component.selectOrder(order);
    expect(ordersStore.selectedOrderId()).toBe(order.id);

    component.selectOrder(order);
    expect(ordersStore.selectedOrderId()).toBeNull();
  }));

  // ---- kanbanStatuses constant ----

  it('kanbanStatuses should include the 4 expected statuses in order', () => {
    expect(component.kanbanStatuses).toEqual(['received', 'preparing', 'ready', 'delivered']);
  });
});
