import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Eye, EyeOff, Info, Key, LucideAngularModule, Mail, Shield, UserPlus } from 'lucide-angular';
import { firstValueFrom, interval, Subscription } from 'rxjs';
import { InputComponent } from '../input/input';
import { Button } from '../button/button';
import { EmailVerification } from '../../../../pages/login-registration/components/email-verification/email-verification';
import { Codigo } from '../../../../pages/login-registration/services/codigo';
import { Auth } from '../../../../pages/login-registration/services/auth';
import { ToastrService } from 'ngx-toastr';
import { NotificationsAlert } from '../notifications-alert/notifications-alert';
import { NotificacionService } from '../../../services/notificacion-service';

type Step = 'email' | 'code' | 'newPassword';

type RecoveryErrors = {
  email?: string;
  verificationCode?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
};

@Component({
  selector: 'app-password-recovery-form',
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    InputComponent,
    Button,
    EmailVerification,
    //NotificationsAlert
  ],
  templateUrl: './password-recovery-form.html',
  styleUrl: './password-recovery-form.css'
})
export class PasswordRecoveryForm {
  readonly icons ={
    mail: Mail,
    shield: Shield,
    key: Key,
    eye: Eye,
    eyeOff: EyeOff,
    userPlus: UserPlus,
    info: Info
  }
  @Input() currentStep = signal<Step>('email');
  @Output() onBack = new EventEmitter<void>();
  @Output() onSuccess = new EventEmitter<void>();

  private readonly codigoService = inject(Codigo)
  private readonly authService = inject(Auth)
  private readonly toast = inject(ToastrService)
  public readonly notificacionService = inject(NotificacionService)

  enrollmentMessage = signal<string | null>(null);
  isEnrollmentError = signal<boolean>(false);

  // Estado del formulario
  //currentStep = signal<Step>('email');
  formData = signal({
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });

  hideEnrollmentMessage() {
    this.enrollmentMessage.set(null);
  }

  errors = signal<{ [key: string]: string }>({});
  isLoading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  resendCooldown = signal(0);

  registrationEmail: string = '';
  registrationPass: string = '';
  codeValidate: string = '';


  // ========== Handlers ==========
  handleInputChange(name: keyof ReturnType<typeof this.formData>, value: string) {
    this.formData.update(prev => ({ ...prev, [name]: value }));
    if (this.errors()[name]) {
      this.errors.update(prev => ({ ...prev, [name]: '' }));
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(prev => !prev);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(prev => !prev);
  }


  handleVerificationSuccess(code: string): void {
    this.codeValidate = code;
    //console.log(this.codeValidate)
    this.currentStep.set('newPassword');
  }

  handleBackToRegistration(): void {
    this.currentStep.set('email');
  }

  // ========== Validaciones ==========
  private validateEmail(): boolean {
    const data = this.formData();
    const newErrors: any = {};

    if (!data.email) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = 'Ingrese un correo electrónico válido';
    }

    this.errors.set(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  private validateCode(): boolean {
    const data = this.formData();
    const newErrors: any = {};

    if (!data.verificationCode) {
      newErrors.verificationCode = 'El código de verificación es obligatorio';
    } else if (data.verificationCode.length !== 6) {
      newErrors.verificationCode = 'El código debe tener 6 dígitos';
    }

    this.errors.set(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  private validatePassword(): boolean {
    const data = this.formData();
    const newErrors: any = {};

    if (!data.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es obligatoria';
    } else if (data.newPassword.length < 8) {
      newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (data.newPassword !== data.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    this.errors.set(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ========== Flujos ==========
  async handleEmailSubmit() {
    if (!this.validateEmail()) return;
    this.isLoading.set(true);

    try {

      this.registrationEmail = this.formData().email;

      const ReqCodigo = {
          purpose: 'recovery',
          email: this.registrationEmail
        };
      //await new Promise(r => setTimeout(r, 2000));
       const codeResponse = await firstValueFrom(
          this.codigoService.CreateCode(ReqCodigo)
        );

      this.currentStep.set('code');
    } catch {
      this.errors.set({ email: 'Error al enviar el código. Inténtalo de nuevo.' });
    } finally {
      this.isLoading.set(false);
    }
  }

  async handlePasswordSubmit() {
    if (!this.validatePassword()) return;
    this.isLoading.set(true);

    try {
      // await new Promise(r => setTimeout(r, 2000));
      // sessionStorage.removeItem('recoveryCode');
      // sessionStorage.removeItem('recoveryEmail');
      // this.onSuccess.emit();

      //console.log(this.codeValidate)
      
       const passwordResponse = await firstValueFrom(
        this.authService.recoveryPassword({
          email: this.registrationEmail,
          newPassword: this.formData().newPassword,
          codigo: this.codeValidate,
          purpose: 'recovery'
        })
       )

       if(passwordResponse.isSuccess){
        this.isEnrollmentError.set(false);

        //this.notificacionService.show('Contraseña actualizada exitosamente.', 'success');

        //setTimeout(() => this.onSuccess.emit(), 3000);
        this.onSuccess.emit();
        this.resetForm();
       }else{
        this.notificacionService.show('Error al actualizar la contraseña.', 'error')
        setTimeout(() => this.hideEnrollmentMessage(), 3000);
       }

    } catch {
      this.errors.set({ newPassword: 'Error al actualizar la contraseña. Inténtalo de nuevo.' });
      // this.toast.error('Error al actualizar la contraseña. Inténtalo de nuevo.', 'Error', {
      //   timeOut: 3000,
      //   closeButton: true,
      //   progressBar: true
      // })
      this.notificacionService.show('Error al actualizar la contraseña.', 'error')
    } finally {
      this.isLoading.set(false);
    }
  }

  async handleResendCode() {
    // if (this.resendCooldown() > 0) return;
    // this.isLoading.set(true);

    // try {
    //   await new Promise(r => setTimeout(r, 1000));
    //   const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    //   sessionStorage.setItem('recoveryCode', newCode);

    //   this.resendCooldown.set(60);
    //   const interval = setInterval(() => {
    //     this.resendCooldown.update(prev => {
    //       if (prev <= 1) {
    //         clearInterval(interval);
    //         return 0;
    //       }
    //       return prev - 1;
    //     });
    //   }, 1000);
    // } catch {
    //   this.errors.set({ verificationCode: 'Error al reenviar el código' });
    // } finally {
    //   this.isLoading.set(false);
    // }
  }

  private resetForm(): void {
    this.currentStep.set('email');
    this.formData.set({
      email: '',
      verificationCode: '',
      newPassword: '',
      confirmPassword: ''
    });
    this.errors.set({});
    this.isLoading.set(false);
    this.showPassword.set(false);
    this.showConfirmPassword.set(false);
    this.resendCooldown.set(0);
    this.registrationEmail = '';
    this.registrationPass = '';
    this.codeValidate = '';
  }

}