import { Component, inject, Input, OnInit, OnDestroy, signal } from '@angular/core';
import { LucideAngularModule, MapPin, User, Zap } from 'lucide-angular';
import { Image } from '../../../../shared/components/reusables/image/image';
import { Auth } from '../../../login-registration/services/auth';
import { School } from '../../services/school';
import { BaseApiResponse } from '../../../../shared/models/reusables/base-api-response.interface';
import { SchoolByIdResp } from '../../models/schoolById-resp.interface';
import { Subscription } from 'rxjs';
import { CurrentUser } from '../../../login-registration/models/user-resp.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome-header',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    Image
  ],
  templateUrl: './welcome-header.html',
  styleUrl: './welcome-header.css'
})
export class WelcomeHeader implements OnInit, OnDestroy {
  user = signal<CurrentUser | null>(null);
  public currentTime: Date = new Date();
  private timer: any;
  private schoolSubscription: Subscription | null = null;
  private authSubscription: Subscription | null = null;

  private readonly authService = inject(Auth);
  private readonly schoolService = inject(School);

  schoolId: number | null = null;
  public schoolName: string | null = null; 

  public icons = {
    user: User,
    mapPin: MapPin,
    zap: Zap
  };

  ngOnInit(): void {
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.user.set(user);
      if (user && user.id) {
        // Assuming schoolId is part of CurrentUser or can be derived
        // For now, let's assume schoolId is directly available or can be fetched
        // If schoolId is not in CurrentUser, you'd need another service call here
        // For this example, let's assume user.schoolId exists or is derived from user.id
        // If schoolId is part of JWT payload, it would be in user.schoolId
        // For now, we'll use a placeholder or assume it's part of the user object
        // If user.schoolId is not available, this part needs adjustment.
        // For now, let's use a dummy schoolId or assume it's part of the user object.
        // Based on Auth.ts decodeToken, schoolId is not directly in CurrentUser.
        // It was in dataUser.schoolId from the token payload.
        // We need to get schoolId from the token payload again or pass it from parent.
        // For now, let's assume user.schoolId exists or we fetch it.
        // Re-reading Auth.ts, schoolId is not part of CurrentUser interface.
        // It was extracted from the token payload directly in loadUserData.
        // We need to re-extract schoolId from token or pass it from parent.
        // For now, let's use a placeholder or assume it's part of the user object.
        // Let's assume the parent (UserDashboard) passes schoolId as an input if needed.
        // Or, we can re-decode the token here to get schoolId.
        // For simplicity, let's re-decode the token here to get schoolId.
        const token = this.authService.userToken;
        if (token) {
          const payload = token.split('.')[1];
          if (payload) {
            const dataUser = JSON.parse(atob(payload));
            this.schoolId = dataUser.schoolId ? Number(dataUser.schoolId) : null; // Assuming schoolId is in payload
            this.loadSchoolName();
          }
        }
      } else {
        this.schoolId = null;
        this.schoolName = null;
      }
    });

    this.timer = setInterval(() => {
      this.currentTime = new Date();
    }, 60000);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }

    if (this.schoolSubscription) {
        this.schoolSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private loadSchoolName(): void {
    if (this.schoolSubscription) {
        this.schoolSubscription.unsubscribe();
    }
    if (this.schoolId !== null) {
      this.schoolSubscription = this.schoolService.getSelectSchool(this.schoolId)
        .subscribe({
          next: (resp: BaseApiResponse<SchoolByIdResp>) => {
            if (resp.isSuccess) {
              this.schoolName = resp.data.schoolName; // Assuming resp.data.nombre for school name
            } else {
              this.schoolName = null;
            }
          },
          error: (err) => {
            console.error('Error al obtener el nombre de la escuela:', err);
            this.schoolName = null;
          }
        });
    } else {
      this.schoolName = null; // Limpiar el nombre si no hay ID
    }
  }

  public getGreeting(): string {
    const hour = this.currentTime.getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  public formatDate(): string {
    return this.currentTime.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}
