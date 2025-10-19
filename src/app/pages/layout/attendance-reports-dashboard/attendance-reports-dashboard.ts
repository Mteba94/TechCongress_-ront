import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Search, Download, Users, Activity, XCircle, Clock, TrendingUp, TrendingDown, Shield, ArrowLeft, BarChart3, RefreshCw, Zap, LucideIconData, CheckCircle } from 'lucide-angular';
import { SelectComponent, SelectOption } from '../../../shared/components/reusables/select-component/select-component';
import { Button } from '../../../shared/components/reusables/button/button';
import { Attendance } from '../../attendance-reports-dashboard/services/attendance';
import { metricsData, chartsData, attendanceData } from '../../attendance-reports-dashboard/models/attendance-resp.interface';
import { finalize, firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { Auth } from '../../login-registration/services/auth';
import { UserLog } from '../../../shared/models/commons/user.interface';
import { Header } from '../../../shared/components/layout/header/header';
import { RegistrationCallToAction } from '../../../shared/components/reusables/registration-call-to-action/registration-call-to-action';
import { Breadcrumbs } from '../../../shared/components/reusables/breadcrumbs/breadcrumbs';
import { AttendanceMetricsCards } from '../../attendance-reports-dashboard/components/attendance-metrics-cards/attendance-metrics-cards';
import { AttendanceCharts } from '../../attendance-reports-dashboard/components/attendance-charts/attendance-charts';
import { AttendanceDataTable } from '../../attendance-reports-dashboard/components/attendance-data-table/attendance-data-table';
import { AttendanceDetailDisplay } from '../../attendance-reports-dashboard/models/attendance-detail-display.interface';

interface MetricCardDisplay {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: LucideIconData;
  iconColor: string;
  bgColor: string;
  description: string;
}

interface ChartDataDisplay {
  attendanceByActivity: any;
  attendanceTrend: any;
  demographicsData: any;
}

@Component({
  selector: 'app-attendance-reports-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    // InputComponent,
    // SelectComponent,
    Button,
    Header,
    RegistrationCallToAction,
    Breadcrumbs,
    AttendanceMetricsCards,
    AttendanceCharts,
    AttendanceDataTable
  ],
  templateUrl: './attendance-reports-dashboard.html',
  styleUrl: './attendance-reports-dashboard.css'
})
export class AttendanceReportsDashboard implements OnInit {
  searchTerm = signal('');
  selectedActivity = signal('all');
  selectedStatus = signal('all');

  activityOptions = signal<SelectOption[]>([{
    value: 'all',
    label: 'Todas las Actividades'
  }
  ]);

  statusOptions = signal<SelectOption[]>([{
    value: 'all',
    label: 'Todos los Estados'
  },
  {
    value: 'presente',
    label: 'Presente'
  },
  {
    value: 'ausente',
    label: 'Ausente'
  },
  ]);

  metrics = signal<MetricCardDisplay[]>([]);
  chartsData = signal<ChartDataDisplay | null>(null);
  attendanceDetails = signal<AttendanceDetailDisplay[]>([]);

  loadingMetrics = signal(true);
  loadingCharts = signal(true);
  loadingDetails = signal(true);

  isAuthenticated = signal(false);
  user = signal<UserLog | null>(null);

  private readonly attendanceService = inject(Attendance);
  private readonly router = inject(Router);
  private readonly authService = inject(Auth);

  readonly icons = {
    Search: Search,
    Download: Download,
    Users: Users,
    Activity: Activity,
    XCircle: XCircle,
    Clock: Clock,
    TrendingUp: TrendingUp,
    TrendingDown: TrendingDown,
    Shield: Shield,
    ArrowLeft: ArrowLeft,
    BarChart3: BarChart3,
    RefreshCw: RefreshCw,
    Zap: Zap
  };

  ngOnInit(): void {
    //this.isAuthenticated.set(true);
    //this.checkAdminAccess();
    this.fetchMetrics();
    this.fetchChartsData();
    this.fetchAttendanceDetails();
  }

  private async checkAdminAccess() {
    try {
      const currentUser = await firstValueFrom(this.authService.currentUser$);

      if (!currentUser) {
        this.router.navigate(['/login-registration']);
        return;
      }

      this.isAuthenticated.set(true);
      if (currentUser.role?.toLowerCase() !== 'administrador') {
        console.warn('Acceso denegado: el usuario no es administrador');
        this.router.navigate(['/user-dashboard']);
        return;
      }

      this.user.set({
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        lastAccess: new Date().toLocaleDateString('es-ES')
      });
    } catch (error) {
      console.error('Error verificando usuario admin:', error);
      this.router.navigate(['/login-registration']);
    }
  }


  fetchMetrics(): void {
    this.loadingMetrics.set(true);
    this.attendanceService.getMetricsData()
      .pipe(finalize(() => this.loadingMetrics.set(false)))
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.data) {
            const rawData: metricsData = response.data;
            this.metrics.set([
              {
                id: 'total-attendance',
                title: 'Asistencia Total',
                value: rawData.totalAttendance.toLocaleString(),
                change: '', // Placeholder, ideally from API
                changeType: 'positive',
                icon: Users,
                iconColor: 'text-blue-600',
                bgColor: 'bg-blue-500/10',
                description: 'Total de registros de asistencia'
              },
              {
                id: 'avg-attendance',
                title: 'Promedio por Actividad',
                value: `${rawData.avgParticipation.toFixed(1)}%`,
                change: '', // Placeholder
                changeType: 'positive',
                icon: CheckCircle,
                iconColor: 'text-green-600',
                bgColor: 'bg-green-500/10',
                description: 'Asistencia promedio por evento'
              },
              {
                id: 'missed-attendance',
                title: 'Actividades Activas',
                value: rawData.activeSessions.toLocaleString(),
                change: '', // Placeholder
                changeType: 'negative',
                icon: Activity,
                iconColor: 'text-red-600',
                bgColor: 'bg-red-500/10',
                description: 'Sesiones activas actualmente'
              },
              {
                id: 'on-time-arrival',
                title: 'Tasa de Completitud',
                value: `${rawData.completionRate.toFixed(1)}%`,
                change: '', // Placeholder
                changeType: 'positive',
                icon: TrendingUp,
                iconColor: 'text-purple-600',
                bgColor: 'bg-purple-500/10',
                description: 'Porcentaje de actividades completadas'
              },
            ]);
          }
        },
        error: (err) => {
          console.error('Error fetching metrics:', err);
          this.metrics.set([]);
        }
      });
  }

  fetchChartsData(): void {
    this.loadingCharts.set(true);
    this.attendanceService.getChartsData()
      .pipe(finalize(() => this.loadingCharts.set(false)))
      .subscribe({
        next: (response) => {
          console.log(response);
          if (response.isSuccess && response.data) {
            const rawCharts = response.data; // Now expects a single object
            this.chartsData.set({
              attendanceByActivity: rawCharts.activityData,
              attendanceTrend: rawCharts.hourlyData,
              demographicsData: rawCharts.demographicsData// Using hourlyData as a placeholder for trend
            });
          }
        },
        error: (err) => {
          console.error('Error fetching charts data:', err);
          this.chartsData.set(null);
        }
      });
  }

  fetchAttendanceDetails(): void {
    this.loadingDetails.set(true);
    this.attendanceService.getAttendanceData()
      .pipe(finalize(() => this.loadingDetails.set(false)))
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.data) {
            this.attendanceDetails.set(response.data.map(detail => ({
                id: detail.id.toString() ?? '', 
                participant: detail.participantName ?? 'N/A', // Nombre que la tabla usará para filtrar
                date: new Date(detail.checkInTime).toLocaleDateString(),
                time: new Date(detail.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                // 2. Campos Directos con Null Safety
                email: detail.email ?? '',
                activity: detail.activity ?? 'Sin Actividad',
                activityType: detail.activityType ?? 'N/A',
                checkInTime: detail.checkInTime, // Se mantiene para ordenación
                status: detail.status ?? 'Desconocido',
                studentType: detail.studentType ?? 'N/A',
                institution: detail.institution ?? 'Sin Institución',
            } as AttendanceDetailDisplay))); // <-- Cast (as) para asegurar el tipado
          }
        },
        error: (err) => {
          console.error('Error fetching attendance details:', err);
          this.attendanceDetails.set([]);
        }
      });
  }

  navigateToUserDashboard(): void {
    this.router.navigate(['/user-dashboard']);
  }

  handleSearchTermChange(term: string): void {
    this.searchTerm.set(term);
    // Implement filtering logic here if needed
  }

  handleActivityChange(activityId: string): void {
    this.selectedActivity.set(activityId);
    // Implement filtering logic here if needed
  }

  handleStatusChange(status: string): void {
    this.selectedStatus.set(status);
    // Implement filtering logic here if needed
  }

  handleExport(type: Event): void {
    console.log(`Exporting data as ${type}...`);
    // Implement export logic here
  }

  refreshData(): void {
    this.fetchMetrics();
    this.fetchChartsData();
    this.fetchAttendanceDetails();
  }

  handleBulkAction(event: any): void {
    console.log('Bulk action:', event);
    // Implement bulk action logic here
  }

  handleFiltersChange(event: any): void {
    console.log('Filters changed:', event);
    // Implement filter change logic here
  }

  handleToggleAutoRefresh(event: any): void {
    console.log('Toggle auto refresh:', event);
    // Implement auto refresh toggle logic here
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}
