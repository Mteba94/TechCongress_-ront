import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ArrowLeft, Home, LucideAngularModule } from 'lucide-angular';
import { Button } from '../../shared/components/reusables/button/button';

@Component({
  selector: 'app-not-found',
  imports: [
    CommonModule,
    LucideAngularModule,
    Button
  ],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css'
})
export class NotFound {
  // Define los iconos que usarás en la plantilla
  icons = {
    arrowLeft: ArrowLeft,
    home: Home
  };

  constructor(
    private router: Router
  ) {}

  goBack(): void {
    // Simula el botón "Go Back" de React
    window.history.back();
  }

  goHome(): void {
    // Simula el botón "Back to Home" de React
    this.router.navigateByUrl('/');
  }
}
