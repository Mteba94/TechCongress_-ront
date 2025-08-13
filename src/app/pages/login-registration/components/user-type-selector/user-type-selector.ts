import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GraduationCap, LucideAngularModule, School } from 'lucide-angular';

export interface UserTypeOption {
  id: 'external' | 'internal';
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
}

@Component({
  selector: 'app-user-type-selector',
  imports: [
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './user-type-selector.html',
  styleUrl: './user-type-selector.css'
})
export class UserTypeSelector {
  @Input() selectedType: 'internal' | 'external' = 'external';
  @Output() onTypeChange = new EventEmitter<'internal' | 'external'>();

  readonly icons ={
    graduationCap: GraduationCap,
    school: School
  }

  userTypes = [
    {
      id: 'external',
      title: 'Estudiante Externo',
      description: 'Estudiante de bachillerato de institución externa',
      icon: this.icons.graduationCap,
      color: 'text-[var(--color-blue-600)]',
      bgColor: 'bg-[var(--color-blue-50)] border-[var(--color-blue-200)]',
      radioBgColor: 'bg-[var(--color-blue-600)]' 
    },
    {
      id: 'internal',
      title: 'Estudiante Universitario',
      description: 'Estudiante de la universidad con correo institucional',
      icon: this.icons.school,
      color: 'text-[var(--color-teal-600)]',
      bgColor: 'bg-[var(--color-teal-50)] border-[var(--color-teal-200)]',
      radioBgColor: 'bg-[var(--color-teal-600)]' 
    }
  ];

  constructor() {}

  ngOnInit(): void {
    // Si necesitas inicialización adicional, va aquí
  }

  selectType(typeId: 'internal' | 'external'): void {
    this.selectedType = typeId;
    this.onTypeChange.emit(typeId);
  }
}
