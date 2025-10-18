import { Component, OnInit, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  Shield, Key, Smartphone, ShieldOff, Monitor, LogOut, CheckCircle, AlertTriangle,
  LucideIconData
} from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { InputComponent } from '../../../../shared/components/reusables/input/input';
import { Button } from '../../../../shared/components/reusables/button/button';
import { Checkbox } from '../../../../shared/components/reusables/checkbox/checkbox';

interface SecurityData {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  dataEncryption: boolean;
}

interface ActiveSession {
  id: number;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
  ip: string;
}

@Component({
  selector: 'app-security-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    InputComponent,
    Button,
    //Checkbox
  ],
  templateUrl: './security-tab.html',
  styleUrl: './security-tab.css'
})
export class SecurityTab implements OnInit {
  @Input() user: any;
  @Output() onDataChange = new EventEmitter<void>();

  readonly icons = {
    Shield: Shield,
    Key: Key,
    Smartphone: Smartphone,
    ShieldOff: ShieldOff,
    Monitor: Monitor,
    LogOut: LogOut,
    CheckCircle: CheckCircle,
    AlertTriangle: AlertTriangle
  };

  securityData = signal<SecurityData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    loginNotifications: true,
    dataEncryption: true
  });
  activeSessions = signal<ActiveSession[]>([
    {
      id: 1,
      device: 'Chrome en Windows',
      location: 'Bogotá, Colombia',
      lastActive: '2025-01-20 14:30',
      current: true,
      ip: '192.168.1.100'
    },
    {
      id: 2,
      device: 'Safari en iPhone',
      location: 'Bogotá, Colombia',
      lastActive: '2025-01-19 09:15',
      current: false,
      ip: '192.168.1.101'
    }
  ]);
  isChangingPassword = signal(false);
  showTwoFactorSetup = signal(false);

  ngOnInit(): void {
    if (this.user) {
      this.securityData.update(prev => ({
        ...prev,
        twoFactorEnabled: this.user.twoFactorEnabled || false,
        loginNotifications: this.user.loginNotifications || true,
        dataEncryption: this.user.dataEncryption || true
      }));
    }
  }

  handleInputChange(field: keyof SecurityData, value: Event | boolean): void {
    this.securityData.update(prev => ({
      ...prev,
      [field]: value
    }));
    this.onDataChange.emit();
  }

  async handlePasswordChange(event: Event): Promise<void> {
    event.preventDefault();
    this.isChangingPassword.set(true);
    
    try {
      const data = this.securityData();
      if (data.newPassword !== data.confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.securityData.update(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      alert('Contraseña actualizada exitosamente');
      this.onDataChange.emit();
    } catch (error) {
      alert('Error al cambiar la contraseña');
    } finally {
      this.isChangingPassword.set(false);
    }
  }

  handleLogoutSession(sessionId: number): void {
    if (window.confirm('¿Estás seguro de que deseas cerrar esta sesión?')) {
      this.activeSessions.update(prev => prev.filter(session => session.id !== sessionId));
      this.onDataChange.emit();
    }
  }

  handleToggleTwoFactor(): void {
    const twoFactorEnabled = this.securityData().twoFactorEnabled;
    if (!twoFactorEnabled) {
      this.showTwoFactorSetup.set(true);
      // In a real app, you'd trigger a flow to set up 2FA
      alert('Configurar autenticación de dos factores (simulado)');
    } else {
      if (window.confirm('¿Estás seguro de que deseas desactivar la autenticación de dos factores?')) {
        this.securityData.update(prev => ({ ...prev, twoFactorEnabled: false }));
        this.onDataChange.emit();
      }
    }
  }
}