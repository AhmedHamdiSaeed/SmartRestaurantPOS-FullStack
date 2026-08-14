// ============================================================
// AI Assistant Mock Service — Streaming simulation with retry
// ============================================================
import { Injectable } from '@angular/core';
import { Observable, throwError, timer, Subject, of } from 'rxjs';
import { switchMap, catchError, delay } from 'rxjs/operators';
import { AiSuggestion, AiSuggestionType, AiSeverity } from '../../../core/models/ai-suggestion.model';
import { Order } from '../../../core/models/order.model';

let suggestionIdCounter = 0;

// ---- Pre-written AI suggestion templates ----
interface SuggestionTemplate {
  type: AiSuggestionType;
  severity: AiSeverity;
  title: string;
  message: string;
  actionLabel?: string;
  confidence: number;
  condition: (order: Order, kitchenLoad: number) => boolean;
}

const SUGGESTION_TEMPLATES: SuggestionTemplate[] = [
  {
    type: 'upsell',
    severity: 'info',
    title: 'Upsell Opportunity',
    message: 'Customer has 2,450 loyalty points — suggest a premium dessert upgrade to reach Gold tier (2,500 pts). Chocolate Lava Cake pairs perfectly with their burger order.',
    actionLabel: 'Add Dessert',
    confidence: 0.87,
    condition: (o) => (o.customer.loyaltyPoints ?? 0) > 2000,
  },
  {
    type: 'allergy_warning',
    severity: 'critical',
    title: 'Allergen Alert Detected',
    message: 'Order contains items with GLUTEN and DAIRY allergens. Customer notes show a possible dietary restriction. Please confirm with customer before preparing.',
    actionLabel: 'Confirm with Customer',
    confidence: 0.95,
    condition: (o) => o.items.some(i => i.allergens && i.allergens.length > 0),
  },
  {
    type: 'kitchen_overload',
    severity: 'warning',
    title: 'Kitchen Delay Risk',
    message: 'Current kitchen load is at 82%. This order\'s estimated prep time may increase by 8–12 minutes. Consider informing the customer proactively.',
    actionLabel: 'Notify Customer',
    confidence: 0.78,
    condition: (_, load) => load > 75,
  },
  {
    type: 'delivery_risk',
    severity: 'warning',
    title: 'Delivery Risk Flagged',
    message: 'Delivery address is outside the 5km priority zone. Estimated delivery time: 35–45 minutes. Driver availability is currently limited in that area.',
    actionLabel: 'Find Nearby Driver',
    confidence: 0.72,
    condition: (o) => o.channel === 'delivery',
  },
  {
    type: 'missing_info',
    severity: 'info',
    title: 'Incomplete Order Details',
    message: 'Walk-in order is missing table number. Please assign a table to help kitchen staff prioritize and deliver correctly.',
    actionLabel: 'Assign Table',
    confidence: 0.99,
    condition: (o) => o.channel === 'walkin' && !o.tableNumber,
  },
  {
    type: 'upsell',
    severity: 'success',
    title: 'Bundle Recommendation',
    message: 'Customer ordered a burger without a drink. Adding a Mango Smoothie (SAR 4.49) would complete the meal and increase order value by 18%.',
    actionLabel: 'Add to Order',
    confidence: 0.82,
    condition: (o) => o.items.some(i => i.category === 'burgers') && !o.items.some(i => i.category === 'drinks'),
  },
  {
    type: 'loyalty_reward',
    severity: 'success',
    title: '⭐ Loyalty Reward Eligible',
    message: 'This customer has reached 5,000 points! They qualify for a free dessert on this order. Applying the reward will increase customer satisfaction score.',
    actionLabel: 'Apply Reward',
    confidence: 0.98,
    condition: (o) => (o.customer.loyaltyPoints ?? 0) >= 5000,
  },
  {
    type: 'substitution',
    severity: 'info',
    title: 'Ingredient Substitution Available',
    message: 'Avocado supply is low (3 units remaining). If the customer ordered items with avocado, consider pre-informing about a possible substitution with guacamole.',
    actionLabel: 'Check Inventory',
    confidence: 0.65,
    condition: () => Math.random() > 0.7,
  },
];

export interface StreamingChunk {
  orderId: string;
  suggestionId: string;
  chunk: string;
  isFinal: boolean;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class AiAssistantMockService {
  /**
   * Returns an Observable of streaming chunks simulating token-by-token AI response.
   * Uses character-by-character chunking with 20–40ms intervals.
   * Can fail randomly to demonstrate retry behavior.
   */
  streamSuggestions(
    order: Order,
    kitchenLoad: number
  ): Observable<AiSuggestion[]> {
    // Select applicable suggestions
    const applicable = SUGGESTION_TEMPLATES.filter(t => t.condition(order, kitchenLoad));
    const selected = applicable.length > 0
      ? applicable.slice(0, Math.min(3, applicable.length))
      : [SUGGESTION_TEMPLATES[0]]; // fallback

    // Build full suggestions
    const suggestions: AiSuggestion[] = selected.map(template => ({
      id: `ai_${++suggestionIdCounter}`,
      orderId: order.id,
      type: template.type,
      severity: template.severity,
      title: template.title,
      message: template.message,
      streamedMessage: '',
      actionLabel: template.actionLabel,
      generatedAt: new Date(),
      confidence: template.confidence,
    }));

    // Simulate a 10% failure rate
    if (Math.random() < 0.1) {
      return throwError(() => new Error('AI service temporarily unavailable'));
    }

    return of(suggestions).pipe(delay(800 + Math.random() * 1200));
  }

  /**
   * Simulates character-by-character streaming for a single suggestion.
   */
  streamMessage(
    orderId: string,
    suggestionId: string,
    fullMessage: string
  ): Observable<StreamingChunk> {
    return new Observable<StreamingChunk>(observer => {
      let index = 0;
      const chunkSize = () => Math.floor(Math.random() * 4) + 1; // 1–4 chars per tick

      const intervalId = setInterval(() => {
        const size = chunkSize();
        const chunk = fullMessage.slice(index, index + size);
        index += size;

        observer.next({
          orderId,
          suggestionId,
          chunk,
          isFinal: index >= fullMessage.length,
        });

        if (index >= fullMessage.length) {
          clearInterval(intervalId);
          observer.complete();
        }
      }, 25 + Math.random() * 20); // 25–45ms per chunk

      return () => clearInterval(intervalId);
    });
  }
}
