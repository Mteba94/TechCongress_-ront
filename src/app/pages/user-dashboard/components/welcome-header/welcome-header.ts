import { Component, inject, Input } from '@angular/core';
import { LucideAngularModule, MapPin, User, Zap } from 'lucide-angular';
import { Image } from '../../../../shared/components/reusables/image/image';
import { Auth } from '../../../login-registration/services/auth';
import { School } from '../../services/school';
import { BaseApiResponse } from '../../../../shared/models/reusables/base-api-response.interface';
import { SchoolByIdResp } from '../../models/schoolById-resp.interface';
import { map, Subscription } from 'rxjs';

interface UserData {
  name: string;
  avatar?: string;
  participantId: string;
}

@Component({
  selector: 'app-welcome-header',
  imports: [
    LucideAngularModule,
    Image
  ],
  templateUrl: './welcome-header.html',
  styleUrl: './welcome-header.css'
})
export class WelcomeHeader {
  public user: UserData | null = null;
  public currentTime: Date = new Date();
  private timer: any;
  private schoolSubscription: Subscription | null = null;

  private readonly authService = inject(Auth)
  private readonly schoolService = inject(School)

  schoolId: number | null = null;
  public schoolName: string | null = null; 

  public icons = {
    user: User,
    mapPin: MapPin,
    zap: Zap
  };

  ngOnInit(): void {
    this.loadUserData();

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
  }

  private loadUserData(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      this.user = JSON.parse(userData);
    }

    const token = this.authService.userToken;

    var dataUser = JSON.parse(atob(token.split(".")[1]));
    this.schoolId = dataUser.schoolId;
    this.loadSchoolName();
  }

  private loadSchoolName(): void {
    // Si ya hay una suscripción activa, desuscribirla para evitar errores
    if (this.schoolSubscription) {
        this.schoolSubscription.unsubscribe();
    }
    if (this.schoolId !== null) {
      this.schoolSubscription = this.schoolService.getSelectSchool(this.schoolId)
        .subscribe({
          next: (resp: BaseApiResponse<SchoolByIdResp>) => {
            if (resp.isSuccess) {
              this.schoolName = resp.data.schoolName;
              console.log(resp.data.schoolName)
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
