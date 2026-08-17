// ============================================================
// Search SignalStore — NgRx SignalStore
// ============================================================
import {
  signalStore,
  withState,
  withMethods,
  withComputed,
  patchState,
} from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { Product, ProductCategory, ProductSearchResult, SearchState } from '../../../core/models/product.model';
import { ProductApiService } from '../services/product-api.service';
import { MOCK_PRODUCTS } from '../data/mock-products.data';

const RECENT_SEARCHES_KEY = 'sahm_pos_recent_searches';
const MAX_RECENT = 10;
const DEBOUNCE_MS = 300;

function loadRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) ?? '[]');
  } catch { return []; }
}

function saveRecentSearches(searches: string[]): void {
  try { localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches)); } catch { /* */ }
}

/** Highlight matching text in a string */
function highlightMatch(text: string, query: string): string {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
}

/** Score a product against a query */
function scoreProduct(product: Product, query: string): ProductSearchResult | null {
  if (!query) return { product, matchScore: 1, matchedFields: [], highlightedName: product.name };

  const q = query.toLowerCase();
  const matchedFields: string[] = [];
  let score = 0;

  if (product.name.toLowerCase().includes(q)) {
    matchedFields.push('name');
    score += product.name.toLowerCase().startsWith(q) ? 10 : 5;
  }
  if (product.category.toLowerCase().includes(q)) {
    matchedFields.push('category');
    score += 3;
  }
  if (product.description.toLowerCase().includes(q)) {
    matchedFields.push('description');
    score += 2;
  }
  if (product.tags.some(t => t.toLowerCase().includes(q))) {
    matchedFields.push('tags');
    score += 2;
  }
  if (product.allergens.some(a => a.toLowerCase().includes(q))) {
    matchedFields.push('allergens');
    score += 1;
  }
  if (score === 0) return null;

  // Boost popular items
  if (product.isPopular) score += 2;

  return {
    product,
    matchScore: score,
    matchedFields,
    highlightedName: highlightMatch(product.name, query),
  };
}

function performSearch(query: string, category: ProductCategory | 'all'): ProductSearchResult[] {
  let products = MOCK_PRODUCTS;

  // Filter by category first (fast)
  if (category !== 'all') {
    products = products.filter(p => p.category === category);
  }

  // Only show available products in results unless searching specifically
  if (!query) {
    products = products.filter(p => p.isAvailable);
  }

  const results = products
    .map(p => scoreProduct(p, query))
    .filter((r): r is ProductSearchResult => r !== null)
    .sort((a, b) => b.matchScore - a.matchScore);

  return results;
}

// ---- State ----
interface SearchStoreState {
  query: string;
  category: ProductCategory | 'all';
  results: ProductSearchResult[];
  recentSearches: string[];
  isLoading: boolean;
  activeIndex: number;
  isOpen: boolean;
}

const initialState: SearchStoreState = {
  query: '',
  category: 'all',
  results: performSearch('', 'all').slice(0, 20),
  recentSearches: loadRecentSearches(),
  isLoading: false,
  activeIndex: -1,
  isOpen: false,
};

export const SearchStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed(({ results, query, activeIndex }) => ({
    totalCount: computed(() => results().length),
    hasResults: computed(() => results().length > 0),
    isQueryEmpty: computed(() => !query().trim()),
    activeResult: computed(() => {
      const idx = activeIndex();
      const r = results();
      return idx >= 0 && idx < r.length ? r[idx] : null;
    }),
  })),

  withMethods(store => {
    // Debounce search via Subject
    const searchSubject$ = new Subject<{ q: string; category: ProductCategory | 'all' }>();

    // Wire up debounced search pipeline
    searchSubject$.pipe(
      debounceTime(DEBOUNCE_MS),
      distinctUntilChanged((prev, curr) => prev.q === curr.q && prev.category === curr.category),
      switchMap(({ q, category }) => {
        patchState(store, { isLoading: true });
        // Simulate async search (in real app this would be an HTTP call)
        return new Promise<ProductSearchResult[]>(resolve =>
          setTimeout(() => resolve(performSearch(q, category)), 50)
        );
      })
    ).subscribe(results => {
      patchState(store, { results, isLoading: false, activeIndex: -1 });
    });

    return {
      search(query: string): void {
        patchState(store, { query, isOpen: true });
        searchSubject$.next({ q: query, category: store.category() });
      },

      setCategory(category: ProductCategory | 'all'): void {
        patchState(store, { category, activeIndex: -1 });
        searchSubject$.next({ q: store.query(), category });
      },

      open(): void { patchState(store, { isOpen: true }); },
      close(): void { patchState(store, { isOpen: false, activeIndex: -1 }); },

      /** Keyboard navigation — up/down arrow */
      navigateUp(): void {
        const max = store.results().length - 1;
        const cur = store.activeIndex();
        patchState(store, { activeIndex: cur <= 0 ? max : cur - 1 });
      },

      navigateDown(): void {
        const max = store.results().length - 1;
        const cur = store.activeIndex();
        patchState(store, { activeIndex: cur >= max ? 0 : cur + 1 });
      },

      selectActive(): Product | null {
        const active = store.activeResult();
        if (!active) return null;
        this.selectProduct(active.product);
        return active.product;
      },

      selectProduct(product: Product): void {
        const q = store.query().trim();
        if (q) {
          const recent = [q, ...store.recentSearches().filter(r => r !== q)].slice(0, MAX_RECENT);
          patchState(store, { recentSearches: recent });
          saveRecentSearches(recent);
        }
        patchState(store, { isOpen: false });
      },

      applyRecentSearch(query: string): void {
        patchState(store, { query });
        searchSubject$.next({ q: query, category: store.category() });
      },

      removeRecentSearch(query: string): void {
        const updated = store.recentSearches().filter(r => r !== query);
        patchState(store, { recentSearches: updated });
        saveRecentSearches(updated);
      },

      clearRecentSearches(): void {
        patchState(store, { recentSearches: [] });
        saveRecentSearches([]);
      },

      reset(): void {
        patchState(store, { query: '', activeIndex: -1, results: performSearch('', store.category()).slice(0, 20) });
      },
    };
  })
);
