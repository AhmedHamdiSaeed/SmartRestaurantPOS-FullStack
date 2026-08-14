// ============================================================
// Search Store Tests
// ============================================================
import { TestBed } from '@angular/core/testing';
import { SearchStore } from './search.store';

describe('SearchStore', () => {
  let store: InstanceType<typeof SearchStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SearchStore] });
    store = TestBed.inject(SearchStore);
  });

  it('should initialize with default state', () => {
    expect(store.query()).toBe('');
    expect(store.category()).toBe('all');
    expect(store.isLoading()).toBe(false);
    expect(store.activeIndex()).toBe(-1);
    expect(store.isOpen()).toBe(false);
  });

  it('should show results on initialization (default products)', () => {
    expect(store.results().length).toBeGreaterThan(0);
  });

  describe('Search Query', () => {
    it('should update query when search() is called', () => {
      store.search('burger');
      expect(store.query()).toBe('burger');
    });

    it('should open dropdown when search() is called', () => {
      store.search('pizza');
      expect(store.isOpen()).toBe(true);
    });

    it('should reset activeIndex on new search', done => {
      store.search('salad');
      setTimeout(() => {
        expect(store.activeIndex()).toBe(-1);
        done();
      }, 350); // after debounce
    });

    it('should return results matching query after debounce', done => {
      store.search('burger');
      setTimeout(() => {
        const results = store.results();
        expect(results.length).toBeGreaterThan(0);
        expect(results.some(r => r.product.name.toLowerCase().includes('burger'))).toBe(true);
        done();
      }, 400);
    });

    it('should return empty results for nonsense query after debounce', done => {
      store.search('xyznonexistentproduct12345');
      setTimeout(() => {
        expect(store.results().length).toBe(0);
        done();
      }, 400);
    });
  });

  describe('Category Filter', () => {
    it('should set category', () => {
      store.setCategory('pizza');
      expect(store.category()).toBe('pizza');
    });

    it('should filter results by category after debounce', done => {
      store.setCategory('drinks');
      setTimeout(() => {
        const results = store.results();
        results.forEach(r => expect(r.product.category).toBe('drinks'));
        done();
      }, 400);
    });

    it('should reset to all categories', () => {
      store.setCategory('pizza');
      store.setCategory('all');
      expect(store.category()).toBe('all');
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigateDown() should increment activeIndex', done => {
      store.search('burger');
      setTimeout(() => {
        store.navigateDown();
        expect(store.activeIndex()).toBe(0);
        done();
      }, 400);
    });

    it('navigateUp() should wrap to last item from -1', done => {
      store.search('burger');
      setTimeout(() => {
        const total = store.results().length;
        store.navigateUp();
        expect(store.activeIndex()).toBe(total - 1);
        done();
      }, 400);
    });

    it('navigateDown() should wrap around past the last item', done => {
      store.search('burger');
      setTimeout(() => {
        const total = store.results().length;
        // Navigate to last item
        for (let i = 0; i < total; i++) store.navigateDown();
        // One more wraps to 0
        store.navigateDown();
        expect(store.activeIndex()).toBe(0);
        done();
      }, 400);
    });

    it('reset() should clear query and activeIndex', () => {
      store.search('test');
      store.reset();
      expect(store.query()).toBe('');
      expect(store.activeIndex()).toBe(-1);
    });
  });

  describe('Dropdown State', () => {
    it('open() should set isOpen to true', () => {
      store.open();
      expect(store.isOpen()).toBe(true);
    });

    it('close() should set isOpen to false and reset activeIndex', () => {
      store.open();
      store.close();
      expect(store.isOpen()).toBe(false);
      expect(store.activeIndex()).toBe(-1);
    });
  });

  describe('Recent Searches', () => {
    it('removeRecentSearch() should remove a specific entry', () => {
      // Directly set via localStorage mock
      localStorage.setItem('sahm_pos_recent_searches', JSON.stringify(['burger', 'pizza']));
      // Re-create store to pick up localStorage
      const freshStore = TestBed.inject(SearchStore);
      freshStore.removeRecentSearch('burger');
      expect(freshStore.recentSearches()).not.toContain('burger');
    });

    it('clearRecentSearches() should empty the list', () => {
      store.clearRecentSearches();
      expect(store.recentSearches()).toEqual([]);
    });
  });

  describe('Computed Values', () => {
    it('isQueryEmpty() should be true for empty string', () => {
      expect(store.isQueryEmpty()).toBe(true);
    });

    it('isQueryEmpty() should be false when query set', () => {
      store.search('test');
      expect(store.isQueryEmpty()).toBe(false);
    });

    it('hasResults() should reflect result count', done => {
      store.search('burger');
      setTimeout(() => {
        expect(store.hasResults()).toBe(true);
        done();
      }, 400);
    });

    it('totalCount() should match results.length', () => {
      expect(store.totalCount()).toBe(store.results().length);
    });
  });
});
