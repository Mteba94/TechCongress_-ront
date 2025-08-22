import { CommonModule } from '@angular/common';
import { Home, LucideAngularModule } from 'lucide-angular';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  LogIn, UserPlus, ArrowDown,
  Loader2,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
  ArrowRight
} from 'lucide-angular';

@Component({
  selector: 'app-button',
  imports: [
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './button.html',
  styleUrl: './button.css'
})
export class Button {
  @Input() variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'warning' | 'danger' = 'default';
  @Input() size: 'xs' | 'sm' | 'default' | 'lg' | 'xl' | 'icon' = 'default';
  @Input() ariaLabel: string = '';
  @Input() loading: boolean = false;
  @Input() iconName: string | null = null;
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() iconSize: number | null = null;
  @Input() fullWidth: boolean = false;
  @Input() disabled: boolean = false;

  @Output() btnClick = new EventEmitter<void>();

  readonly icons = { 
    LogIn, 
    UserPlus, 
    ArrowDown, 
    Loader2, 
    ShieldCheck, 
    RefreshCw, 
    ArrowLeft,
    ArrowRight,
    Home
  };

  get children(): boolean {
    return this.btnClick.observers.length > 0;
  }

  onClick(): void {
    if (!this.disabled && !this.loading) {
      this.btnClick.emit();
    }
  }

  getIcon(): any {
    return this.icons[this.iconName as keyof typeof this.icons] || this.icons.LogIn;
  }

  getCalculatedIconSize(): number {
    const iconSizeMap: { [key: string]: number } = {
      xs: 12,
      sm: 14,
      default: 16,
      lg: 18,
      xl: 20,
      icon: 16,
    };
    return this.iconSize || iconSizeMap[this.size] || 16;
  }

  getButtonClasses(): string {
    const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variantClasses: { [key: string]: string } = {
      'default': 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary)]/[0.90]',
      'destructive': 'bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)] hover:bg-[var(--color-destructive)]/[0.90]',
      'outline': 'border border-[var(--color-input)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)]',
      'secondary': 'bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] hover:bg-[var(--color-secondary)]/[0.80]',
      'ghost': 'hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)]',
      'link': 'text-[var(--color-primary)] underline-offset-4 hover:underline',
      'success': 'bg-[var(--color-success)] text-[var(--color-success-foreground)] hover:bg-[var(--color-success)]/[0.90]',
      'warning': 'bg-[var(--color-warning)] text-[var(--color-warning-foreground)] hover:bg-[var(--color-warning)]/[0.90]',
      'danger': 'bg-[var(--color-error)] text-[var(--color-error-foreground)] hover:bg-[var(--color-error)]/[0.90]',
    };

    const sizeClasses: { [key: string]: string } = {
      'default': 'h-10 px-4 py-2',
      'sm': 'h-9 rounded-md px-3',
      'lg': 'h-11 rounded-md px-8',
      'icon': 'h-10 w-10',
      'xs': 'h-8 rounded-md px-2 text-xs',
      'xl': 'h-12 rounded-md px-10 text-base',
    };

    const cursorClass = 'cursor-pointer';

    const combinedClasses = `${baseClasses} ${variantClasses[this.variant]} ${sizeClasses[this.size]}`;
    return this.fullWidth ? `${combinedClasses} w-full` : combinedClasses;
  }
}
