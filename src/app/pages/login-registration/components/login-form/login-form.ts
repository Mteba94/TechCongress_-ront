import { Component, EventEmitter, Output } from '@angular/core';
import { Check, LucideAngularModule } from 'lucide-angular';
import { AlertCircle, Eye, EyeOff, LogIn, UserPlus } from 'lucide-angular';
import { Button } from '../../../../shared/components/reusables/button/button';
import { InputComponent } from '../../../../shared/components/reusables/input/input';
import { CheckPointComponent } from '../../../../shared/components/reusables/check-point-component/check-point-component';


@Component({
  selector: 'app-login-form',
  imports: [
    LucideAngularModule,
    Button,
    InputComponent,
    CheckPointComponent
  ],
  templateUrl: './login-form.html',
  styleUrl: './login-form.css'
})
export class LoginForm {
  @Output() onSuccess = new EventEmitter<void>();

  readonly icons = {
    alertCircle: AlertCircle,
    eye: Eye,
    eyeOff: EyeOff,
    logIn: LogIn,
    userPlus: UserPlus
  };

  formData = {
    email: '',
    password: '',
    rememberMe: false
  };
  errors: any = {};
  isLoading: boolean = false;
  showPassword: boolean = false;

  private mockCredentials = {
    'admin@techcongress.edu': { password: 'admin123', role: 'admin', name: 'Dr. María González' },
    'estudiante@universidad.edu': { password: 'student123', role: 'student', name: 'Carlos Rodríguez' },
    'participante@gmail.com': { password: 'external123', role: 'external', name: 'Ana Martínez' }
  };

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
    } else if (this.formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    this.errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  async handleSubmit(): Promise<void> {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errors = {};

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const credentials = this.mockCredentials[this.formData.email as keyof typeof this.mockCredentials];

      if (!credentials || credentials.password !== this.formData.password) {
        this.errors.general = `Credenciales incorrectas. Prueba con:\n• admin@techcongress.edu / admin123\n• estudiante@universidad.edu / student123\n• participante@gmail.com / external123`;
        return;
      }

      // Store authentication data
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userData', JSON.stringify({
        email: this.formData.email,
        name: credentials.name,
        role: credentials.role
      }));

      this.onSuccess.emit();
    } catch (error) {
      this.errors.general = 'Error de conexión. Inténtalo de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  handleForgotPassword(): void {
    alert('Funcionalidad de recuperación de contraseña próximamente disponible.');
  }
}
