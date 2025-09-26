import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, Input, Output, signal, OnChanges, SimpleChanges } from '@angular/core';
import { InputComponent } from '../../../../shared/components/reusables/input/input';
import { Button } from '../../../../shared/components/reusables/button/button';
import { SelectComponent } from '../../../../shared/components/reusables/select-component/select-component';
import { Search } from 'lucide-angular';
import { RegistrationCallToAction } from '../../../../shared/components/reusables/registration-call-to-action/registration-call-to-action';

@Component({
  selector: 'app-search-and-filters',
  imports: [
    CommonModule,
    InputComponent,
    Button,
    SelectComponent,
  ],
  templateUrl: './search-and-filters.html',
  styleUrl: './search-and-filters.css',
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchAndFilters implements OnChanges {
  readonly icons = {
    search: Search
  };

  // Declara las entradas que recibe el componente padre
  @Input() searchQuery!: string;
  @Input() filters!: {
    category: string;
    difficulty: string;
    timeSlot: string;
    availability: string;
  };
  @Input() isFilterPanelOpen!: boolean;
  @Input() sortBy!: string;
  @Input() totalResults!: number;

  // Internal signals to react to @Input changes
  _searchQuery = signal<string>('');
  _filters = signal<{
    category: string;
    difficulty: string;
    timeSlot: string;
    availability: string;
  }>({ category: 'all', difficulty: 'all', timeSlot: 'all', availability: 'all' });

  // Declara las salidas para emitir eventos al componente padre
  @Output() onSearchChange = new EventEmitter<string>();
  @Output() onFiltersChange = new EventEmitter<any>();
  @Output() onToggleFilterPanel = new EventEmitter<void>();
  @Output() onSortChange = new EventEmitter<string>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchQuery']) {
      this._searchQuery.set(this.searchQuery);
    }
    if (changes['filters']) {
      this._filters.set(this.filters);
    }
  }

  // Señal calculada para determinar la cantidad de filtros activos
  activeFiltersCount = computed(() => {
    let count = 0;
    const currentFilters = this._filters();
    if (currentFilters) {
      for (const key in currentFilters) {
        if (currentFilters[key as keyof typeof currentFilters] !== 'all') {
          count++;
        }
      }
    }
    if (this._searchQuery()) {
      count++;
    }
    return count;
  });

  // Métodos para manejar los eventos del DOM y emitir los datos relevantes
  handleSearchChange(value: string) {
    this._searchQuery.set(value);
    this.onSearchChange.emit(value);
  }

  handleToggleFilterPanel() {
    this.onToggleFilterPanel.emit();
  }

  handleSortChange(value: string) {
    this.onSortChange.emit(value);
  }

  handleFilterChange(filterType: string, value: string) {
    this._filters.update(currentFilters => ({ ...currentFilters, [filterType]: value }));
    this.onFiltersChange.emit(this._filters());
  }

  clearAllFilters() {
    this._searchQuery.set('');
    this.onSearchChange.emit('');
    this._filters.set({
      category: 'all',
      difficulty: 'all',
      timeSlot: 'all',
      availability: 'all'
    });
    this.onFiltersChange.emit(this._filters());
  }

  // Datos para las opciones de selección (se mantienen como propiedades de clase)
  categoryOptions = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'workshop', label: 'Talleres' },
    { value: 'competition', label: 'Competencias' },
    { value: 'social', label: 'Actividades sociales' }
  ];

  difficultyOptions = [
    { value: 'all', label: 'Todos los niveles' },
    { value: 'beginner', label: 'Principiante' },
    { value: 'intermediate', label: 'Intermedio' },
    { value: 'advanced', label: 'Avanzado' }
  ];

  timeSlotOptions = [
    { value: 'all', label: 'Todos los horarios' },
    { value: 'morning', label: 'Mañana (8:00-12:00)' },
    { value: 'afternoon', label: 'Tarde (13:00-17:00)' },
    { value: 'evening', label: 'Noche (18:00-21:00)' }
  ];

  availabilityOptions = [
    { value: 'all', label: 'Todas las disponibilidades' },
    { value: 'available', label: 'Disponible' },
    { value: 'waitlist', label: 'Lista de espera' },
    { value: 'full', label: 'Completo' }
  ];

  sortOptions = [
    { value: 'popularity', label: 'Popularidad' },
    { value: 'schedule', label: 'Horario' },
    { value: 'category', label: 'Categoría' },
    { value: 'availability', label: 'Disponibilidad' }
  ];
}