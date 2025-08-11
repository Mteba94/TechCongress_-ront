import { Component } from '@angular/core';
import { Button } from '../../../../shared/components/reusables/button/button';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  LucideAngularModule,
  Calendar,
  MapPin,
  Users,
  Award,
  ChevronDown,
  UserPlus,
  ArrowDown
} from 'lucide-angular';

@Component({
  selector: 'app-hero',
  imports: [
    CommonModule,
    LucideAngularModule,
    Button
  ],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class Hero {
  readonly icons = {
    calendar: Calendar,
    mapPin: MapPin,
    users: Users,
    award: Award,
    chevronDown: ChevronDown,
    userPlus: UserPlus,
    arrowDown: ArrowDown
  };

  constructor(
    private router: Router
  ) {}

  handleRegistration(): void {
    this.router.navigate(['/login-registration']);
  }

  handleLearnMore(): void {
    const element = document.getElementById('congress-overview');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
