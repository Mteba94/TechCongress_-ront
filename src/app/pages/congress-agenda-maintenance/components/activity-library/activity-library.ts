import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Calendar, Clock, Code, GripVertical, Info, Library, Loader, LucideAngularModule, LucideIconData, Mic, Search, Trophy, User, Users } from 'lucide-angular';
import { Activity } from '../../../workshop-activity-catalog/models/activity.interface';
import { SelectComponent, SelectOption } from '../../../../shared/components/reusables/select-component/select-component';
import { Categoria } from '../../../workshop-activity-catalog/services/categoria';
import { InputComponent } from '../../../../shared/components/reusables/input/input';
// Assuming lucide-angular is used for icons
// import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-activity-library',
  templateUrl: './activity-library.html',
  styleUrls: ['./activity-library.css'],
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    LucideAngularModule,
    SelectComponent,
    InputComponent
  ]
})
export class ActivityLibrary {
  @Input() activities: Activity[] = [];
  @Input() filters: any = {};
  @Input() loading: boolean = false;
  @Output() onFilterChange = new EventEmitter<any>();

  private _categoriaService = inject(Categoria);
  
  readonly icons = {
    library: Library,
    search: Search,
    loader: Loader,
    user: User,
    info: Info,
    clock: Clock,
    users: Users,
    gripVertical: GripVertical
  }

  getCategoryIcon(category: 'workshop' | 'competition' | 'social' | 'conference' | string | undefined): LucideIconData {
    switch (category) {
      case 'workshop': return Code;
      case 'competition': return Trophy;
      case 'conference': return Mic;
      case 'social': return Users;
      default: return Calendar;
    }
  }

  categoryOptions: SelectOption[] = [];

  // formatDuration(minutes: number | undefined | null): string {
  //   if (minutes === null || minutes === undefined) {
  //     return '';
  //   }
  //   const hours = Math.floor(minutes / 60);
  //   const mins = minutes % 60;
  //   if (hours > 0) {
  //     return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  //   }
  //   return `${mins}m`;
  // }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void{
    this._categoriaService.getAllCategoria().subscribe({
      next: (response) => {
        if (response.data) {
          this.categoryOptions = response.data.map(categoria => ({
            value: categoria.tipoActividadId,
            label: categoria.nombre
          }));
        }
      },
      error: (err) => {
        console.error('Error loading categories', err);
      }
    });
  }

  updateFilter(key: string, value: any) {
    const newFilters = { ...this.filters, [key]: value };
    this.onFilterChange.emit(newFilters);
  }

  clearFilters() {
    this.onFilterChange.emit({ search: '', category: '', duration: '', requirements: '' });
  }
}
