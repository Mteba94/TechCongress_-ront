import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CheckCircle, LucideAngularModule, LucideIconData, X, XCircle } from 'lucide-angular';

@Component({
  selector: 'app-notifications-alert',
  imports: [
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './notifications-alert.html',
  styleUrl: './notifications-alert.css'
})
export class NotificationsAlert {
  @Input() message: string | null = null;
  @Input() type: 'success' | 'error' = 'success';
  @Output() close = new EventEmitter<void>();

  X = X

  // Iconos dinámicos según el tipo
  get icon(): LucideIconData {
    return this.type === 'success' ? CheckCircle : XCircle;
  }

  get bgColor(): string {
    return this.type === 'success' ? 'bg-emerald-500' : 'bg-red-500';
  }
}
