import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Activity } from '../../../workshop-activity-catalog/models/activity.interface';
import { BookOpen, Calendar, CheckCircle, Circle, Clock, Loader, LucideAngularModule, LucideIconData, MapPin, User, Users } from 'lucide-angular';
import { Button } from '../../../../shared/components/reusables/button/button';
import { Router } from '@angular/router';
import { Actividad } from '../../../workshop-activity-catalog/services/actividad';
import { ActivityDetailModal } from '../../../workshop-activity-catalog/components/activity-detail-modal/activity-detail-modal';
import { firstValueFrom, forkJoin, map } from 'rxjs';
import { Auth } from '../../../login-registration/services/auth';
import { InscripcionService } from '../../../workshop-activity-catalog/services/inscripcion-service';
import { NotificacionService } from '../../../../shared/services/notificacion-service';

type FilterType = 'all' | 'completed' | 'in-progress' | 'upcoming';

// Extend the Activity interface to include the status property used in this component
interface EnrollmentActivity extends Activity {
  inscripcionId: number;
  esGanador: boolean;
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
  loading = signal(false);

  readonly icons = {
    checkCircle: CheckCircle,
    clock: Clock,
    calendar: Calendar,
    circle: Circle,
    bookOpen: BookOpen,
    mapPin: MapPin,
    user: User,
    users: Users,
    loader: Loader
  }

  private router = inject(Router);
  private actividadService = inject(Actividad);
  private auth = inject(Auth);
  private inscripcionService = inject(InscripcionService);
  private notificationService = inject(NotificacionService);


  tabs: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'upcoming', label: 'Próximas' },
    { key: 'in-progress', label: 'En Progreso' },
    { key: 'completed', label: 'Completadas' }
  ];

  ngOnInit() {
    this.loadMyEnrollments();
    this.loading.set(false);
  }

  async loadMyEnrollments() {
    this.loading.set(true);
    const user = await firstValueFrom(this.auth.currentUser$);
    if (user) {
      try {
        const response = await firstValueFrom(this.inscripcionService.ByUser(user.id));
        this.loading.set(false);
        if (response.isSuccess) {
          const inscriptionResponses = response.data;
          
          if (inscriptionResponses.length === 0) {
            this.enrollments.set([]);
            this.applyFilter();
            return;
          }

          const activityRequests = inscriptionResponses.map(inscripcion =>
            this.actividadService.getById(inscripcion.actividadId).pipe(
              map(activityResp => ({ ...activityResp, inscripcionId: inscripcion.inscripcionId, esGanador: inscripcion.esGanador }))
            )
          );

          firstValueFrom(forkJoin(activityRequests))
            .then(activityResponses => {
              const enrollmentActivities: EnrollmentActivity[] = activityResponses.map((activityResp, index) => {
                const activity = activityResp.data;
                const now = new Date();
                const activityDate = new Date(activity.date);

                return {
                  ...activity,
                  inscripcionId: activityResp.inscripcionId,
                  esGanador: activityResp.esGanador,
                } as EnrollmentActivity;
              });
              this.enrollments.set(enrollmentActivities);
              this.applyFilter();
            })
            .catch(error => {
              console.error('Error fetching activity details for enrollments:', error);
            });
        }
      } catch (error) {
        console.error('Error fetching user enrollments:', error);
      } finally {
        this.loading.set(false);
      }
    } else {
      this.loading.set(false); // Also set to false if no user
    }
  }

  applyFilter() {
    const currentFilter = this.filter();
    if (currentFilter === 'all') {
      this.filteredEnrollments.set(this.enrollments());
    }
    else {
      this.filteredEnrollments.set(this.enrollments().filter(e => {
        if (currentFilter === 'completed') return e.statusActivity === 'Completado';
        if (currentFilter === 'in-progress') return e.statusActivity === 'En Curso';
        if (currentFilter === 'upcoming') return e.statusActivity === 'Pendiente'; // Assuming 'Pendiente' means upcoming
        return false;
      }));
    }
  }

  setFilter(filter: FilterType) {
    this.filter.set(filter);
    this.applyFilter();
  }

  getStatusIcon(statusActivity: string): { icon: LucideIconData; color: string } {
    switch (statusActivity) {
      case 'Completado':
        return { icon: CheckCircle, color: 'text-green-600' };
      case 'En Curso':
        return { icon: Clock, color: 'text-yellow-600' };
      case 'Pendiente':
        return { icon: Calendar, color: 'text-blue-600' };
      default:
        return { icon: Circle, color: 'text-gray-400' };
    }
  }

  getStatusText(statusActivity: string): string {
    switch (statusActivity.toLowerCase()) {
      case 'pendiente':
        return 'Pendiente';
      case 'completado':
        return 'Completado';
      case 'en curso':
        return 'En Curso';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Desconocido';
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

  async handleGenerateDiploma(inscripcionId: number) {
    try {
      const request = {
        inscripcionId: inscripcionId,
        nombrePersonalizado: '' // Set to null if not provided
      };
      const response = await firstValueFrom(this.inscripcionService.GenerateDiploma(request));
      if (response.isSuccess) {
        this.notificationService.show('Diploma generado exitosamente.', 'success');
        if (response.data) {
          // Assuming response.data is the base64 PDF string
          const base64Pdf = response.data;
          const byteCharacters = atob(base64Pdf);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `diploma_${inscripcionId}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }
      } else {
        console.error('Error generating diploma (API response):', response.message);
        this.notificationService.show(response.message, 'error');
      }
    } catch (error) {
      this.notificationService.show('Error al generar el diploma.', 'error');
      console.error('Error generating diploma (exception):', error);
    }
  }
}
