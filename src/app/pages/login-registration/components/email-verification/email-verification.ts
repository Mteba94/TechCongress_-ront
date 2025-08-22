import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { AlertCircle, ArrowLeft, LucideAngularModule, Mail, RefreshCw, ShieldCheck } from 'lucide-angular';
import { Button } from '../../../../shared/components/reusables/button/button';
import { FormsModule } from '@angular/forms';
import { Codigo } from '../../services/codigo';
import { CodigoRequest, ValidateCodigo } from '../../models/codigo-req.interface';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { BaseApiResponse } from '../../../../shared/models/reusables/base-api-response.interface';

@Component({
  selector: 'app-email-verification',
  imports: [
    LucideAngularModule,
    CommonModule,
    Button,
    FormsModule
  ],
  templateUrl: './email-verification.html',
  styleUrl: './email-verification.css'
})
export class EmailVerification {
  @Input({ required: true }) email!: string;
  @Output() onVerificationSuccess = new EventEmitter<void>();
  @Output() onResendCode = new EventEmitter<void>();
  @Output() onBackToRegistration = new EventEmitter<void>();

   @ViewChildren('codeInput') inputRefs!: QueryList<any>;

   private readonly codigoService = inject(Codigo)

   public Math = Math;

  verificationCode: string[] = ['', '', '', '', '', ''];
  isLoading = false;
  isResending = false;
  error: string | null = null;
  timeRemaining = 60;
  canResend = false;
  private countdownInterval: any;

  icons = {
    alertCircle: AlertCircle,
    arrowLeft: ArrowLeft,
    mail: Mail,
    shieldCheck: ShieldCheck,
    refreshCw: RefreshCw
  };

  ngOnInit(): void {
    this.startCountdown();
  }

  ngAfterViewInit(): void {
    // Enfoca el primer input automáticamente
    this.inputRefs.first?.nativeElement.focus();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  startCountdown(): void {
    this.timeRemaining = 60;
    this.canResend = false;
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.countdownInterval = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
      } else {
        this.canResend = true;
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  handleInputChange(index: number, event: any): void {
  const value = event.target.value;

  // Solo permitir un único dígito numérico
  if (!/^\d*$/.test(value) || value.length > 1) {
    return;
  }

  // Actualiza el array de código
  this.verificationCode[index] = value;

  // Limpia el error cuando el usuario empieza a escribir
  this.error = null;

  // Auto-focus al siguiente input solo si hay un valor
  if (value && index < 5) {
    const nextInput = this.inputRefs.get(index + 1)?.nativeElement;
    if (nextInput) {
      nextInput.focus();
    }
  }
}

  handleKeyDown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.verificationCode[index] && index > 0) {
      this.inputRefs.get(index - 1)?.nativeElement.focus();
    }
  }

  handlePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text').replace(/\D/g, '');
    
    if (pastedData && pastedData.length === 6) {
      this.verificationCode = pastedData.split('');
      // Enfoca el último input después de pegar
      this.inputRefs.last?.nativeElement.focus();
    }
  }

  async handleSubmit(): Promise<void> {
    const code = this.verificationCode.join('');
    
    if (code.length !== 6) {
      this.error = 'Por favor ingresa el código de 6 dígitos completo';
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {

      const ReqCodigo = {
          codigo: code,
          purpose: 'validUser',
          email: this.email
        };

      this.validateCode(ReqCodigo)
    } catch (err) {
      this.error = 'Código de verificación inválido. Por favor inténtalo de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  async validateCode(request: ValidateCodigo): Promise<void> {
    this.error = ''

    try {
      const response = await firstValueFrom(
        this.codigoService.Validate(request)
      );

      if(response.isSuccess){
          //console.log('correcto')
          this.onVerificationSuccess.emit();
        }else{
          this.error = response.message
        }

    } catch (error) {
      if(error instanceof HttpErrorResponse){
        const apiresponse = error.error

        if(apiresponse && apiresponse.message){
          this.error = apiresponse.message;
        }else{
          this.error = 'Ha ocurrido un error intente de nuevo.'
        }
      }
    }
  }

  async handleResendCode(): Promise<void> {
    this.isResending = true;
    this.error = null;
    
    try {
      const ReqCodigo = {
          purpose: 'validUser',
          email: this.email
        };
      
      this.resendCode(ReqCodigo);
      this.startCountdown();
      this.verificationCode = ['', '', '', '', '', ''];
      this.onResendCode.emit();
    } catch (err) {
      this.error = 'Error al reenviar el código. Inténtalo de nuevo.';
    } finally {
      this.isResending = false;
    }
  }

  async resendCode(request: CodigoRequest): Promise<void> {
    this.error = ''

    try {
      const response = await firstValueFrom(
        this.codigoService.CreateCode(request)
      );

      if(response.isSuccess){

      }else{
        this.error = response.message;
      }
    } catch (error) {
      if(error instanceof HttpErrorResponse){
        const apiresponse = error.error

        if(apiresponse && apiresponse.message){
          this.error = apiresponse.message;
        }else{
          this.error = 'Ha ocurrido un error intente de nuevo.'
        }
      }
    }
  }
}
