export type ProductCategory = 'burgers' | 'sandwiches' | 'pizza' | 'pasta' | 'salads' | 'sides' | 'desserts' | 'drinks' | 'combos' | 'breakfast';

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
  preparationTime: number;
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

export interface CategoryItem {
  value: string;
  label: string;
  icon: string;
  count: number;
}
