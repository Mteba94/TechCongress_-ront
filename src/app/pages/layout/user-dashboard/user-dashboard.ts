import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Header } from '../../../shared/components/layout/header/header';
import { RegistrationCallToAction } from '../../../shared/components/reusables/registration-call-to-action/registration-call-to-action';
import { Breadcrumbs } from '../../../shared/components/reusables/breadcrumbs/breadcrumbs';
import { WelcomeHeader } from '../../user-dashboard/components/welcome-header/welcome-header';

@Component({
  selector: 'app-user-dashboard',
  imports: [
    Header,
    RegistrationCallToAction,
    Breadcrumbs,
    WelcomeHeader
  ],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css'
})
export class UserDashboard {
  isAuthenticated = false;
  isLoading = true;
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.checkAuthentication();
  }

  checkAuthentication(): void {
    const authStatus = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('userData');
    
    if (authStatus === 'true' && userData) {
      this.isAuthenticated = true;
    } else {
      // Redirigir a la página de login si no está autenticado
      this.router.navigate(['/login-registration']);
      return;
    }
    
    this.isLoading = false;
  }

  handleLoginRedirect(): void {
    this.router.navigate(['/login-registration']);
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}
