import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryItem, ProductSearchResult } from '../../../../core/models/product.model';

@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-container">
      <div class="search-bar">
        <input type="text" class="form-input" [(ngModel)]="query" (ngModelChange)="onSearch()" placeholder="Search catalog by name, category, SKU, tags..." />
      </div>

      <div class="categories">
        @for (cat of categories; track cat.value) {
          <button class="cat-chip" [class.active]="selectedCat === cat.value" (click)="selectCategory(cat.value)">
            {{ cat.icon }} {{ cat.label }} ({{ cat.count }})
          </button>
        }
      </div>

      <div class="products-grid">
        @for (res of results; track res.product.id) {
          <div class="product-card card">
            <div class="card-head">
              <span class="cat-badge">{{ res.product.category }}</span>
              <span class="sku">{{ res.product.sku }}</span>
            </div>
            <h4 [innerHTML]="res.highlightedName"></h4>
            <p class="desc">{{ res.product.description }}</p>
            <div class="price-row">
              <span class="price">{{ res.product.price }} SAR</span>
              <span class="prep">⏱ {{ res.product.preparationTime }} min</span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .search-container { display: flex; flex-direction: column; gap: 20px; }
    .search-bar input { font-size: 16px; padding: 14px 18px; }
    .categories { display: flex; gap: 8px; flex-wrap: wrap; }
    .cat-chip { padding: 6px 14px; border-radius: 9999px; background: var(--bg-surface); border: 1px solid var(--border-normal); color: var(--text-secondary); cursor: pointer; font-size: 13px; }
    .cat-chip.active { background: var(--brand-primary); color: var(--text-inverse); }
    .products-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .card-head { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 8px; }
    .cat-badge { color: var(--brand-primary); font-weight: 600; text-transform: uppercase; }
    .sku { color: var(--text-muted); }
    .desc { font-size: 12px; color: var(--text-secondary); margin: 8px 0 14px; min-height: 36px; }
    .price-row { display: flex; justify-content: space-between; align-items: center; }
    .price { font-size: 16px; font-weight: 700; color: var(--text-primary); }
    .prep { font-size: 12px; color: var(--text-muted); }
  `]
})
export class ProductSearchComponent implements OnInit {
  query = '';
  selectedCat = 'all';
  categories: CategoryItem[] = [];
  results: ProductSearchResult[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.getCategories().subscribe(c => this.categories = c);
    this.onSearch();
  }

  onSearch() {
    this.productService.searchProducts(this.query, this.selectedCat).subscribe(res => this.results = res);
  }

  selectCategory(cat: string) {
    this.selectedCat = cat;
    this.onSearch();
  }
}
