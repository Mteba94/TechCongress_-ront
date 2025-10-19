import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Header } from '../../../shared/components/layout/header/header';
import { RegistrationCallToAction } from '../../../shared/components/reusables/registration-call-to-action/registration-call-to-action';
import { Breadcrumbs } from '../../../shared/components/reusables/breadcrumbs/breadcrumbs';
import { WelcomeHeader } from '../../user-dashboard/components/welcome-header/welcome-header';
import { QuickStats } from '../../user-dashboard/components/quick-stats/quick-stats';
import { Auth } from '../../login-registration/services/auth';
import { MyEnrollments } from '../../user-dashboard/components/my-enrollments/my-enrollments';
import { CertificatesSection } from '../../user-dashboard/components/certificates-section/certificates-section';
import { CurrentUser } from '../../login-registration/models/user-resp.interface';
import { CommonModule } from '@angular/common';
import { QRCodeCard } from '../../user-dashboard/components/qrcode-card/qrcode-card';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    Header,
    RegistrationCallToAction,
    Breadcrumbs,
    WelcomeHeader,
    QuickStats,
    MyEnrollments,
    CertificatesSection,
    QRCodeCard
  ],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css'
})
export class UserDashboard implements OnInit {
  isAuthenticated = signal(false);
  isLoading = signal(true);
  isAdmin = signal(false);
  user = signal<CurrentUser | null>(null);

  private readonly router = inject(Router);
  private readonly authService = inject(Auth);

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user.set(user);
      this.isAuthenticated.set(!!user);
      this.isAdmin.set(user?.role?.toLocaleLowerCase() === 'administrador');

      if (!user) {
        this.router.navigate(['/login-registration']);
        return;
      }

      if (this.isAdmin()) {
        this.router.navigate(['/admin-dashboard']); // Redirect admin to admin dashboard
        return;
      }
      this.isLoading.set(false);
    });
  }

  handleLoginRedirect(): void {
    this.router.navigate(['/login-registration']);
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}
