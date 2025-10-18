import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Header } from '../../../shared/components/layout/header/header';
import { RegistrationCallToAction } from '../../../shared/components/reusables/registration-call-to-action/registration-call-to-action';
import { Breadcrumbs } from '../../../shared/components/reusables/breadcrumbs/breadcrumbs';
import { WelcomeHeader } from '../../user-dashboard/components/welcome-header/welcome-header';
import { QuickStats } from '../../user-dashboard/components/quick-stats/quick-stats';
import { firstValueFrom } from 'rxjs';
import { Auth } from '../../login-registration/services/auth';
import { MyEnrollments } from '../../user-dashboard/components/my-enrollments/my-enrollments';

@Component({
  selector: 'app-user-dashboard',
  imports: [
    Header,
    RegistrationCallToAction,
    Breadcrumbs,
    WelcomeHeader,
    QuickStats,
    MyEnrollments
  ],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css'
})
export class UserDashboard {
  isAuthenticated = false;
  isLoading = true;
  isAdmin = false;


  private readonly router = inject(Router);
  private readonly authService = inject(Auth)

  ngOnInit(): void {
    this.checkAuthentication();
  }

  private async checkAuthentication(): Promise<void> {
    try {
      const user = await firstValueFrom(this.authService.currentUser$)

      if(!user){
        this.router.navigate(['/login-registration']);
        return;
      }

      this.isAuthenticated = true;

      this.isAdmin = user.role?.toLocaleLowerCase() === 'administrador';

      if(this.isAdmin){
        this.router.navigate(['/user-dashboard']);
        return;
      }

    } catch (error) {
      this.router.navigate(['/login-registration']);
      return;
    }finally{
      this.isLoading = false;
    }
  }

  handleLoginRedirect(): void {
    this.router.navigate(['/login-registration']);
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}
