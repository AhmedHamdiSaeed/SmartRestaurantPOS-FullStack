import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ProductSearchResult } from '../../core/models/product.model';
import { mapProduct } from '../../core/utils/api-mapper.util';

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/products`;

  search(query: string, category?: string): Observable<ProductSearchResult[]> {
    const params: Record<string, string> = {};
    if (query) params['q'] = query;
    if (category && category !== 'all') params['category'] = category.toUpperCase();

    return this.http.get<{ product: Record<string, unknown>; matchScore: number; matchedFields: string[]; highlightedName: string }[]>(
      `${this.baseUrl}/search`,
      { params }
    ).pipe(
      map(results => results.map(r => ({
        product: mapProduct(r.product),
        matchScore: r.matchScore,
        matchedFields: r.matchedFields,
        highlightedName: r.highlightedName,
      })))
    );
  }
}
