// ============================================================
// OrderCard Component Tests
// ============================================================
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { OrderCardComponent } from './order-card.component';
import { Order, OrderStatus } from '../../../../core/models/order.model';

const mockOrder: Order = {
  id: 'card_test_1',
  orderNumber: 'XYZ789',
  channel: 'walkin',
  status: 'received',
  priority: 'normal',
  items: [
    { id: 'i1', name: 'Classic Burger', quantity: 2, price: 9.99, category: 'burgers', allergens: ['gluten'] },
    { id: 'i2', name: 'Fries',          quantity: 1, price: 3.99, category: 'sides',   allergens: [] },
    { id: 'i3', name: 'Cola',           quantity: 1, price: 1.99, category: 'drinks',  allergens: [] },
  ],
  customer: { name: 'Alice Smith', loyaltyPoints: 200 },
  tableNumber: 7,
  subtotal: 25.96,
  tax: 3.89,
  total: 29.85,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDelayed: false,
};

describe('OrderCardComponent', () => {
  let component: OrderCardComponent;
  let fixture: ComponentFixture<OrderCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderCardComponent);
    component = fixture.componentInstance;
    component.order = { ...mockOrder };
    component.isSelected = false;
    fixture.detectChanges();
  });

  // ---- Rendering ----

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the order number', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('XYZ789');
  });

  it('should display the customer name', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Alice Smith');
  });

  it('should display the table number', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Table 7');
  });

  it('should display the total price', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('29.85');
  });

  // ---- Item display ----

  it('should show at most 2 items directly', () => {
    expect(component.displayItems.length).toBe(2);
  });

  it('should show hidden count when > 2 items', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('+1 more');
  });

  it('should show no hidden count when ≤ 2 items', () => {
    fixture.componentRef.setInput('order', { ...mockOrder, items: [mockOrder.items[0], mockOrder.items[1]] });
    fixture.detectChanges();
    expect(component.hiddenCount).toBe(0);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('more');
  });

  // ---- Priority bar ----

  it('priorityBarStyle should be transparent for normal priority', () => {
    expect(component.priorityBarStyle['background']).toBe('transparent');
  });

  it('priorityBarStyle should use high color for high priority', () => {
    fixture.componentRef.setInput('order', { ...mockOrder, priority: 'high' });
    fixture.detectChanges();
    expect(component.priorityBarStyle['background']).toBe('var(--priority-high)');
  });

  it('priorityBarStyle should use critical color for critical priority', () => {
    fixture.componentRef.setInput('order', { ...mockOrder, priority: 'critical' });
    fixture.detectChanges();
    expect(component.priorityBarStyle['background']).toBe('var(--priority-critical)');
  });

  // ---- CSS state classes ----

  it('should add order-card--selected class when isSelected=true', () => {
    fixture.componentRef.setInput('isSelected', true);
    fixture.detectChanges();
    const article = fixture.debugElement.query(By.css('.order-card'));
    expect(article.nativeElement.classList).toContain('order-card--selected');
  });

  it('should NOT add order-card--selected class when isSelected=false', () => {
    fixture.componentRef.setInput('isSelected', false);
    fixture.detectChanges();
    const article = fixture.debugElement.query(By.css('.order-card'));
    expect(article.nativeElement.classList).not.toContain('order-card--selected');
  });

  it('should add order-card--delayed class when isDelayed=true', () => {
    fixture.componentRef.setInput('order', { ...mockOrder, isDelayed: true });
    fixture.detectChanges();
    const article = fixture.debugElement.query(By.css('.order-card'));
    expect(article.nativeElement.classList).toContain('order-card--delayed');
  });

  it('should add order-card--critical class for critical priority', () => {
    fixture.componentRef.setInput('order', { ...mockOrder, priority: 'critical' });
    fixture.detectChanges();
    const article = fixture.debugElement.query(By.css('.order-card'));
    expect(article.nativeElement.classList).toContain('order-card--critical');
  });

  // ---- Delay badge ----

  it('should show delay badge when order is delayed', () => {
    fixture.componentRef.setInput('order', { ...mockOrder, isDelayed: true });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('⏱️');
  });

  it('should NOT show delay badge when order is not delayed', () => {
    fixture.componentRef.setInput('order', { ...mockOrder, isDelayed: false });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('⏱️');
  });

  // ---- Status helpers ----

  it('isStepDone() should return true for status before current', () => {
    fixture.componentRef.setInput('order', { ...mockOrder, status: 'preparing' });
    expect(component.isStepDone('received')).toBe(true);
  });

  it('isStepDone() should return false for current status', () => {
    fixture.componentRef.setInput('order', { ...mockOrder, status: 'preparing' });
    expect(component.isStepDone('preparing')).toBe(false);
  });

  it('isStepDone() should return false for future status', () => {
    fixture.componentRef.setInput('order', { ...mockOrder, status: 'received' });
    expect(component.isStepDone('ready')).toBe(false);
  });

  // ---- nextStatus ----

  it('nextStatus should be "preparing" when status is "received"', () => {
    fixture.componentRef.setInput('order', { ...mockOrder, status: 'received' });
    expect(component.nextStatus).toBe('preparing');
  });

  it('nextStatus should be null when status is "completed"', () => {
    fixture.componentRef.setInput('order', { ...mockOrder, status: 'completed' });
    expect(component.nextStatus).toBeNull();
  });

  // ---- Output events ----

  it('should emit select when card is clicked', () => {
    const spy = jest.spyOn(component.select, 'emit');
    const article = fixture.debugElement.query(By.css('.order-card'));
    article.triggerEventHandler('click', null);
    expect(spy).toHaveBeenCalledWith(component.order);
  });

  it('should emit advanceStatus when advance button is clicked', () => {
    // Status 'received' → next is 'preparing', so advance button should exist
    const spy = jest.spyOn(component.advanceStatus, 'emit');
    const btn = fixture.debugElement.query(By.css(`#advance-order-${mockOrder.id}`));
    expect(btn).toBeTruthy();
    btn.triggerEventHandler('click', { stopPropagation: jest.fn() });
    expect(spy).toHaveBeenCalledWith({ order: component.order, newStatus: 'preparing' });
  });

  it('should emit viewDetails when "View" button is clicked', () => {
    const spy = jest.spyOn(component.viewDetails, 'emit');
    const btn = fixture.debugElement.query(By.css(`#details-order-${mockOrder.id}`));
    expect(btn).toBeTruthy();
    btn.triggerEventHandler('click', { stopPropagation: jest.fn() });
    expect(spy).toHaveBeenCalledWith(component.order);
  });

  it('should NOT show advance button when status is "completed"', () => {
    component.order = { ...mockOrder, id: 'completed_order', status: 'completed' };
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css(`#advance-order-completed_order`));
    expect(btn).toBeNull();
  });

  // ---- Channel helpers ----

  it('channelLabel should return "Walk-in" for walkin', () => {
    expect(component.channelLabel).toBe('Walk-in');
  });

  it('channelIcon should return "🪑" for walkin', () => {
    expect(component.channelIcon).toBe('🪑');
  });

  it('channelIcon should return "🛵" for delivery', () => {
    component.order = { ...mockOrder, channel: 'delivery' };
    expect(component.channelIcon).toBe('🛵');
  });

  it('channelIcon should return "📱" for online', () => {
    component.order = { ...mockOrder, channel: 'online' };
    expect(component.channelIcon).toBe('📱');
  });

  // ---- Keyboard accessibility ----

  it('should emit select on Enter key', () => {
    const spy = jest.spyOn(component.select, 'emit');
    const article = fixture.debugElement.query(By.css('.order-card'));
    article.triggerEventHandler('keydown.enter', null);
    expect(spy).toHaveBeenCalled();
  });

  it('should emit select on Space key', () => {
    const spy = jest.spyOn(component.select, 'emit');
    const article = fixture.debugElement.query(By.css('.order-card'));
    article.triggerEventHandler('keydown.space', null);
    expect(spy).toHaveBeenCalled();
  });
});
