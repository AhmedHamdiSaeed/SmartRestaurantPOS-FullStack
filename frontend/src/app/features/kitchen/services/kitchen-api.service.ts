import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, of } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { KitchenLoad } from '../../../core/models/kitchen.model';
import { mapKitchenLoad } from '../../../core/utils/api-mapper.util';
import { KitchenMockService } from './kitchen-mock.service';

@Injectable({ providedIn: 'root' })
export class KitchenApiService {
  private readonly http = inject(HttpClient, { optional: true });
  private readonly mock = inject(KitchenMockService);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/kitchen`;

  getKitchenLoad(): Observable<KitchenLoad> {
    if (!this.http) {
      return of(this.mock.getInitialLoad());
    }
    return this.http.get<Record<string, unknown>>(`${this.baseUrl}/load`).pipe(
      map(dto => mapKitchenLoad(dto))
    );
  }

  /** Poll kitchen load every 5 seconds (matches backend schedule) */
  pollKitchenLoad(intervalMs = 5000): Observable<KitchenLoad> {
    return interval(intervalMs).pipe(
      startWith(0),
      switchMap(() => this.getKitchenLoad())
    );
  }
}
