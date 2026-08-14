import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AiSuggestion } from '../../core/models/ai-suggestion.model';
import { AuthService } from '../../core/services/auth.service';

@Injectable({ providedIn: 'root' })
export class AiApiService {
  private readonly auth = inject(AuthService);

  streamSuggestions(orderId: string): Observable<AiSuggestion[]> {
    return new Observable<AiSuggestion[]>(subscriber => {
      const token = this.auth.getToken();
      const url = `${environment.apiUrl}/api/v1/ai/suggestions/${orderId}`;
      const suggestions: AiSuggestion[] = [];

      fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).then(async response => {
        if (!response.ok) {
          subscriber.error(new Error(`AI service error: ${response.status}`));
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          subscriber.error(new Error('No response body'));
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() ?? '';

          for (const part of parts) {
            const dataLine = part.split('\n').find(l => l.startsWith('data:'));
            if (!dataLine) continue;

            try {
              const raw = JSON.parse(dataLine.slice(5).trim());
              const suggestion: AiSuggestion = {
                id: raw.id,
                orderId: raw.orderId,
                type: raw.type,
                severity: raw.severity,
                title: raw.title,
                message: raw.message,
                streamedMessage: raw.message,
                actionLabel: raw.actionLabel,
                confidence: raw.confidence,
                generatedAt: new Date(raw.generatedAt),
              };
              suggestions.push(suggestion);
              subscriber.next([...suggestions]);
            } catch {
              // skip malformed SSE chunks
            }
          }
        }

        subscriber.complete();
      }).catch(err => subscriber.error(err));
    });
  }
}
