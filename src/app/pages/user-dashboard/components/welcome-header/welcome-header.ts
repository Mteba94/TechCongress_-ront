import { Component } from '@angular/core';
import { LucideAngularModule, MapPin, User, Zap } from 'lucide-angular';
import { Image } from '../../../../shared/components/reusables/image/image';

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
  }

  private loadUserData(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      this.user = JSON.parse(userData);
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
