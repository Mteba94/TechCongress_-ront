import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  message = signal<string | null>(null);
  type = signal<'success' | 'error'>('success');

  show(message: string, type: 'success' | 'error' = 'success') {
    this.message.set(message);
    this.type.set(type);
    setTimeout(() => this.clear(), 3000);
  }

  clear() {
    this.message.set(null);
  }
}
