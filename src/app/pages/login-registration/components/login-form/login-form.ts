import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { Check, LucideAngularModule } from 'lucide-angular';
import { AlertCircle, Eye, EyeOff, LogIn, UserPlus } from 'lucide-angular';
import { Button } from '../../../../shared/components/reusables/button/button';
import { InputComponent } from '../../../../shared/components/reusables/input/input';
import { CheckPointComponent } from '../../../../shared/components/reusables/check-point-component/check-point-component';
import { Auth } from '../../services/auth';
import { LoginRequest } from '../../models/login-request.interface';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { PasswordRecoveryForm } from '../../../../shared/components/reusables/password-recovery-form/password-recovery-form';
import { NotificationsAlert } from '../../../../shared/components/reusables/notifications-alert/notifications-alert';
import { NotificacionService } from '../../../../shared/services/notificacion-service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login-form',
  imports: [
    CommonModule,
    LucideAngularModule,
    Button,
    InputComponent,
    CheckPointComponent,
    PasswordRecoveryForm,
    NotificationsAlert
  ],
  templateUrl: './login-form.html',
  styleUrl: './login-form.css'
})
export class LoginForm {
  @Output() onSuccess = new EventEmitter<void>();

  readonly currentView = signal<'login' | 'recovery'>('login');
  //currentView: 'login' | 'recovery' = 'login';

  readonly icons = {
    alertCircle: AlertCircle,
    eye: Eye,
    eyeOff: EyeOff,
    logIn: LogIn,
    userPlus: UserPlus
  };

  private readonly authService = inject(Auth)
  public readonly notificacionService = inject(NotificacionService)


  formData = {
    email: '',
    password: '',
    rememberMe: false
  };
  errors: any = {};
  isLoading: boolean = false;
  showPassword: boolean = false;

  // private mockCredentials = {
  //   'admin@techcongress.edu': { password: 'admin123', role: 'admin', name: 'Dr. María González' },
  //   'estudiante@universidad.edu': { password: 'student123', role: 'student', name: 'Carlos Rodríguez' },
  //   'participante@gmail.com': { password: 'external123', role: 'external', name: 'Ana Martínez' }
  // };

  handleInputChange(name: string, value: any): void {
    if (this.errors[name]) {
      this.errors = { ...this.errors, [name]: '' };
    }
    (this.formData as any)[name] = value;
  }

  validateForm(): boolean {
    const newErrors: any = {};
    const emailRegex = /\S+@\S+\.\S+/;

    if (!this.formData.email) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!emailRegex.test(this.formData.email)) {
      newErrors.email = 'Ingrese un correo electrónico válido';
    }

    if (!this.formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (this.formData.password.length < 1) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    this.errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  async handleSubmit(event?: Event): Promise<void> {
    
    if (!this.validateForm()) {
      return;
    }
    
    event?.preventDefault()

    this.isLoading = true;
    this.errors = {};

    try {
      const dataLogin ={
        email: this.formData.email,
        password: this.formData.password
      }

      await this.login(dataLogin)

      this.onSuccess.emit();

    } catch (error: any) {
      if (error instanceof HttpErrorResponse) {
        const apiResponse = error.error;

        if (apiResponse && apiResponse.message) {
            this.errors.general = apiResponse.message;
        } else {
            this.errors.general = 'Ha ocurrido un error en el servidor.';
        }
      } else {
        this.errors.general = 'Error de conexión. Inténtalo de nuevo.';
      }
    } finally {
      this.isLoading = false;
    }
  }

  async login(request: LoginRequest): Promise<void> {
    const response = await firstValueFrom(
      this.authService.login(request)
    );

    if(response.isSuccess){
      const token = this.authService.userToken;
      if (!token) { return; }

      localStorage.setItem('isAuthenticated', 'true');
      var dataUser = JSON.parse(atob(token.split(".")[1]));
      
      localStorage.setItem('userData', JSON.stringify({
        email: this.formData.email,
        name: `${dataUser.given_name} ${dataUser.family_name}`.trim(),
        role: 'credentials.role'
      }));

    } else {
        throw new Error(response.message);
    }
  }

  handleForgotPassword(): void {
    this.currentView.set('recovery');
  }

  handleRecoverySuccess() {
    this.notificacionService.show('Contraseña actualizada exitosamente.', 'success');

    console.log(this.notificacionService.message())
    this.currentView.set('login');
  }
}
