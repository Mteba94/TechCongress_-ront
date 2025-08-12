import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Check, LucideAngularModule, Minus } from 'lucide-angular';

@Component({
  selector: 'app-check-point',
  imports: [
    LucideAngularModule,
    CommonModule
  ],
  templateUrl: './check-point-component.html',
  styleUrl: './check-point-component.css'
})
export class CheckPointComponent {
  @Input() className: string = '';
  @Input() id: string | null = null;
  @Input() checked: boolean | null = false;
  @Input() indeterminate: boolean = false;
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() label: string | null = null;
  @Input() description: string | null = null;
  @Input() error: string | null = null;
  @Input() size: 'sm' | 'default' | 'lg' = 'default';

  @Output() checkedChange = new EventEmitter<boolean>();

  checkboxId: string = '';
  readonly icons = { 
    check: Check,
    minus: Minus
   };
  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.checkboxId = this.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  }

  onModelChange(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.checked = isChecked;
    this.onChange(isChecked);
    this.onTouched();
    this.checkedChange.emit(isChecked);
  }

  writeValue(value: any): void {
    this.checked = !!value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
