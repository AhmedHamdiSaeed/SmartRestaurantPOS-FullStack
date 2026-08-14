import {
  Component, inject, HostListener,
  ChangeDetectionStrategy, ElementRef, ViewChild, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchStore } from '../../store/search.store';
import { OrdersStore } from '../../../orders/store/orders.store';
import { NotificationService } from '../../../../core/services/notification.service';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ProductSearchResult, PRODUCT_CATEGORIES, ProductCategory } from '../../../../core/models/product.model';

@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-search.component.html',
  styles: [`
    .search-workspace {
      padding: var(--space-xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-lg);
      height: 100%;
      overflow: hidden;
    }

    .search-header { flex-shrink: 0; }
    .search-title { font-size: var(--text-2xl); font-weight: 800; }

    /* ---- Search Input ---- */
    .search-input-area { display: flex; align-items: center; gap: var(--space-md); flex-shrink: 0; }
    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      flex: 1;
    }
    .search-input__icon {
      position: absolute;
      left: 14px;
      font-size: 14px;
      pointer-events: none;
      z-index: 1;
    }
    .search-input {
      padding-left: 42px;
      padding-right: 40px;
      font-size: var(--text-md);
      height: 48px;
      border-radius: var(--radius-lg);
    }
    .search-input-wrapper--open .search-input {
      border-color: var(--brand-primary);
      box-shadow: 0 0 0 3px rgba(245,158,11,0.15);
    }
    .search-clear, .search-loading {
      position: absolute;
      right: 12px;
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 12px;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color var(--transition-fast);
    }
    .search-clear:hover { color: var(--text-primary); }
    .search-keyboard-hints {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }
    kbd {
      display: inline-block;
      padding: 2px 6px;
      background: var(--bg-overlay);
      border: 1px solid var(--border-normal);
      border-radius: 4px;
      font-size: 10px;
      font-family: var(--font-mono);
      color: var(--text-secondary);
    }

    /* ---- Category Chips ---- */
    .category-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      flex-shrink: 0;
    }
    .category-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 9px 16px;
      border-radius: var(--radius-full);
      font-size: var(--text-sm);
      font-weight: 600;
      border: 1.5px solid var(--border-subtle);
      background: var(--bg-elevated);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
      white-space: nowrap;
      letter-spacing: 0.01em;
    }
    .category-chip .cat-icon { font-size: 18px; line-height: 1; }
    .category-chip:hover { border-color: var(--border-normal); color: var(--text-primary); transform: translateY(-1px); }
    .category-chip--active {
      background: rgba(245,158,11,0.15);
      color: var(--brand-primary);
      border-color: rgba(245,158,11,0.5);
      box-shadow: 0 0 0 3px rgba(245,158,11,0.1);
    }

    /* ---- Recent Searches ---- */
    .recent-searches {
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: var(--space-md);
      flex-shrink: 0;
    }
    .recent-list { display: flex; flex-wrap: wrap; gap: 6px; }
    .recent-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      background: var(--bg-overlay);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .recent-tag:hover { border-color: var(--border-normal); color: var(--text-primary); }
    .recent-remove {
      opacity: 0;
      font-size: 10px;
      color: var(--text-muted);
      transition: opacity var(--transition-fast);
      padding: 0 2px;
    }
    .recent-tag:hover .recent-remove { opacity: 1; }

    /* ---- Results ---- */
    .results-area { flex: 1; min-height: 0; overflow: hidden; }
    .results-loading {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      overflow: hidden;
    }
    .results-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      overflow-y: auto;
      height: 100%;
      padding-right: 4px;
    }
    .result-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-md);
      padding: var(--space-md) var(--space-lg);
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
      animation: fadeIn 0.2s ease;
    }
    .result-item:hover,
    .result-item--active {
      border-color: var(--border-normal);
      background: var(--bg-overlay);
    }
    .result-item--active {
      border-color: var(--brand-primary) !important;
      box-shadow: 0 0 0 2px rgba(245,158,11,0.15);
    }
    .result-item--unavailable { opacity: 0.6; }

    .result-item__main { display: flex; align-items: center; gap: var(--space-md); flex: 1; min-width: 0; }
    .result-item__category-icon { font-size: 30px; flex-shrink: 0; }
    .result-item__info { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
    .result-item__name {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .result-item__meta { display: flex; align-items: center; gap: var(--space-md); flex-wrap: wrap; }
    .result-item__category { font-size: var(--text-sm); color: var(--text-muted); text-transform: capitalize; }
    .result-item__popular { font-size: var(--text-sm); color: var(--brand-primary); }
    .result-item__unavailable { font-size: var(--text-sm); color: var(--text-danger); }
    .result-item__allergens { font-size: var(--text-sm); color: #fbbf24; }
    .result-item__tags { display: flex; gap: 4px; flex-wrap: wrap; }
    .result-tag {
      font-size: 10px;
      color: var(--text-muted);
      background: var(--bg-overlay);
      padding: 1px 5px;
      border-radius: var(--radius-full);
    }
    .result-item__right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
      flex-shrink: 0;
    }
    .result-item__price { font-size: var(--text-xl); font-weight: 700; color: var(--brand-primary); }
    .result-item__prep { font-size: var(--text-sm); color: var(--text-muted); }
    .result-item__rating { font-size: var(--text-sm); color: var(--text-secondary); }

    /* ---- Highlighted search match ---- */
    :host ::ng-deep mark {
      background: rgba(245,158,11,0.3);
      color: var(--brand-primary);
      font-weight: 700;
      border-radius: 2px;
      padding: 0 2px;
    }

    /* ---- Add toast ---- */
    .add-toast {
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%) translateY(80px);
      background: #16a34a;
      color: #fff;
      padding: 12px 24px;
      border-radius: var(--radius-lg);
      font-size: var(--text-md);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.25);
      z-index: 9999;
      transition: transform 0.35s cubic-bezier(.34,1.56,.64,1), opacity 0.35s;
      opacity: 0;
      pointer-events: none;
    }
    .add-toast--visible {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }

    /* ---- result add button feedback ---- */
    .result-item__add-btn {
      position: relative;
      overflow: hidden;
    }
    .result-item__add-btn.added {
      background: #16a34a !important;
      border-color: #16a34a !important;
    }
  `]
})
export class ProductSearchComponent {
  protected readonly searchStore = inject(SearchStore);
  protected readonly ordersStore = inject(OrdersStore);
  protected readonly notificationService = inject(NotificationService);
  readonly categories = PRODUCT_CATEGORIES;

  /** Name of the last product added — drives the toast notification */
  readonly lastAddedName = signal<string | null>(null);
  /** IDs of products currently showing the "added" button feedback */
  readonly addedIds = signal<Set<string>>(new Set());

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  @HostListener('document:keydown.escape')
  onEscapeKey(): void { this.searchStore.close(); }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchStore.search(value);
  }

  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.searchStore.navigateDown();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.searchStore.navigateUp();
        break;
      case 'Enter': {
        event.preventDefault();
        const active = this.searchStore.activeResult();
        if (active) {
          this._triggerAdd(active);
        } else {
          this.searchStore.selectActive();
        }
        break;
      }
      case 'Escape':
        this.searchStore.close();
        break;
    }
  }

  onBlur(): void {
    // Delay to allow click events on results
    setTimeout(() => this.searchStore.close(), 150);
  }

  setCategory(cat: ProductCategory | 'all'): void {
    this.searchStore.setCategory(cat);
    // Keep search open and refocus so keyboard nav still works
    setTimeout(() => this.searchInput?.nativeElement?.focus(), 0);
  }

  setActiveIndex(i: number): void {
    // Handled by mouseenter event
  }

  clearSearch(): void {
    this.searchStore.reset();
    this.searchInput?.nativeElement?.focus();
  }

  applyRecent(query: string): void {
    this.searchStore.applyRecentSearch(query);
    this.searchInput?.nativeElement?.focus();
  }

  removeRecent(query: string, event: Event): void {
    event.stopPropagation();
    this.searchStore.removeRecentSearch(query);
  }

  /** Row click — add the product and keep the list open for continued browsing */
  selectResult(result: ProductSearchResult): void {
    this._triggerAdd(result);
  }

  /** "Add" button click */
  addToOrder(result: ProductSearchResult, event: Event): void {
    event.stopPropagation();
    this._triggerAdd(result);
  }

  isAdded(productId: string): boolean {
    return this.addedIds().has(productId);
  }

  categoryIcon(cat: string): string {
    const found = PRODUCT_CATEGORIES.find(c => c.value === cat);
    return found?.icon ?? '🍽️';
  }

  // ---- private helpers ----

  private _triggerAdd(result: ProductSearchResult): void {
    const { product } = result;
    if (!product.isAvailable) return;

    let selectedOrderId = this.ordersStore.selectedOrderId();
    
    // Fallback: If no order is explicitly selected, auto-select an open one for a seamless UX
    if (!selectedOrderId) {
      const orders = this.ordersStore.orders();
      const openOrder = orders.find(o => o.status === 'received' || o.status === 'preparing') || orders[0];
      
      if (openOrder) {
        selectedOrderId = openOrder.id;
        this.ordersStore.selectOrder(selectedOrderId);
      } else {
        this.notificationService.warning('No Order Available', 'Please create an order before adding items.');
        return;
      }
    }

    // Add item to the order store
    this.ordersStore.addOrderItem(selectedOrderId, {
      name: product.name,
      price: product.price,
      quantity: 1,
      allergens: product.allergens,
      category: product.category
    });

    // Save to recent searches (store logic) without closing the panel
    const q = this.searchStore.query().trim();
    if (q) {
      // Call store's internal save-recent logic via selectProduct then re-open
      this.searchStore.selectProduct(product);
      this.searchStore.open();
    }

    // Button "added" animation
    const ids = new Set(this.addedIds());
    ids.add(product.id);
    this.addedIds.set(ids);
    setTimeout(() => {
      const current = new Set(this.addedIds());
      current.delete(product.id);
      this.addedIds.set(current);
    }, 1400);

    // Toast
    this.lastAddedName.set(product.name);
    setTimeout(() => this.lastAddedName.set(null), 2200);
  }
}
