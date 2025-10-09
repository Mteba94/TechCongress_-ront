import { Component, computed, input, output } from '@angular/core';
import { Activity } from '../../models/activity.interface';
import { BookOpen, Calendar, Code, Info, LucideAngularModule, LucideIconData, Trophy, Users } from 'lucide-angular';
import { Button } from '../../../../shared/components/reusables/button/button';

@Component({
  selector: 'app-my-enrollments-filter',
  imports: [
    LucideAngularModule,
    Button
  ],
  templateUrl: './my-enrollments-filter.html',
  styleUrl: './my-enrollments-filter.css'
})
export class MyEnrollmentsFilter {
  readonly icons = {
    bookOpen: BookOpen,
    calendar: Calendar
  }

  readonly categoryIcons: Record<string, LucideIconData> = {
    info: Info,
    taller: Code,
    competition: Trophy,
    social: Users
  };

  getIconForCategory(category?: string): LucideIconData {
    if (!category) return Info;
    const key = String(category).toLowerCase().trim();
    return this.categoryIcons[key] || Info;
  }

  userEnrollments = input<number[]>([]);
  activities = input<Activity[]>([]);
  showMyEnrollments = input<boolean>(false);
  isAuthenticated = input<boolean>(false);

  onToggleMyEnrollments = output<void>();

  // Lógica de filtrado como una señal computada (computed signal)
  enrolledActivities = computed(() => {
    const enrollments = this.userEnrollments();
    return this.activities().filter(activity =>
      enrollments.includes(activity.id)
    );
  });

  // Helper para determinar las clases del botón (implementando la lógica de 'variant')
  getButtonClasses(): string {
    const defaultClasses = 'transition-colors duration-200 shadow-sm';
    
    // Lógica para el estado "default" (visible/apagado)
    if (this.showMyEnrollments()) {
      return `bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 ${defaultClasses}`;
    }
    
    // Lógica para el estado "outline" (filtro activo)
    return `bg-purple-600 text-white hover:bg-purple-700 ${defaultClasses}`;
  }

}
