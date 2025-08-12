import { CommonModule } from '@angular/common';
import { Component, Output, Input, EventEmitter } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-input',
  imports: [
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './input.html',
  styleUrl: './input.css'
})
export class InputComponent {
  @Input() className: string = '';
  @Input() type: string = 'text';
  @Input() label: string | null = null;
  @Input() description: string | null = null;
  @Input() error: string | null = null;
  @Input() required: boolean = false;
  @Input() id: string | null = null;
  @Input() placeholder: string = '';
  @Input() name: string = '';
  @Input() value: any;
  @Input() disabled: boolean = false;

  @Output() valueChange = new EventEmitter<any>();

  inputId: string;

  // ControlValueAccessor methods
  onChange: any = () => {};
  onTouch: any = () => {};

  constructor() {
    this.inputId = this.id || `input-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  ngOnInit(): void {
    if (this.id) {
      this.inputId = this.id;
    }
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
    this.onTouch();
    this.valueChange.emit(value);
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
