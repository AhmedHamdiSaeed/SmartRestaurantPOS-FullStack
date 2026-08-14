// ============================================================
// Global Models — Product Domain
// ============================================================

export type ProductCategory =
  | 'burgers'
  | 'sandwiches'
  | 'pizza'
  | 'pasta'
  | 'salads'
  | 'sides'
  | 'desserts'
  | 'drinks'
  | 'combos'
  | 'breakfast';

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  sku: string;
  category: ProductCategory;
  price: number;
  description: string;
  imageUrl?: string;
  allergens: string[];
  calories?: number;
  isAvailable: boolean;
  isPopular: boolean;
  preparationTime: number;  // minutes
  tags: string[];
  rating?: number;
  salesCount: number;
}

export interface ProductSearchResult {
  product: Product;
  matchScore: number;
  matchedFields: string[];
  highlightedName: string;
}

export interface SearchState {
  query: string;
  category: ProductCategory | 'all';
  results: ProductSearchResult[];
  recentSearches: string[];
  isLoading: boolean;
  totalCount: number;
  activeIndex: number;   // keyboard nav
}

export const PRODUCT_CATEGORIES: { value: ProductCategory | 'all'; label: string; icon: string }[] = [
  { value: 'all',        label: 'All',       icon: '🍽️' },
  { value: 'burgers',    label: 'Burgers',   icon: '🍔' },
  { value: 'sandwiches', label: 'Sandwiches',icon: '🥪' },
  { value: 'pizza',      label: 'Pizza',     icon: '🍕' },
  { value: 'pasta',      label: 'Pasta',     icon: '🍝' },
  { value: 'salads',     label: 'Salads',    icon: '🥗' },
  { value: 'sides',      label: 'Sides',     icon: '🍟' },
  { value: 'desserts',   label: 'Desserts',  icon: '🍰' },
  { value: 'drinks',     label: 'Drinks',    icon: '🥤' },
  { value: 'combos',     label: 'Combos',    icon: '📦' },
  { value: 'breakfast',  label: 'Breakfast', icon: '🥞' },
];
