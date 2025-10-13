import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
  description?: string;
}

@Component({
  selector: 'app-autocomplete-input',
  imports: [
    CommonModule
  ],
  templateUrl: './autocomplete-input.html',
  styleUrl: './autocomplete-input.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteInput),
      multi: true
    }
  ]
})
export class AutocompleteInput {
  @Input() inputId: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() value: string = '';
  @Input() error: string | null = null;
  @Input() description: string | null = null;
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() className: string = '';
  @Input() options: SelectOption[] = [];
  @Input() control!: FormControl; // Añadimos el Input para el FormControl

  @Output() valueChange = new EventEmitter<any>(); 
  @Output() optionSelected = new EventEmitter<any>(); // Emite el valor de la opción (value)
  @Output() optionSelectedObject = new EventEmitter<SelectOption>(); // Nuevo: Emite el objeto completo

  showDropdown = false;
  filteredOptions: SelectOption[] = [];
  selectedLabel: string = '';
  private typingTimeout: any;

  private onChange = (_: any) => {};
  private onTouched = () => {};

  constructor() {
    this.filteredOptions = this.options;
  }

  // Se ejecuta cuando el usuario escribe en el campo de texto
  onInput(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    this.selectedLabel = inputValue;
    this.valueChange.emit(inputValue);

    clearTimeout(this.typingTimeout);

    this.typingTimeout = setTimeout(() => {
      this.filteredOptions = this.options.filter(option =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      );
    }, 300);

    this.onChange(inputValue);
  }

  // Se ejecuta al hacer clic en una opción del dropdown
  selectOption(option: SelectOption) {
    this.selectedLabel = option.label;
    if (this.control) {
      this.control.setValue(option.value);
    }
    this.optionSelected.emit(option.value);
    this.optionSelectedObject.emit(option); // Emitimos el objeto completo
    this.showDropdown = false;

    this.onChange(option.value);
    this.onTouched();
  }

  onBlur() {
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
    this.onTouched();
  }

   writeValue(value: any): void {
    console.log(value)
    if (value !== undefined && value !== null) {
      const option = this.options.find(opt => opt.value === value);
      this.selectedLabel = option ? option.label : value;
    } else {
      this.selectedLabel = '';
    }
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
