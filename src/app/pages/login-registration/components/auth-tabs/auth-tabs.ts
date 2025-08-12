import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LogIn, LucideAngularModule, UserPlus } from 'lucide-angular';
import { Button } from '../../../../shared/components/reusables/button/button';

export interface Tab {
  id: 'login' | 'register';
  label: string;
  icon: string;
}

@Component({
  selector: 'app-auth-tabs',
  imports: [
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './auth-tabs.html',
  styleUrl: './auth-tabs.css'
})
export class AuthTabs {
  // Recibe la pestaña activa como un input
  @Input() activeTab: 'login' | 'register' = 'login';
  
  // Emite un evento cuando la pestaña cambia
  @Output() onTabChange = new EventEmitter<'login' | 'register'>();

  // Definimos los íconos importados
  readonly icons = { 
    login: LogIn,
    userPlus: UserPlus
  };

  // Datos para las pestañas
  tabs = [
    {
      id: 'login',
      label: 'Iniciar Sesión',
      icon: this.icons.login
    },
    {
      id: 'register',
      label: 'Registrarse',
      icon: this.icons.userPlus
    }
  ];

  // Método para manejar el cambio de pestaña
  selectTab(tabId: 'login' | 'register'): void {
    if (this.activeTab !== tabId) {
      this.onTabChange.emit(tabId);
    }
  }
}
