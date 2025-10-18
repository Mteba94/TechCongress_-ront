import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  Loader, User, Crown, AlertTriangle, Menu, Save, Download, Eye, UserX,
  Info, Lock, Bell, CreditCard, Shield, Settings, Mail, Phone, Key,
  LucideIconData
} from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { Header } from '../../../shared/components/layout/header/header';
import { Button } from '../../../shared/components/reusables/button/button';
import { Breadcrumbs } from '../../../shared/components/reusables/breadcrumbs/breadcrumbs';
import { Auth } from '../../login-registration/services/auth';
import { ProfileTab } from '../../user-settings-profile-management/components/profile-tab/profile-tab';
import { SecurityTab } from '../../user-settings-profile-management/components/security-tab/security-tab';

interface Tab {
  id: string;
  label: string;
  description: string;
  icon: LucideIconData;
}

@Component({
  selector: 'app-user-settings-profile-management',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    Header,
    Button,
    Breadcrumbs,
    ProfileTab,
    SecurityTab
  ],
  templateUrl: './user-settings-profile-management.html',
  styleUrl: './user-settings-profile-management.css'
})
export class UserSettingsProfileManagement implements OnInit {
  readonly icons = {
    Loader: Loader,
    User: User,
    Crown: Crown,
    AlertTriangle: AlertTriangle,
    Menu: Menu,
    Save: Save,
    Download: Download,
    Eye: Eye,
    UserX: UserX,
    Info: Info,
    Lock: Lock,
    Bell: Bell,
    CreditCard: CreditCard,
    Shield: Shield,
    Settings: Settings,
    Mail: Mail,
    Phone: Phone,
    Key: Key
  };

  private readonly authService = inject(Auth);

  user = signal<any>(null);

  hasUnsavedChanges = signal(false);
  showSidebar = signal(false);
  isLoading = signal(false);
  activeTab = signal('profile');

  settingsTabs = signal<Tab[]>([
    {
      id: 'profile',
      label: 'Gestión de Perfil',
      icon: User,
      description: 'Información personal, foto, datos institucionales'
    },
    // {
    //   id: 'preferences',
    //   label: 'Preferencias',
    //   icon: Settings,
    //   description: 'Idioma, zona horaria, frecuencia de emails'
    // },
    {
      id: 'security',
      label: 'Configuración de Seguridad',
      icon: Shield,
      description: 'Contraseña, autenticación de doble factor'
    },
    // {
    //   id: 'notifications',
    //   label: 'Notificaciones',
    //   icon: Bell,
    //   description: 'Alertas por email, notificaciones push'
    // }
  ]);

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user.set(user);
      console.log(user)
    });
  }

  setShowSidebar(value: boolean) {
    this.showSidebar.set(value);
  }

  handleSaveChanges() {
    this.isLoading.set(true);
    // Simulate API call
    setTimeout(() => {
      this.isLoading.set(false);
      this.hasUnsavedChanges.set(false);
      alert('Cambios guardados exitosamente!');
    }, 1500);
  }

  handleTabChange(tabId: string | undefined) {
    if (this.hasUnsavedChanges()) {
      if (window.confirm('Tienes cambios sin guardar. ¿Deseas continuar sin guardar?')) {
        if (tabId) {
          this.activeTab.set(tabId);
          this.hasUnsavedChanges.set(false);
        }
      }
    } else {
      if (tabId) {
        this.activeTab.set(tabId);
      }
    }
    this.showSidebar.set(false); // Close sidebar on mobile after selection
  }
}
