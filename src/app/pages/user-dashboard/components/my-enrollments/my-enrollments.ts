import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Activity } from '../../../workshop-activity-catalog/models/activity.interface';
import { BookOpen, Calendar, CheckCircle, Circle, Clock, LucideAngularModule, LucideIconData, MapPin, User, Users } from 'lucide-angular';
import { Button } from '../../../../shared/components/reusables/button/button';
import { Router } from '@angular/router';
import { Actividad } from '../../../workshop-activity-catalog/services/actividad';
import { ActivityDetailModal } from '../../../workshop-activity-catalog/components/activity-detail-modal/activity-detail-modal';

type FilterType = 'all' | 'completed' | 'in-progress' | 'upcoming';

// Extend the Activity interface to include the status property used in this component
interface EnrollmentActivity extends Activity {
  status: 'completed' | 'in-progress' | 'upcoming';
}

@Component({
  selector: 'app-my-enrollments',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    Button,
    ActivityDetailModal
  ],
  templateUrl: './my-enrollments.html',
  styleUrls: ['./my-enrollments.css']
})
export class MyEnrollments implements OnInit {
  enrollments = signal<EnrollmentActivity[]>([]);
  filteredEnrollments = signal<EnrollmentActivity[]>([]);
  filter = signal<FilterType>('all');
  selectedActivity = signal<EnrollmentActivity | null>(null);
  isModalOpen = signal<boolean>(false);
  userEnrolledIds = computed(() => this.enrollments().map(e => e.id));

  readonly icons = {
    checkCircle: CheckCircle,
    clock: Clock,
    calendar: Calendar,
    circle: Circle,
    bookOpen: BookOpen,
    mapPin: MapPin,
    user: User,
    users: Users
  }

  private router = inject(Router);
  private actividadService = inject(Actividad);

  tabs: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'upcoming', label: 'Próximas' },
    { key: 'in-progress', label: 'En Progreso' },
    { key: 'completed', label: 'Completadas' }
  ];

  ngOnInit() {
    this.loadEnrollments();
  }

  loadEnrollments() {
    const size = 100;
    const sort = 'Titulo';
    const order = 'asc';
    const numPage = 0;
    const getInputs = '';

    this.actividadService.getAll(size, sort, order, numPage, getInputs).subscribe(response => {
      const activities = response.data.map(activity => {
        const now = new Date();
        const datePart = activity.date.split('T')[0];
        const activityStartDate = new Date(`${datePart}T${activity.startTime}`);
        const activityEndDate = new Date(`${datePart}T${activity.endTime}`);

        let status: 'completed' | 'in-progress' | 'upcoming';

        if (now > activityEndDate) {
          status = 'completed';
        } else if (now >= activityStartDate && now <= activityEndDate) {
          status = 'in-progress';
        } else {
          status = 'upcoming';
        }
        
        return { ...activity, status };
      });
      this.enrollments.set(activities);
      this.applyFilter();
    });
  }

  applyFilter() {
    const currentFilter = this.filter();
    if (currentFilter === 'all') {
      this.filteredEnrollments.set(this.enrollments());
    } else {
      this.filteredEnrollments.set(this.enrollments().filter(e => e.status === currentFilter));
    }
  }

  setFilter(filter: FilterType) {
    this.filter.set(filter);
    this.applyFilter();
  }

  getStatusIcon(status: string): { icon: LucideIconData; color: string } {
    switch (status) {
      case 'p':
        return { icon: CheckCircle, color: 'text-green-600' };
      case 'in-progress':
        return { icon: Clock, color: 'text-yellow-600' };
      case 'upcoming':
        return { icon: Calendar, color: 'text-blue-600' };
      default:
        return { icon: Circle, color: 'text-gray-400' };
    }
  }

  getStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'Pendiente':
        return 'Pendiente';
      case 'Completado':
         return 'Completado';
      case 'En Curso':
         return 'En Curso';
      case 'Cancelled':
        return 'cancelled';
      default:
        return 'Pendiente';
    }
  }

  getTypeColor(type: string): string {
    switch (type.toLowerCase()) {
      case 'taller':
        return 'bg-blue-100 text-blue-800';
      case 'competencia':
        return 'bg-red-100 text-red-800';
      case 'conferencia':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) {
      return 'Invalid Date';
    }
  
    let year: number, month: number, day: number;
  
    if (dateString.includes('T')) {
      // Handle ISO-like strings, e.g., "2025-10-18T..."
      const datePart = dateString.split('T')[0];
      const parts = datePart.split('-');
      if (parts.length !== 3) {
        return 'Invalid Date';
      }
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    } else if (dateString.includes('/')) {
      // Handle "DD/MM/YYYY" format
      const parts = dateString.split('/');
      if (parts.length !== 3) {
        return 'Invalid Date';
      }
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    } else {
      return 'Invalid Date Format';
    }
  
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return 'Invalid Date';
    }
  
    // months are 0-indexed in JavaScript Date
    const date = new Date(Date.UTC(year, month - 1, day));
  
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    });
  }

  openDetailsModal(activity: EnrollmentActivity): void {
    this.selectedActivity.set(activity);
    this.isModalOpen.set(true);
  }

  closeDetailsModal(): void {
    this.isModalOpen.set(false);
    this.selectedActivity.set(null);
  }

  navigateTo(url: string) {
    this.router.navigate([url]);
  }
}
