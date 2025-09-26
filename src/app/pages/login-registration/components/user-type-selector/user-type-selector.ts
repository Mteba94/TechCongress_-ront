import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { GraduationCap, LucideAngularModule, LucideIconData, School } from 'lucide-angular';
import { TipoParticipante } from '../../services/tipo-participante';
import { BaseApiResponse } from '../../../../shared/models/reusables/base-api-response.interface';
import { SelectResponse } from '../../models/select-response.interface';

export interface UserTypeOption {
  id: 'external' | 'internal';
  title: string;
  description: string;
  icon: LucideIconData;
  color: string;
  bgColor: string;
  radioBgColor: string;
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

  private readonly tipoParticipanteService = inject(TipoParticipante);

  readonly icons ={
    graduationCap: GraduationCap,
    school: School
  }

  userTypes: UserTypeOption[] = [];

  // userTypes = [
  //   {
  //     id: 'external',
  //     title: 'Estudiante Externo',
  //     description: 'Estudiante de bachillerato de institución externa',
  //     icon: this.icons.graduationCap,
  //     color: 'text-[var(--color-blue-600)]',
  //     bgColor: 'bg-[var(--color-blue-50)] border-[var(--color-blue-200)]',
  //     radioBgColor: 'bg-[var(--color-blue-600)]' 
  //   },
  //   {
  //     id: 'internal',
  //     title: 'Estudiante Universitario',
  //     description: 'Estudiante de la universidad con correo institucional',
  //     icon: this.icons.school,
  //     color: 'text-[var(--color-teal-600)]',
  //     bgColor: 'bg-[var(--color-teal-50)] border-[var(--color-teal-200)]',
  //     radioBgColor: 'bg-[var(--color-teal-600)]' 
  //   }
  // ];

  ngOnInit(): void {
    this.getTipoParticipante();
  }

  getTipoParticipante(): void{
    // Suscribirse al Observable del servicio.
    this.tipoParticipanteService
      .getSelectTipoParticipante()
      .subscribe({
        // Callback para cuando la petición es exitosa.
        next: (resp) => {
          if (resp.isSuccess) {
            this.userTypes = this.mapServiceDataToUserTypes(resp.data);
          } else {
            this.userTypes = [];
          }
        },
        error: (error) => {
          //console.error('An error occurred during API call:', error);
        },
        complete: () => {
          //console.log('API call completed.');
        }
      });
  }

   private mapServiceDataToUserTypes(data: SelectResponse[]): UserTypeOption[] {
    return data.map(item => {
      let tipoId: 'internal' | 'external';
      let icon: LucideIconData;
      let color, bgColor, radioBgColor;

      if (item.nombre.includes('Externo')) {
        tipoId = 'external';
        icon = this.icons.graduationCap;
        color = 'text-[var(--color-blue-600)]';
        bgColor = 'bg-[var(--color-blue-50)] border-[var(--color-blue-200)]';
        radioBgColor = 'bg-[var(--color-blue-600)]';
      } else {
        tipoId = 'internal';
        icon = this.icons.school;
        color = 'text-[var(--color-teal-600)]';
        bgColor = 'bg-[var(--color-teal-50)] border-[var(--color-teal-200)]';
        radioBgColor = 'bg-[var(--color-teal-600)]';
      }

      return {
        id: tipoId,
        title: item.nombre,
        description: item.descripcion,
        icon: icon,
        color: color,
        bgColor: bgColor,
        radioBgColor: radioBgColor
      };
    });
  }

  selectType(typeId: 'internal' | 'external'): void {
    this.selectedType = typeId;
    this.onTypeChange.emit(typeId);
  }
}
