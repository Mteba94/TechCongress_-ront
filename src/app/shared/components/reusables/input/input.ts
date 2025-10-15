import { CommonModule } from '@angular/common';
import { Component, Output, Input, EventEmitter, forwardRef, OnChanges, SimpleChanges, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

const INPUT_FIELD_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => InputComponent),
  multi: true
};

@Component({
  selector: 'app-input',
  imports: [
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './input.html',
  styleUrl: './input.css',
  providers: [INPUT_FIELD_VALUE_ACCESSOR]
})
export class InputComponent implements OnChanges {
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
  @Input() leadingIcon: any;
  @Input() min: string | number | null = null;
  @Input() max: string | number | null = null;
  @Input() step: string | number | null = null;

  @Output() valueChange = new EventEmitter<any>();

  inputId: string;
  _leadingIcon = signal<any>(null);

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['leadingIcon']) {
      this._leadingIcon.set(this.leadingIcon);
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
