import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../login-registration/services/auth';
import { Header } from '../../../shared/components/layout/header/header';
import { Breadcrumbs } from '../../../shared/components/reusables/breadcrumbs/breadcrumbs';
import { Calendar, Info, LucideAngularModule } from 'lucide-angular';
import { SearchAndFilters } from '../../workshop-activity-catalog/components/search-and-filters/search-and-filters';
import { RegistrationCallToAction } from "../../../shared/components/reusables/registration-call-to-action/registration-call-to-action";
import { ActivityGrid } from '../../workshop-activity-catalog/components/activity-grid/activity-grid';
import { ActivityDetailModal } from '../../workshop-activity-catalog/components/activity-detail-modal/activity-detail-modal';
import { Router } from '@angular/router';
import { Actividad } from '../../workshop-activity-catalog/services/actividad';
import { Activity } from '../../workshop-activity-catalog/models/activity.interface';
import { MyEnrollmentsFilter } from '../../workshop-activity-catalog/components/my-enrollments-filter/my-enrollments-filter';
import { InscripcionService } from '../../workshop-activity-catalog/services/inscripcion-service';
import { firstValueFrom } from 'rxjs';
import { InscripcionRequest } from '../../workshop-activity-catalog/models/inscripcion-req.interface';
import { NotificationsAlert } from '../../../shared/components/reusables/notifications-alert/notifications-alert';

// Define the Enrollment type
interface Enrollment {
  activityId: number;
  userId: string;
}

@Component({
  selector: 'app-workshop-activity-catalog',
  imports: [
    CommonModule,
    FormsModule,
    Header,
    Breadcrumbs,
    LucideAngularModule,
    SearchAndFilters,
    RegistrationCallToAction,
    ActivityGrid,
    ActivityDetailModal,
    MyEnrollmentsFilter,
    NotificationsAlert
],
  templateUrl: './workshop-activity-catalog.html',
  styleUrl: './workshop-activity-catalog.css'
})
export class WorkshopActivityCatalog {
  readonly icons = {
    calendar: Calendar,
    info: Info
  }

  private readonly router = inject(Router)
  private readonly actividadService = inject(Actividad)
  private readonly inscripcionService = inject(InscripcionService)
  private readonly auth = inject(Auth)


  paginatorOptions = {
    pageSizeOptions: [6, 12, 24],
    pageSize: 6,
    pageLength: 0,
    currentPage: 0,
  };

  // Estado de la aplicación
  searchQuery = signal('');
  filters = signal({
    category: 'all',
    difficulty: 'all',
    timeSlot: 'all',
    availability: 'all',
  });
  sortBy = signal('popularity');
  isFilterPanelOpen = signal(false);
  showMyEnrollments = signal(false);
  selectedActivity = signal<Activity | null>(null);
  isDetailModalOpen = signal(false);
  loading = signal(false);
  displayedActivities = signal<Activity[]>([]);
  hasMore = signal(true);
  isAuthenticated = signal(false);
  userEnrollments = signal<number[]>([]);
  enrollmentMessage = signal<string | null>(null);
  isEnrollmentError = signal<boolean>(false);

  // Lógica de filtrado y ordenamiento con computed
  filteredAndSortedActivities = computed(() => {
    let filtered = this.displayedActivities();
    const currentFilters = this.filters();
    const currentSearch = this.searchQuery();
    const currentSort = this.sortBy();
    const userEnrolls = this.userEnrollments();
    const myEnrollments = this.showMyEnrollments();

    // Aplicar filtro de búsqueda
    if (currentSearch) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
        activity.description.toLowerCase().includes(currentSearch.toLowerCase()) ||
        activity.instructor.toLowerCase().includes(currentSearch.toLowerCase())
      );
    }

    // Aplicar filtros de categoría, dificultad, etc.
    if (currentFilters.category !== 'all') {
      filtered = filtered.filter(activity => activity.category === currentFilters.category);
    }
    if (currentFilters.difficulty !== 'all') {
      filtered = filtered.filter(activity => activity.difficulty === currentFilters.difficulty);
    }
    if (currentFilters.timeSlot !== 'all') {
      filtered = filtered.filter(activity => {
        const startHour = parseInt(activity.startTime.split(':')[0]);
        switch (currentFilters.timeSlot) {
          case 'morning': return startHour >= 8 && startHour < 12;
          case 'afternoon': return startHour >= 13 && startHour < 17;
          case 'evening': return startHour >= 18 && startHour < 21;
          default: return true;
        }
      });
    }
    if (currentFilters.availability !== 'all') {
      filtered = filtered.filter(activity => {
        const spotsLeft = activity.capacity - activity.enrolled;
        switch (currentFilters.availability) {
          case 'available': return spotsLeft > 5;
          case 'waitlist': return spotsLeft > 0 && spotsLeft <= 5;
          case 'full': return spotsLeft <= 0;
          default: return true;
        }
      });
    }

    // Aplicar filtro "Mis inscripciones"
    if (myEnrollments) {
      filtered = filtered.filter(activity => userEnrolls.includes(activity.id));
    }

    // Aplicar ordenamiento
    return filtered.sort((a, b) => {
      switch (currentSort) {
        case 'popularity':
          return b.enrolled - a.enrolled;
        case 'schedule':
          return new Date(`2000-01-01T${a.startTime}`).getTime() - new Date(`2000-01-01T${b.startTime}`).getTime();
        case 'category':
          return a.category.localeCompare(b.category);
        case 'availability':
          const spotsA = a.capacity - a.enrolled;
          const spotsB = b.capacity - b.enrolled;
          return spotsB - spotsA;
        default:
          return 0;
      }
    });
  });

  ngOnInit() {
    // Comprobar estado de autenticación y inscripciones
    const authStatus = localStorage.getItem('isAuthenticated');
    const enrollments = JSON.parse(localStorage.getItem('userEnrollments') || '[]');

    this.isAuthenticated.set(authStatus === 'true');
    this.userEnrollments.set(enrollments);

    this.loadInitialActivities();
  }

  // Métodos del componente
  loadInitialActivities() {
    this.loading.set(true);
    this.paginatorOptions.currentPage = 0;
    this.actividadService.getAll(this.paginatorOptions.pageSize, 'titulo', 'asc', this.paginatorOptions.currentPage, '').subscribe(resp => {
      this.displayedActivities.set(resp.data);
      this.paginatorOptions.pageLength = resp.totalRecords;
      this.hasMore.set(this.displayedActivities().length < resp.totalRecords);
      this.loading.set(false);
    });
  }

  loadMoreActivities() {
    if (this.loading() || !this.hasMore()) return;

    this.loading.set(true);
    this.paginatorOptions.currentPage++;
    this.actividadService.getAll(this.paginatorOptions.pageSize, 'titulo', 'asc', this.paginatorOptions.currentPage, '').subscribe(resp => {
      this.displayedActivities.set([...this.displayedActivities(), ...resp.data]);
      this.hasMore.set(this.displayedActivities().length < resp.totalRecords);
      this.loading.set(false);
    });
  }

  setSearchQuery(query: string) {
    this.searchQuery.set(query);
  }

  setFilters(newFilters: any) {
    this.filters.set(newFilters);
  }

  setSortBy(newSortBy: string) {
    this.sortBy.set(newSortBy);
  }

  async handleEnroll(activity: Activity) {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login-registration']);
      return;
    }

    if (this.userEnrollments().includes(activity.id)) {
      this.enrollmentMessage.set(`Ya estás inscrito en "${activity.title}".`);
      setTimeout(() => this.hideEnrollmentMessage(), 3000);
      return;
    }

    const newEnrollments = [...this.userEnrollments(), activity.id];
    //this.userEnrollments.set(newEnrollments);
    //localStorage.setItem('userEnrollments', JSON.stringify(newEnrollments));

    var user = this.auth.currentUser

    console.log(user)

    const request: InscripcionRequest = {
      idUsuario: user!.id,
      idActividad: activity.id,
    }

    try {
      const response = await firstValueFrom(
        this.inscripcionService.PostCreate(request)
      );

      if(response.isSuccess){
        const updatedActivities = this.displayedActivities().map(act =>
          act.id === activity.id ? { ...act, enrolled: act.enrolled + 1 } : act
        );
        
        this.userEnrollments.set(newEnrollments);
        this.displayedActivities.set(updatedActivities);
        
        this.isDetailModalOpen.set(false);

        this.isEnrollmentError.set(false);
        this.enrollmentMessage.set(`¡Te has inscrito exitosamente en "${activity.title}"!`);
        setTimeout(() => this.hideEnrollmentMessage(), 3000);
      }else{
        this.isEnrollmentError.set(true);
        this.enrollmentMessage.set(`Error al inscribirte en la actividad "${activity.title}".`);setTimeout(() => this.hideEnrollmentMessage(), 3000)
      }      
    } catch (error) {
      this.isEnrollmentError.set(true);
      this.enrollmentMessage.set(`Error al inscribirte en la actividad "${activity.title}".`);
      console.error('Error en inscripción:', error);
    }
  }

  hideEnrollmentMessage() {
    this.enrollmentMessage.set(null);
  }

  handleViewDetails(activity: Activity) {
    this.selectedActivity.set(activity);
    this.isDetailModalOpen.set(true);
  }

  handleToggleFilterPanel() {
    this.isFilterPanelOpen.update(val => !val);
  }

  handleCloseDetailsModal() {
    this.isDetailModalOpen.set(false);
  }

  handleToggleMyEnrollments() {
    this.showMyEnrollments.update(val => !val);
  }
}