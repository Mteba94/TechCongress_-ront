import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, TriangleAlert, X } from 'lucide-angular';
import { Button } from '../button/button';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, Button],
  templateUrl: './confirmation-modal.html',
  styleUrls: ['./confirmation-modal.css'],
})
export class ConfirmationModal {
  isOpen = input<boolean>(false);
  title = input<string>('Confirmar Acción');
  message = input<string>('¿Estás seguro de que deseas realizar esta acción?');

  confirm = output<void>();
  close = output<void>();

  readonly icons = {
    alert: TriangleAlert,
    x: X,
  };

  onConfirm(): void {
    this.confirm.emit();
  }

  onClose(): void {
    this.close.emit();
  }
}
