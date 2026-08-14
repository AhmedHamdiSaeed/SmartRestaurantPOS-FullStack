// ============================================================
// OrderDetail Component Tests
// ============================================================
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SimpleChange } from '@angular/core';
import { OrderDetailComponent } from './order-detail.component';
import { AiAssistantStore } from '../../../ai-assistant/store/ai-assistant.store';
import { AiAssistantMockService } from '../../../ai-assistant/services/ai-assistant-mock.service';
import { KitchenStore } from '../../../kitchen/store/kitchen.store';
import { KitchenMockService } from '../../../kitchen/services/kitchen-mock.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { OrdersStore } from '../../store/orders.store';
import { OfflineQueueService } from '../../../../core/services/offline-queue.service';
import { ConnectionService } from '../../../../core/services/connection.service';
import { OrdersMockService } from '../../services/orders-mock.service';
import { Order, ORDER_STATUS_FLOW } from '../../../../core/models/order.model';

const makeOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'detail_test_1',
  orderNumber: 'DET001',
  channel: 'walkin',
  status: 'preparing',
  priority: 'high',
  items: [
    { id: 'i1', name: 'Chicken Wrap', quantity: 1, price: 12.99, category: 'wraps', allergens: ['gluten', 'dairy'] },
    { id: 'i2', name: 'Fries',        quantity: 1, price: 3.99,  category: 'sides', allergens: [] },
  ],
  customer: { name: 'Bob Jones', phone: '+966512345678', loyaltyPoints: 1500 },
  tableNumber: 3,
  deliveryAddress: undefined,
  subtotal: 16.98,
  tax: 2.55,
  total: 19.53,
  createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  updatedAt: new Date(),
  estimatedReadyTime: new Date(Date.now() + 10 * 60 * 1000),
  isDelayed: false,
  ...overrides,
});

describe('OrderDetailComponent', () => {
  let component: OrderDetailComponent;
  let fixture: ComponentFixture<OrderDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDetailComponent],
      providers: [
        AiAssistantStore, AiAssistantMockService,
        KitchenStore, KitchenMockService,
        OrdersStore, OrdersMockService,
        NotificationService, OfflineQueueService, ConnectionService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
    component.order = makeOrder();
    fixture.detectChanges();
  });

  // ---- Basic rendering ----

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display "Order Details" title', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Order Details');
  });

  it('should display the order number', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('DET001');
  });

  it('should render a close button', () => {
    const btn = fixture.debugElement.query(By.css('#close-order-detail'));
    expect(btn).toBeTruthy();
  });

  // ---- Status timeline ----

  it('statusSteps should equal ORDER_STATUS_FLOW', () => {
    expect(component.statusSteps).toEqual(ORDER_STATUS_FLOW);
  });

  it('isStepDone() should return true for steps before current status', () => {
    // Order status is 'preparing', so 'received' should be done
    expect(component.isStepDone('received')).toBe(true);
  });

  it('isStepDone() should return false for the current status', () => {
    expect(component.isStepDone('preparing')).toBe(false);
  });

  it('isStepDone() should return false for steps after current status', () => {
    expect(component.isStepDone('ready')).toBe(false);
    expect(component.isStepDone('delivered')).toBe(false);
  });

  it('should render the correct number of status steps', () => {
    const steps = fixture.debugElement.queryAll(By.css('.status-step'));
    expect(steps.length).toBe(ORDER_STATUS_FLOW.length);
  });

  it('should mark the current status step as active', () => {
    const activeStep = fixture.debugElement.query(By.css('.status-step--active'));
    expect(activeStep).toBeTruthy();
  });

  // ---- Advance button ----

  it('should show advance button when there is a next status', () => {
    // 'preparing' → 'ready'
    expect(component.nextStatus).toBe('ready');
    const btn = fixture.debugElement.query(By.css(`#advance-detail-${component.order.id}`));
    expect(btn).toBeTruthy();
  });

  it('advance button text should include the next status label', () => {
    const btn = fixture.debugElement.query(By.css(`#advance-detail-${component.order.id}`));
    expect(btn.nativeElement.textContent).toContain('Ready');
  });

  it('should NOT show advance button when status is "completed"', () => {
    fixture.componentRef.setInput('order', makeOrder({ id: 'comp_order', status: 'completed' }));
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css(`#advance-detail-comp_order`));
    expect(btn).toBeNull();
  });

  it('nextStatus should be null for "completed" status', () => {
    fixture.componentRef.setInput('order', makeOrder({ status: 'completed' }));
    expect(component.nextStatus).toBeNull();
  });

  // ---- Customer info ----

  it('should display the customer name', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Bob Jones');
  });

  it('should display a tel link for orders with a phone number', () => {
    const link = fixture.debugElement.query(By.css('a[href^="tel:"]'));
    expect(link).toBeTruthy();
    expect(link.nativeElement.getAttribute('href')).toBe('tel:+966512345678');
  });

  it('should display loyalty points', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('1,500');
  });

  it('should display table number', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Table 3');
  });

  // ---- Items section ----

  it('should show item count in section heading', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('(2)');
  });

  it('should show allergen tags for items with allergens', () => {
    const allergenTags = fixture.debugElement.queryAll(By.css('.allergen-tag'));
    expect(allergenTags.length).toBeGreaterThan(0);
    const texts = allergenTags.map(t => t.nativeElement.textContent);
    expect(texts.some(t => t.includes('gluten'))).toBe(true);
  });

  it('should display item prices', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('12.99');
    expect(el.textContent).toContain('3.99');
  });

  it('should display the order totals (subtotal, VAT, total)', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('16.98');
    expect(el.textContent).toContain('2.55');
    expect(el.textContent).toContain('19.53');
  });

  // ---- Delayed indicator ----

  it('should show DELAYED label when order is delayed', () => {
    fixture.componentRef.setInput('order', makeOrder({ isDelayed: true, estimatedReadyTime: new Date() }));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('DELAYED');
  });

  it('should NOT show DELAYED label when order is not delayed', () => {
    fixture.componentRef.setInput('order', makeOrder({ isDelayed: false }));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('DELAYED');
  });

  // ---- Channel label ----

  it('channelLabel should return "Walk-in" for walkin', () => {
    expect(component.channelLabel).toBe('Walk-in');
  });

  it('channelLabel should return "Delivery" for delivery channel', () => {
    fixture.componentRef.setInput('order', makeOrder({ channel: 'delivery' }));
    expect(component.channelLabel).toBe('Delivery');
  });

  // ---- Output events ----

  it('should emit close when close button is clicked', () => {
    const spy = jest.spyOn(component.close, 'emit');
    const btn = fixture.debugElement.query(By.css('#close-order-detail'));
    btn.triggerEventHandler('click', null);
    expect(spy).toHaveBeenCalled();
  });

  it('should emit statusChange when advance button is clicked', () => {
    const spy = jest.spyOn(component.statusChange, 'emit');
    const btn = fixture.debugElement.query(By.css(`#advance-detail-${component.order.id}`));
    btn.triggerEventHandler('click', null);
    expect(spy).toHaveBeenCalledWith({ order: component.order, newStatus: 'ready' });
  });

  // ---- AI panel presence ----

  it('should render the AI panel section', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('AI Recommendations');
  });

  // ---- statusLabel helper ----

  it('statusLabel() should return correct labels', () => {
    expect(component.statusLabel('received')).toBe('Received');
    expect(component.statusLabel('preparing')).toBe('Preparing');
    expect(component.statusLabel('ready')).toBe('Ready');
    expect(component.statusLabel('delivered')).toBe('Delivered');
    expect(component.statusLabel('completed')).toBe('Completed');
    expect(component.statusLabel('cancelled')).toBe('Cancelled');
  });
});
