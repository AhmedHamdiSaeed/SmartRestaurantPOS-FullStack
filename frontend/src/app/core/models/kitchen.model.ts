// ============================================================
// Global Models — Kitchen Domain
// ============================================================

export type KitchenStationStatus = 'normal' | 'busy' | 'overloaded' | 'offline';

export interface KitchenStation {
  id: string;
  name: string;
  type: 'grill' | 'fryer' | 'salad' | 'dessert' | 'drinks' | 'packaging';
  currentLoad: number;   // 0–100
  maxCapacity: number;
  activeOrders: number;
  avgPrepTime: number;   // minutes
  status: KitchenStationStatus;
  lastUpdated: Date;
}

export interface KitchenLoad {
  overallLoad: number;    // 0–100 weighted average
  stations: KitchenStation[];
  queueDepth: number;     // total pending items
  estimatedDelay: number; // minutes of delay from normal
  alertLevel: 'green' | 'yellow' | 'orange' | 'red';
  lastUpdated: Date;
}

export const KITCHEN_ALERT_THRESHOLDS = {
  yellow: 60,
  orange: 75,
  red:    90,
} as const;

export function getAlertLevel(load: number): KitchenLoad['alertLevel'] {
  if (load >= KITCHEN_ALERT_THRESHOLDS.red)    return 'red';
  if (load >= KITCHEN_ALERT_THRESHOLDS.orange) return 'orange';
  if (load >= KITCHEN_ALERT_THRESHOLDS.yellow) return 'yellow';
  return 'green';
}
