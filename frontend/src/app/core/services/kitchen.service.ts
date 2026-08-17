import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KitchenLoad, KitchenStation } from '../models/kitchen.model';

@Injectable({ providedIn: 'root' })
export class KitchenService {
  private apiUrl = '/api/v1/kitchen';

  constructor(private http: HttpClient) {}

  getKitchenLoad(): Observable<KitchenLoad> {
    return this.http.get<KitchenLoad>(`${this.apiUrl}/load`);
  }

  getStations(): Observable<KitchenStation[]> {
    return this.http.get<KitchenStation[]>(`${this.apiUrl}/stations`);
  }
}
