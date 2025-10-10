import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { Zap, Users } from 'lucide-angular';
import { LoginForm } from '../../login-registration/components/login-form/login-form';
import { RegistrationForm } from '../../login-registration/components/registration-form/registration-form';
import { AuthTabs } from '../../login-registration/components/auth-tabs/auth-tabs';
import { CongressHighlights } from '../../login-registration/components/congress-highlights/congress-highlights';
import { Auth } from '../../login-registration/services/auth';

@Component({
  selector: 'app-login-registration',
  imports: [
    LucideAngularModule,
    LoginForm,
    RegistrationForm,
    AuthTabs,
    CongressHighlights
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

  private readonly authService = inject(Auth)


  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.router.navigate(['/user-dashboard']);
      }
    });
  }

  handleTabChange(tab: 'login' | 'register'): void {
    this.activeTab = tab;
    //console.log(`Active tab changed to: ${this.activeTab}`);
  }

  handleAuthSuccess(): void {
    // Redirect to dashboard after successful authentication
    this.router.navigate(['/user-dashboard']);
  }

  handleLogoClick(): void {
    this.router.navigate(['/congress-homepage']);
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

}
