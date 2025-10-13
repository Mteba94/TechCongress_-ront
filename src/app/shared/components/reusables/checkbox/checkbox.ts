import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Check, LucideAngularModule, LucideCheck, Minus } from 'lucide-angular';

type CheckboxSize = 'sm' | 'default' | 'lg';

function cn(...classes: (string | boolean | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

@Component({
  selector: 'app-checkbox',
  imports: [
    LucideAngularModule,
    CommonModule,
  ],
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.css'
})
export class Checkbox {
  @Input() className: string = '';
  @Input() id: string | undefined;
  @Input() checked: boolean = false;
  @Input() indeterminate: boolean = false;
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() label: string | undefined;
  @Input() description: string | undefined;
  @Input() error: string | undefined;
  @Input() size: CheckboxSize = 'default';

  readonly icons = {
    check: Check,
    minus: Minus
  }


  // Propiedad interna para el ID
  public cn = cn;
  checkboxId: string = '';

  // Definición de las clases de tamaño (simulando sizeClasses de React)
  sizeClasses: Record<CheckboxSize, string> = {
    sm: 'h-4 w-4',
    default: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  ngOnInit() {
    // Generar ID único si no se proporciona (similar a la lógica de React)
    this.checkboxId = this.id || `checkbox-${Math.random().toString(36).substring(2, 11)}`;
  }

  // Función para construir dinámicamente las clases del 'peer label' (el cuadrado visual)
  get checkboxLabelClasses(): string {
    return cn(
      'peer shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground cursor-pointer transition-colors flex items-center justify-center', // Clases base y de utilidad para centrar íconos
      this.sizeClasses[this.size],
      (this.checked || this.indeterminate) && 'bg-primary text-primary-foreground border-primary',
      this.error && 'border-destructive',
      this.disabled && 'cursor-not-allowed opacity-50'
    );
  }

  // Función para construir dinámicamente las clases del label de texto
  get labelClasses(): string {
    return cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer',
      this.error ? 'text-destructive' : 'text-foreground'
    );
  }

  onInputChange(event: Event): void {
    // Hacemos el casting para acceder a la propiedad checked
    const inputElement = event.target as HTMLInputElement;
    
    // Actualizamos el estado. También podrías emitir un @Output() aquí.
    this.checked = inputElement.checked;
    this.indeterminate = false; // El estado indeterminado se pierde al hacer clic
  }
}
