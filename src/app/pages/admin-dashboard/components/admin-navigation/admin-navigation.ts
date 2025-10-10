import { Component, signal, WritableSignal } from '@angular/core';
import { NavigationItem } from '../../models/navigationItems.interface';
import { Award, BarChart, Calendar, Clock, Database, ExternalLink, LucideAngularModule, Mic, Settings, Shield, TrendingUp, Trophy, Users } from 'lucide-angular';
import { Button } from '../../../../shared/components/reusables/button/button';

@Component({
  selector: 'app-admin-navigation',
  imports: [
    LucideAngularModule,
    Button
  ],
  templateUrl: './admin-navigation.html',
  styleUrl: './admin-navigation.css'
})
export class AdminNavigation {
  readonly icons ={
    externalLink: ExternalLink
  }
  activeSection: WritableSignal<string> = signal('dashboard');
  
  navigationItems: NavigationItem[] = [
    { 
      id: 'dashboard',
      label: 'Panel General',
      icon: BarChart,
      description: 'Vista general del sistema',
      badge: null 
    },
    { 
      id: 'users',
      label: 'Gestión de Usuarios',
      icon: Users,
      description: 'Administrar cuentas',
      badge: '125',
      href: '/user-management-system'
    },
    { 
      id: 'activity_logging',
      label: 'Registro de Actividades',
      icon: Shield,
      description: 'Auditoría y monitoreo',
      badge: '3',
      href: '/user-activity-logging-management'
    },
    { 
      id: 'activities', label: 'Gestión de Actividades', icon: Calendar, description: 'Talleres y competencias', badge: '8', href: '/activities-workshop-management' },
    { 
      id: 'speakers', label: 'Gestión de Ponentes', icon: Mic, description: 'Ponentes e instructores', badge: '24', href: '/speaker-instructor-management' },
    { id: 'catalog', label: 'Sistema de Catálogo', icon: Database, description: 'Gestión de contenido', badge: '156', href: '/catalog-management-system' },
    { 
      id: 'attendance', label: 'Control de Asistencia', icon: Clock, description: 'Reportes y seguimiento', badge: null, href: '/attendance-reports-dashboard' },
    { 
      id: 'certificates',
      label: 'Certificaciones',
      icon: Award,
      description: 'Generar y gestionar', badge: '45' },
    { 
      id: 'competitions',
      label: 'Competencias',
      icon: Trophy,
      description: 'Resultados y rankings',
      badge: null,
      href: '/competition-results-winners' 
    },
    { 
      id: 'analytics',
      label: 'Analíticas',
      icon: TrendingUp,
      description: 'Métricas avanzadas',
      badge: null
    },
    { 
      id: 'settings',
      label: 'Configuración',
      icon: Settings,
      description: 'Sistema y preferencias',
      badge: null
    }
  ];

  quickActions = [
    { label: 'Agregar Usuario', icon: 'UserPlus' },
    { label: 'Nuevo Evento', icon: 'CalendarPlus' },
    { label: 'Generar Reporte', icon: 'FileText' },
    { label: 'Exportar Datos', icon: 'Download' }
  ];

  // Datos para Estado del Sistema
  systemStatus = [
    { item: 'Servidor', state: 'Activo' },
    { item: 'Base de Datos', state: 'Conectada' },
    { item: 'API Externa', state: 'Lenta' },
    { item: 'Email', state: 'Funcionando' }
  ];

  /**
   * Maneja la navegación al hacer clic en un elemento.
   * Actualiza la sección activa y redirige si hay un 'href'.
   * @param item El elemento de navegación seleccionado.
   */
  handleNavigation(item: NavigationItem): void {
    // Actualiza el signal
    this.activeSection.set(item.id);
    
    // Si tiene un href, simula la navegación (como en el componente React original)
    if (item.href) {
      // Nota: En una aplicación Angular real, usarías el Router (router.navigate)
      // En este contexto de componente único, usamos window.location.href
      console.log(`Navegando a: ${item.href}`);
      // window.location.href = item.href; 
    }
  }

}
