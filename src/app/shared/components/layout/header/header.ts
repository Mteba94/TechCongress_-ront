import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { 
  LucideAngularModule,
  Zap,
  Home,
  Activity,
  Award,
  ArrowRight,
  User,
  LogOut,
  LogIn,
  Menu,
  X,
  Calendar,
  Trophy,
  BarChart3
} from 'lucide-angular';
import { filter } from 'rxjs';
import { Button } from '../../reusables/button/button';
import { AuthenticatedUserMenu } from '../../reusables/authenticated-user-menu/authenticated-user-menu';
import { Auth } from '../../../../pages/login-registration/services/auth';


@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    LucideAngularModule,
    Button,
    AuthenticatedUserMenu
  ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  readonly icons = {
    zap: Zap,
    home: Home,
    activity: Activity,
    award: Award,
    arrowRight: ArrowRight,
    user: User,
    logOut: LogOut,
    logIn: LogIn,
    menu: Menu,
    x: X,
    calendar: Calendar,
    trophy: Trophy,
    barChart3: BarChart3
  };

  private readonly authService = inject(Auth)

  isAuthenticated = false;
  user: { name: string, email: string, role: string } | null = null;
  isMobileMenuOpen = false;
  currentPath = '';

  navigationItems = [
    { label: 'Inicio', path: '/congress-homepage', icon: this.icons.home, requiredAuth: false, requiredRole: null },
    { label: 'Actividades', path: '/workshop-activity-catalog', icon: this.icons.calendar, requiredAuth: false, requiredRole: null },
    { label: 'Mi Panel', path: '/user-dashboard', icon: this.icons.user, requiredAuth: true, requiredRole: null },
    { label: 'Resultados', path: '/competition-results-winners', icon: this.icons.trophy, requiredAuth: false, requiredRole: null },
    { label: 'Reportes', path: '/attendance-reports-dashboard', icon: this.icons.barChart3, requiredAuth: true, requiredRole: 'admin' }
  ];

  constructor(
    private router: Router
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentPath = event.urlAfterRedirects;
    });
  }

  ngOnInit(): void {
    const authStatus = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('userData');
    
    if (authStatus === 'true' && userData) {
      this.isAuthenticated = true;
      this.user = JSON.parse(userData);
    }
  }

  get filteredNavItems() {
    return this.navigationItems.filter(item => {
      if (item.requiredAuth && !this.isAuthenticated) return false;
      if (item.requiredRole && (!this.user || this.user.role !== item.requiredRole)) return false;
      return true;
    });
  }

  handleNavigation(path: string): void {
    this.router.navigate([path]);
    this.isMobileMenuOpen = false;
  }

  handleLogin(): void {
    this.router.navigate(['/login-registration']);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  isActivePath(path: string): boolean {
    return this.currentPath === path;
  }

  handleLogout(): void {
    this.isAuthenticated = false;
    this.user = null;
    this.isMobileMenuOpen = false;
    this.authService.logout()
  }
}
