import { CommonModule, formatDate } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { 
    BookOpen, Calendar, CheckSquare, Clock, DollarSign, Edit, Gift, LucideAngularModule, 
    LucideIconData, MapPin, Monitor, Square, Trophy, Trash2, User, Users 
} from 'lucide-angular';
import { Button } from '../../../../shared/components/reusables/button/button';

@Component({
  selector: 'app-activity-grid',
  imports: [
    LucideAngularModule,
    Button,
    CommonModule
  ],
  templateUrl: './activity-grid.html',
  styleUrl: './activity-grid.css'
})
export class ActivityGrid {
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

  // Inputs (simulando los props de React)
  activities = input<any[]>([]);
  loading = input<boolean>(false);
  selectedActivities = input<string[]>([]);

  // Outputs (simulando los callbacks de React)
  activitySelect = output<{ id: string, isSelected: boolean }>();
  editActivity = output<any>();
  deleteActivity = output<string>();

  // Placeholder para el estado de carga
  loadingPlaceholder = new Array(6);

  /**
   * Verifica si una actividad está seleccionada.
   * @param id El ID de la actividad.
   * @returns true si está seleccionada.
   */
  isSelected(id: string): boolean {
    return this.selectedActivities().includes(id);
  }

  /**
   * Emite el evento de selección al hacer clic en el checkbox o la tarjeta.
   * @param id El ID de la actividad.
   */
  onToggleSelect(id: string): void {
    const isCurrentlySelected = this.isSelected(id);
    this.activitySelect.emit({ id, isSelected: !isCurrentlySelected });
  }

  /**
   * Devuelve las clases de Tailwind para el color del estado.
   * @param status El estado de la actividad.
   * @returns Clases CSS.
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
   * @param category La categoría de la actividad.
   * @returns Nombre del ícono.
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
   * @param capacity Objeto con enrolled y max.
   * @returns Porcentaje de utilización (0-100).
   */
  getCapacityUtilization(capacity: number, enrolled: number): number {
    if (!capacity) return 0;
    const utilization = (enrolled / capacity) * 100;
    return Math.round(utilization);
  }

  /**
   * Devuelve las clases de texto para el color de la utilización de capacidad.
   * @param utilization Porcentaje de utilización.
   * @returns Clases CSS de color de texto.
   */
  getCapacityColor(utilization: number): string {
    if (utilization >= 100) return 'text-red-600';
    if (utilization >= 80) return 'text-amber-600';
    if (utilization >= 50) return 'text-blue-600';
    return 'text-green-600';
  }

  /**
   * Devuelve las clases de fondo para la barra de progreso de capacidad.
   * @param utilization Porcentaje de utilización.
   * @returns Clases CSS de color de fondo.
   */
  getCapacityBarColor(utilization: number): string {
    if (utilization >= 100) return 'bg-red-500';
    if (utilization >= 80) return 'bg-amber-500';
    if (utilization >= 50) return 'bg-blue-500';
    return 'bg-green-500';
  }

  /**
   * Formatea una cadena de fecha a formato local 'dd/MM/yyyy'.
   * @param dateStr Cadena de fecha.
   * @returns Fecha formateada.
   */
  formatDates(dateStr: string): string {
    if (!dateStr) return 'Fecha no definida';
    // Usamos el pipe nativo de Angular 'date' con el formato 'shortDate' y locale 'es'
    // Como no podemos usar pipes en la clase, usamos la función global de JS/Angular
    try {
      return formatDate(dateStr, 'dd/MM/yyyy', 'es-ES');
    } catch (e) {
      // Fallback si la fecha no es válida
      return dateStr;
    }
  }

  /**
   * Devuelve la cadena de tiempo tal cual (sin formato complejo).
   * @param timeStr Cadena de tiempo.
   * @returns Cadena de tiempo.
   */
  formatTime(timeStr: string): string {
    return timeStr || 'Hora no definida';
  }
}
