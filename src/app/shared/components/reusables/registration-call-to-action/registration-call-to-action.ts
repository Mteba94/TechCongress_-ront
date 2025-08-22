import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { ArrowRight, Calendar, LucideAngularModule, UserPlus, X, Zap } from 'lucide-angular';
import { Button } from '../button/button';
import { filter, Subscription } from 'rxjs';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-registration-call-to-action',
  imports: [
    CommonModule,
    LucideAngularModule,
    Button
  ],
  templateUrl: './registration-call-to-action.html',
  styleUrl: './registration-call-to-action.css'
})
export class RegistrationCallToAction {
  isAuthenticated = false;
  isVisible = true;
  isSticky = false;
  private routerSubscription!: Subscription;
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  icons = {
    x: X,
    zap: Zap,
    arrowRight: ArrowRight,
    calendar: Calendar,
    userPlus: UserPlus,
  };

  ngOnInit(): void {
    this.checkVisibilityAndAuth();

    // Revisa la visibilidad cada vez que cambia la ruta
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkVisibilityAndAuth();
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  // Escuchar el evento de scroll para el CTA pegajoso
  @HostListener('window:scroll')
  onScroll(): void {
    this.isSticky = window.scrollY > 200;
  }

  private checkVisibilityAndAuth(): void {
    const authStatus = localStorage.getItem('isAuthenticated');
    this.isAuthenticated = authStatus === 'true';

    const hiddenPages = ['/login-registration', '/user-dashboard'];
    const currentPath = this.router.url;
    
    // El CTA debe ser visible si no estás en una página oculta Y si no estás autenticado
    this.isVisible = !hiddenPages.includes(currentPath) && authStatus !== 'true';

    // Si ya fue descartado, tampoco debe ser visible
    const isDismissed = localStorage.getItem('ctaDismissed');
    if (isDismissed === 'true') {
        this.isVisible = false;
    }
  }

  handleRegistration(): void {
    this.router.navigate(['/login-registration']);
  }

  handleDismiss(): void {
    this.isVisible = false;
    localStorage.setItem('ctaDismissed', 'true');
  }

  isTopBannerVisible(): boolean {
    const currentPath = this.router.url;
    return currentPath.includes('/congress-homepage') || currentPath.includes('/workshop-activity-catalog');
  }
}
