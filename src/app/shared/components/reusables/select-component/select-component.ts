import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { Check, ChevronDown, LucideAngularModule, Search, X } from 'lucide-angular';
import { Button } from '../button/button';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../input/input';

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
  description?: string;
}

@Component({
  selector: 'app-select',
  imports: [
    LucideAngularModule,
    CommonModule,
    Button,
    ReactiveFormsModule,
    InputComponent,
    FormsModule
  ],
  templateUrl: './select-component.html',
  styleUrl: './select-component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent {
  @Input() className: string = '';
  @Input() options: SelectOption[] = [];
  @Input() placeholder: string = 'Selecciona una opción';
  @Input() multiple: boolean = false;
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() label: string | null = null;
  @Input() description: string | null = null;
  @Input() error: string | null = null;
  @Input() searchable: boolean = false;
  @Input() clearable: boolean = false;
  @Input() loading: boolean = false;
  @Input() id: string | null = null;
  @Input() name: string | null = null;

  _value: any; 

  @Input()
  set value(val: any) {
    if (val !== this._value) {
      this._value = val;
      this.onChange(val);
    }
  }

  get value(): any {
    return this._value;
  }

  // === EVENTOS (outputs de React) ===
  @Output() onOpenChange = new EventEmitter<boolean>();
  @Output() valueChange = new EventEmitter<any>();

  // === ESTADO INTERNO (useState de React) ===
  isOpen = false;
  searchTerm = '';
  selectId: string = '';

  // Propiedades para implementar ControlValueAccessor
  // private _value: any; // This is now handled by the @Input() setter
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  // Íconos de Lucide
  readonly icons = { 
    check: Check,
    chevronDown: ChevronDown,
    search: Search,
    x: X
   };

  get filteredOptions(): SelectOption[] {
    if (!this.searchable || !this.searchTerm) {
      return this.options;
    }
    return this.options.filter(option =>
      option.label.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (option.value && option.value.toString().toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }

  get selectedDisplay(): string {
    if (!this.value) return this.placeholder;

    if (this.multiple) {
      const selectedOptions = this.options.filter(opt => this.value.includes(opt.value));
      if (selectedOptions.length === 0) return this.placeholder;
      if (selectedOptions.length === 1) return selectedOptions[0].label;
      return `${selectedOptions.length} items seleccionados`;
    }

    const selectedOption = this.options.find(opt => opt.value === this.value);
    return selectedOption ? selectedOption.label : this.placeholder;
  }

  get hasValue(): boolean {
    return this.multiple ? (this.value?.length > 0) : (this.value !== undefined && this.value !== '');
  }

  // === MÉTODOS DEL COMPONENTE ===
  ngOnInit(): void {
    if (!this.id) {
      this.selectId = `select-${Math.random().toString(36).substring(2, 9)}`;
    } else {
      this.selectId = this.id;
    }
  }

  handleToggle(): void {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
      this.onOpenChange.emit(this.isOpen);
      if (!this.isOpen) {
        this.searchTerm = '';
      }
      this.onTouched(); // Marcar como "tocado" cuando se cierra el dropdown
    }
  }

  handleOptionSelect(option: SelectOption): void {
    if (option.disabled) return;
    
    if (this.multiple) {
      const newValue = this.value || [];
      const updatedValue = newValue.includes(option.value)
        ? newValue.filter((v: any) => v !== option.value)
        : [...newValue, option.value];
      this.value = updatedValue;
    } else {
      this.value = option.value;
      this.isOpen = false;
      this.onOpenChange.emit(false);
    }
    this.valueChange.emit(this.value);
  }

  handleClear(event: MouseEvent): void {
    event.stopPropagation();
    this.value = this.multiple ? [] : null;
    this.onTouched();
    this.valueChange.emit(this.value);
  }

  handleSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
  }
  
  isSelected(optionValue: any): boolean {
    if (this.multiple) {
      return this.value?.includes(optionValue) || false;
    }
    return this.value === optionValue;
  }

  // === MÉTODOS DE ControlValueAccessor ===
  writeValue(value: any): void {
    this._value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

