import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = '/api/v1/orders';

  constructor(private http: HttpClient) {}

  getOrders(filters?: { channel?: string; status?: string; priority?: string; search?: string }): Observable<Order[]> {
    let params = new HttpParams();
    if (filters?.channel) params = params.set('channel', filters.channel);
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.priority) params = params.set('priority', filters.priority);
    if (filters?.search) params = params.set('search', filters.search);
    return this.http.get<Order[]>(this.apiUrl, { params });
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  createOrder(orderData: any): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, orderData);
  }

  updateStatus(id: string, status: string, reason?: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, { status, reason });
  }

  updatePriority(id: string, priority: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/priority`, { priority });
  }
}
