export type KitchenStationStatus = 'normal' | 'busy' | 'overloaded' | 'offline';

export interface KitchenStation {
  id: string;
  name: string;
  type: string;
  currentLoad: number;
  maxCapacity: number;
  activeOrders: number;
  avgPrepTime: number;
  status: KitchenStationStatus;
  lastUpdated: string | Date;
}

export interface KitchenLoad {
  overallLoad: number;
  stations: KitchenStation[];
  queueDepth: number;
  estimatedDelay: number;
  alertLevel: 'green' | 'yellow' | 'orange' | 'red';
  lastUpdated: string | Date;
}
