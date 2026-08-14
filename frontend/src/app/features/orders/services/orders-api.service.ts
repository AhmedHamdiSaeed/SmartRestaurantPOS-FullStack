import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable, interval, of } from 'rxjs';
import { delay, switchMap, startWith, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Order, OrderPriority, OrderStatus } from '../../../core/models/order.model';
import { mapOrder, OrderResponseDto, toUpperEnum } from '../../../core/utils/api-mapper.util';
import { generateInitialOrders } from './orders-mock.service';

@Injectable({ providedIn: 'root' })
export class OrdersApiService {
  private readonly http = inject(HttpClient, { optional: true });
  private readonly baseUrl = `${environment.apiUrl}/api/v1/orders`;

  getOrders(params?: { channel?: string; status?: string; priority?: string; search?: string }): Observable<Order[]> {
    if (!this.http) return of(generateInitialOrders()).pipe(delay(300));
    return this.http.get<OrderResponseDto[]>(this.baseUrl, { params: params as Record<string, string> }).pipe(
      map(dtos => dtos.map(mapOrder))
    );
  }

  updateStatus(orderId: string, status: OrderStatus): Observable<Order> {
    if (!this.http) return EMPTY;
    return this.http.patch<OrderResponseDto>(`${this.baseUrl}/${orderId}/status`, {
      status: toUpperEnum(status),
    }).pipe(map(dto => mapOrder(dto)));
  }

  updatePriority(orderId: string, priority: OrderPriority): Observable<Order> {
    if (!this.http) return EMPTY;
    return this.http.patch<OrderResponseDto>(`${this.baseUrl}/${orderId}/priority`, {
      priority: toUpperEnum(priority),
    }).pipe(map(dto => mapOrder(dto)));
  }

  /** Poll orders every 8 seconds for live updates */
  pollOrders(intervalMs = 8000): Observable<Order[]> {
    return interval(intervalMs).pipe(
      startWith(0),
      switchMap(() => this.getOrders())
    );
  }
}
