import { Component, inject, signal } from '@angular/core';
import { Header } from '../../../shared/components/layout/header/header';
import { Breadcrumbs } from '../../../shared/components/reusables/breadcrumbs/breadcrumbs';
import { Clock, Loader, LucideAngularModule, Shield } from 'lucide-angular';
import { Button } from '../../../shared/components/reusables/button/button';
import { AdminNavigation } from '../../admin-dashboard/components/admin-navigation/admin-navigation';
import { Auth } from '../../login-registration/services/auth';
import { UserRole } from '../../login-registration/services/user-role';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UserLog } from '../../../shared/models/commons/user.interface';
import { MetricsCards } from '../../admin-dashboard/components/metrics-cards/metrics-cards';



interface Metric {
  title: string;
  value: string;
  change: string;
  icon: string;
  color: string;
}

interface ActivityItem {
  time: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    Header,
    Breadcrumbs,
    LucideAngularModule,
    Button,
    AdminNavigation,
    MetricsCards
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard {
  readonly icons = {
    shield: Shield,
    clock: Clock,
    loader: Loader
  }

  private readonly authService = inject(Auth)
  private readonly router = inject(Router)
  
  //user = signal<User | null | undefined>(undefined);
  user: UserLog | null = null;
  selectedTimeRange = signal<string>('7d');
  refreshing = signal<boolean>(false);
  isLoading = true;

  // --- Data de Configuración y Mock (Reemplaza a los datos que vendrían de un servicio) ---
  timeRanges = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' }
  ];

  metrics = signal<Metric[]>([
    { title: 'Usuarios Activos', value: '4,521', change: '+12.5%', icon: 'Users', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' },
    { title: 'Ingresos', value: '$85,300', change: '+8.1%', icon: 'DollarSign', color: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' },
    { title: 'Cargas de CPU', value: '55%', change: '-3.2%', icon: 'Activity', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400' },
    { title: 'Errores Críticos', value: '14', change: '+25.0%', icon: 'AlertTriangle', color: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400' },
  ]);

  recentActivity = signal<ActivityItem[]>([
    { time: 'hace 5 min', description: 'Usuario John Doe (ID: 101) creado exitosamente.', icon: 'UserPlus' },
    { time: 'hace 30 min', description: 'Configuración global de API KEY actualizada por Jane Smith.', icon: 'Settings' },
    { time: 'hace 2 horas', description: 'Generación del informe mensual de rendimiento iniciada.', icon: 'FileText' },
    { time: 'hace 1 día', description: 'Sistema de caché purgado automáticamente.', icon: 'Zap' },
  ]);

  // --- Hook de Ciclo de Vida (Reemplaza a useEffect con dependencia []) ---
  async ngOnInit() {
    //await this.checkAdminAccess();
  }

  private async checkAdminAccess() {
    try {
      // Obtener el usuario actual desde AuthService
      const currentUser = await firstValueFrom(this.authService.currentUser$);

      if (!currentUser) {
        // No autenticado → redirigir a login
        this.router.navigate(['/login-registration']);
        return;
      }

      // Verificar si el usuario es administrador
      if (currentUser.role?.toLowerCase() !== 'administrador') {
        // Redirigir a panel normal o mostrar mensaje de acceso denegado
        console.warn('Acceso denegado: el usuario no es administrador');
        this.router.navigate(['/user-dashboard']);
        return;
      }

      // Usuario admin válido → asignar datos
      this.user = {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        lastAccess: new Date().toLocaleDateString('es-ES')
      };
      this.isLoading = false;
    } catch (error) {
      console.error('Error verificando usuario admin:', error);
      this.router.navigate(['/login-registration']);
    } finally {
      this.isLoading = false;
    }
  }

  // --- Funciones de Eventos (Reemplaza a las funciones handleX de React) ---
  handleRefresh(): void {
    if (this.refreshing()) return;

    this.refreshing.set(true);
    //console.log('Iniciando actualización de datos para el rango:', this.selectedTimeRange());

    // Simular retraso de carga (como el setTimeout en React)
    setTimeout(() => {
      this.refreshing.set(false);
      //console.log('Datos actualizados.');
    }, 1500);
  }

  handleTimeRangeChange(range: string): void {
    this.selectedTimeRange.set(range);
    //console.log('Rango de tiempo seleccionado:', range);
  }
  
  simulateLogOut(): void {
      //localStorage.removeItem('userData');
      //this.user.set(null); // Esto dispara la vista de Acceso Denegado/Login
      //console.log('Sesión cerrada simuladamente.');
  }
}