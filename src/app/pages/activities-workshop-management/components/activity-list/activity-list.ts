import { CommonModule, formatDate } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { 
    BookOpen, Calendar, CheckSquare, Clock, DollarSign, Edit, Gift, LucideAngularModule, 
    LucideIconData, MapPin, Monitor, Square, Trophy, Trash2, User, Users 
} from 'lucide-angular';
import { Button } from '../../../../shared/components/reusables/button/button';

@Component({
  selector: 'app-activity-list',
  imports: [
    LucideAngularModule,
    Button,
    CommonModule
  ],
  templateUrl: './activity-list.html',
  styleUrl: './activity-list.css'
})
export class ActivityList {
  readonly icons = {
    calendar: Calendar,
    checkSquare: CheckSquare,
    square: Square,
    edit: Edit,
    trash2: Trash2,
    user: User,
    clock: Clock,
    mapPin: MapPin,
    monitor: Monitor,
    gift: Gift,
    dollarSign: DollarSign,
    bookOpen: BookOpen,
    trophy: Trophy,
    users: Users
  }

  // Inputs
  activities = input<any[]>([]);
  loading = input<boolean>(false);
  selectedActivities = input<string[]>([]);

  // Outputs
  activitySelect = output<{ id: string, isSelected: boolean }>();
  activitySelectAll = output<boolean>();
  editActivity = output<any>();
  deleteActivity = output<string>();

  // Placeholder para el estado de carga
  loadingPlaceholder = new Array(8);

  // Estado para la selección de todos los elementos
  allSelected = computed(() => {
    const numActivities = this.activities().length;
    const numSelected = this.selectedActivities().length;
    return numActivities > 0 && numActivities === numSelected;
  });

  /**
   * Verifica si una actividad está seleccionada.
   */
  isSelected(id: string): boolean {
    return this.selectedActivities().includes(id);
  }

  /**
   * Emite el evento de selección al hacer clic en el checkbox.
   */
  onToggleSelect(id: string): void {
    const isCurrentlySelected = this.isSelected(id);
    this.activitySelect.emit({ id, isSelected: !isCurrentlySelected });
  }

  /**
   * Emite el evento para seleccionar o deseleccionar todas las actividades.
   */
  onSelectAll(): void {
    this.activitySelectAll.emit(!this.allSelected());
  }

  /**
   * Devuelve las clases de Tailwind para el color del estado.
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  /**
   * Devuelve el nombre del ícono para la categoría.
   */
  getCategoryIcon(category: string): LucideIconData {
    switch (category.toLowerCase()) {
      case 'taller':
        return this.icons.bookOpen;
      case 'competencia':
        return this.icons.trophy;
      case 'social':
        return this.icons.users;
      default:
        return this.icons.calendar;
    }
  }

  /**
   * Calcula el porcentaje de utilización de la capacidad.
   */
  getCapacityUtilization(capacity: number, enrolled: number): number {
    if (!capacity || capacity === 0) return 0;
    const utilization = (enrolled / capacity) * 100;
    return Math.round(utilization);
  }

  /**
   * Devuelve las clases de fondo para la barra de progreso de capacidad.
   */
  getCapacityBarColor(utilization: number): string {
    if (utilization >= 100) return 'bg-red-500';
    if (utilization >= 80) return 'bg-amber-500';
    if (utilization >= 50) return 'bg-blue-500';
    return 'bg-green-500';
  }

  /**
   * Formatea una cadena de fecha a formato local 'dd/MM/yyyy'.
   */
  formatDates(dateStr: string): string {
    if (!dateStr) return 'Fecha no definida';
    try {
      return formatDate(dateStr, 'dd/MM/yyyy', 'es-ES');
    } catch (e) {
      return dateStr;
    }
  }
}