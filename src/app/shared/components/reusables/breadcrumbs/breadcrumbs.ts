import { Component, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ChevronRight, LucideAngularModule } from 'lucide-angular';
import { filter } from 'rxjs';

interface Breadcrumb {
  label: string;
  path: string;
}

@Component({
  selector: 'app-breadcrumbs',
  imports: [
    LucideAngularModule
  ],
  templateUrl: './breadcrumbs.html',
  styleUrl: './breadcrumbs.css'
})
export class Breadcrumbs {
  private readonly router = inject(Router);
  public currentBreadcrumbs: Breadcrumb[] = [];
  public icons = {
    chevronRight: ChevronRight
  };
  
  private breadcrumbMap: { [key: string]: Breadcrumb[] } = {
    '/congress-homepage': [
      { label: 'Inicio', path: '/congress-homepage' }
    ],
    '/workshop-activity-catalog': [
      { label: 'Inicio', path: '/congress-homepage' },
      { label: 'Actividades', path: '/workshop-activity-catalog' }
    ],
    '/user-dashboard': [
      { label: 'Inicio', path: '/congress-homepage' },
      { label: 'Mi Panel', path: '/user-dashboard' }
    ],
    '/competition-results-winners': [
      { label: 'Inicio', path: '/congress-homepage' },
      { label: 'Resultados', path: '/competition-results-winners' }
    ],
    '/attendance-reports-dashboard': [
      { label: 'Inicio', path: '/congress-homepage' },
      { label: 'Reportes', path: '/attendance-reports-dashboard' }
    ],
    '/login-registration': [
      { label: 'Inicio', path: '/congress-homepage' },
      { label: 'Acceder', path: '/login-registration' }
    ]
  };

  constructor() {
    this.currentBreadcrumbs = this.breadcrumbMap[this.router.url] || [
      { label: 'Inicio', path: '/congress-homepage' }
    ];

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentBreadcrumbs = this.breadcrumbMap[event.urlAfterRedirects] || [
        { label: 'Inicio', path: '/congress-homepage' }
      ];
    });
  }

  handleNavigation(path: string): void {
    this.router.navigateByUrl(path);
  }

  shouldShowBreadcrumbs(): boolean {
    return this.currentBreadcrumbs.length > 1;
  }
}
