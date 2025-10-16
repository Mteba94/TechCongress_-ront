import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  message = signal<string | null>(null);
  type = signal<'success' | 'error'>('success');
  private timeoutId: any;

  show(message: string, type: 'success' | 'error' = 'success') {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.message.set(message);
    this.type.set(type);

    this.timeoutId = setTimeout(() => {
      this.clear();
      this.timeoutId = null;
    }, 3000);
  }

  clear() {
    this.message.set(null);
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
