import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { Zap, Users } from 'lucide-angular';
import { LoginForm } from '../../login-registration/components/login-form/login-form';
import { RegistrationForm } from '../../login-registration/components/registration-form/registration-form';
import { AuthTabs } from '../../login-registration/components/auth-tabs/auth-tabs';

@Component({
  selector: 'app-login-registration',
  imports: [
    LucideAngularModule,
    LoginForm,
    RegistrationForm,
    AuthTabs
  ],
  templateUrl: './login-registration.html',
  styleUrl: './login-registration.css'
})
export class LoginRegistration {
  activeTab: 'login' | 'register' = 'login';

  readonly icons = {
    zap: Zap,
    users: Users
  };

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is already authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
      this.router.navigate(['/user-dashboard']);
    }
  }

  handleTabChange(tab: 'login' | 'register'): void {
    this.activeTab = tab;
    console.log(`Active tab changed to: ${this.activeTab}`);
  }

  handleAuthSuccess(): void {
    // Redirect to dashboard after successful authentication
    this.router.navigate(['/user-dashboard']);
  }

  handleLogoClick(): void {
    this.router.navigate(['/congress-homepage']);
  }

}
