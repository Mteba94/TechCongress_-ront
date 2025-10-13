import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SelectComponent } from '../../../../shared/components/reusables/select-component/select-component';

interface FilterConfig {
  role: string;
  status: string;
  institution: string;
  activityParticipation: string;
}

interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-user-filters',
  imports: [
    SelectComponent
  ],
  templateUrl: './user-filters.html',
  styleUrl: './user-filters.css'
})
export class UserFilters {
  @Input() filters!: FilterConfig;
  @Output() filtersChange = new EventEmitter<FilterConfig>();

  roleOptions: SelectOption[] = [
    { value: '', label: 'Todos los roles' },
    { value: 'admin', label: 'Administradores' },
    { value: 'student', label: 'Estudiantes Internos' },
    { value: 'external', label: 'Estudiantes Externos' }
  ];

  statusOptions: SelectOption[] = [
    { value: '', label: 'Todos los estados' },
    { value: '1', label: 'Activos' },
    { value: '2', label: 'Pendientes' },
    { value: '3', label: 'Bloqueados' }
  ];

  institutionOptions: SelectOption[] = [
    { value: '', label: 'Todas las instituciones' },
    { value: 'Universidad Nacional', label: 'Universidad Nacional' },
    { value: 'Colegio San José', label: 'Colegio San José' },
    { value: 'Colegio La Salle', label: 'Colegio La Salle' }
  ];

  activityOptions: SelectOption[] = [
    { value: '', label: 'Todas las actividades' },
    { value: 'workshop', label: 'Talleres' },
    { value: 'conference', label: 'Conferencias' },
    { value: 'competition', label: 'Competencias' }
  ];

  onFilterChange(key: keyof FilterConfig, value: string) {
    this.filtersChange.emit({
      ...this.filters,
      [key]: value
    });
  }
}
