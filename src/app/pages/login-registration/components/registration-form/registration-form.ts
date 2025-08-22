import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  AlertCircle,
  Eye,
  EyeOff,
  LucideAngularModule,
  UserPlus
 } from 'lucide-angular';
import { InputComponent } from '../../../../shared/components/reusables/input/input';
import { CheckPointComponent } from '../../../../shared/components/reusables/check-point-component/check-point-component';
import { Button } from '../../../../shared/components/reusables/button/button';
import { UserTypeSelector } from '../user-type-selector/user-type-selector';
import { SelectComponent } from '../../../../shared/components/reusables/select-component/select-component';
import { NivelAcademico } from '../../services/nivel-academico';
import { EmailVerification } from '../email-verification/email-verification';
import { Participante } from '../../services/participante';
import { ApiError, BaseApiResponse } from '../../../../shared/models/reusables/base-api-response.interface';
import { Codigo } from '../../services/codigo';
import { firstValueFrom } from 'rxjs';
import { ParticipanteRequest } from '../../models/participante-req.interface';
import { HttpErrorResponse } from '@angular/common/http';

export interface gradeOptions{
  value: number,
  label: string
}

@Component({
  selector: 'app-registration-form',
  imports: [
    CommonModule,
    LucideAngularModule,
    ReactiveFormsModule,
    InputComponent,
    CheckPointComponent,
    Button,
    UserTypeSelector,
    SelectComponent,
    EmailVerification
  ],
  templateUrl: './registration-form.html',
  styleUrl: './registration-form.css'
})
export class RegistrationForm {
  @Output() onSuccess = new EventEmitter<void>();

  currentStep: 'registration' | 'verification' = 'registration';
  registrationEmail: string = '';

  private readonly nivelAcademicoService = inject(NivelAcademico)
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly participanteService = inject(Participante)
  private readonly codigoService = inject(Codigo)

  registrationForm!: FormGroup;
  userType: 'internal' | 'external' = 'external';
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  generalError: string[] | null = null;
  apiError: string[] = []
  passwordMismatchError: boolean | false = false;

  readonly icons = { 
    alertCircle: AlertCircle,
    eye: Eye,
    eyeOff: EyeOff,
    userPlus: UserPlus
   };

  // gradeOptions = [
  //   { value: '10', label: 'Décimo Grado' },
  //   { value: '11', label: 'Undécimo Grado' },
  //   { value: '12', label: 'Duodécimo Grado' },
  //   { value: 'graduate', label: 'Graduado' }
  // ];

  get nivelAcademicoIdControl(): FormControl {
    return this.registrationForm.get('nivelAcademicoId') as FormControl;
  }

  gradeOp: gradeOptions[] = []

  ngOnInit(): void {
    this.initializeForm();

    this.getSelectNivelAcademico();
  }

  getSelectNivelAcademico(): void{
    this.nivelAcademicoService
      .getSelectNivelAcademico()
      .subscribe((resp) => {
        if(resp.isSuccess){
          this.gradeOp = resp.data.map(item => ({
              value: item.id,
              label: item.nombre
            }));
        }else{

        }
      })
  }

  initializeForm(): void {
    this.registrationForm = this.fb.group({
      pNombre: ['', Validators.required],
      sNombre: [''],
      pApellido: ['', Validators.required],
      sApellido: [''],
      tipoParticipanteId: [this.userType === 'external' ? 1 : 2],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      telefono: [''],
      school: [''],
      nivelAcademicoId: [''],
      fechaNacimiento: [''],
      acceptTerms: [false, Validators.requiredTrue],
      acceptMarketing: [false]
    }, {
      validator: (form: FormGroup) => this.passwordMatchValidator(form)
    });

    this.updateValidatorsForUserType();
  }

  updateValidatorsForUserType(): void {
    //const phoneControl = this.registrationForm.get('telefono');
    const schoolControl = this.registrationForm.get('school');
    const gradeControl = this.registrationForm.get('nivelAcademicoId');
    const birthDateControl = this.registrationForm.get('fechaNacimiento');
    const emailControl = this.registrationForm.get('email');

    if (this.userType === 'external') {
      //phoneControl?.setValidators(Validators.required);
      schoolControl?.setValidators(Validators.required);
      gradeControl?.setValidators(Validators.required);
      birthDateControl?.setValidators(Validators.required);
      if (emailControl) {
        emailControl.setValidators([Validators.required, Validators.email, (control) => {
          const value = control.value;
          if (value && value.endsWith('@miumg.edu.gt')) {
            return { 'invalidExternalEmail': true };
          }
          return null;
        }]);
      }
    } else {
      //phoneControl?.clearValidators();
      schoolControl?.clearValidators();
      gradeControl?.clearValidators();
      birthDateControl?.clearValidators();
      if (emailControl) {
        emailControl.setValidators([Validators.required, Validators.email, (control) => {
          const value = control.value;
          if (value && !value.endsWith('@miumg.edu.gt')) {
            return { 'invalidInternalEmail': true };
          }
          return null;
        }]);
      }
    }

    //phoneControl?.updateValueAndValidity();
    schoolControl?.updateValueAndValidity();
    gradeControl?.updateValueAndValidity();
    birthDateControl?.updateValueAndValidity();
    emailControl?.updateValueAndValidity();
  }

  passwordMatchValidator(form: FormGroup): null | { mismatch: true } {

    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password === confirmPassword) {

    } else {
      this.passwordMismatchError = true;
      return { mismatch: true };
    }

    return password === confirmPassword ? null : { mismatch: true };
  }

  handleUserTypeChange(type: 'internal' | 'external'): void {
    this.userType = type;

    const nivelAcademicoIdControl = this.registrationForm.get('nivelAcademicoId');
    if(nivelAcademicoIdControl){
      const newValue = this.userType === 'internal' ? 4 : '';
      nivelAcademicoIdControl.setValue(newValue);
    }

    const tipoParticipanteIdControl = this.registrationForm.get('tipoParticipanteId');
    if(tipoParticipanteIdControl){
      const valuenew = this.userType === 'external' ? 1 : 2;
      tipoParticipanteIdControl.setValue(valuenew)
    }

    this.updateValidatorsForUserType();
    this.registrationForm.get('email')?.updateValueAndValidity();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async handleSubmit(): Promise<void> {
    this.registrationForm.markAllAsTouched();

    if (this.registrationForm.invalid) {
      this.generalError = ['Por favor, corrige los errores del formulario.'];
      return;
    }

    this.isLoading = true;
    this.generalError = null;

    try {
      //await new Promise(resolve => setTimeout(resolve, 2000));
      
      
      // this.participanteService
      //   .PostCreate(this.registrationForm.value)
      //   .subscribe((response: BaseApiResponse<boolean>) => {
      //     if(response.isSuccess){
            
      //       this.registrationEmail = formData.email;

      //       const ReqCodigo = {
      //         purpose: 'validUser',
      //         email: this.registrationEmail
      //       }

      //       this.codigoService
      //         .CreateCode(ReqCodigo)
      //         .subscribe((response: BaseApiResponse<string>) =>{
      //           this.currentStep = 'verification';
      //         })

      //     }else{
      //       this.generalError = response.message
      //     }
      //     console.log(response)
      //   })

      this.createPart(this.registrationForm.value)

      // localStorage.setItem('isAuthenticated', 'true');
      // localStorage.setItem('userData', JSON.stringify(userData));
      const formData = this.registrationForm.value;

      this.registrationEmail = formData.email;

      //this.currentStep = 'verification';
      //this.onSuccess.emit();
    } catch (error) {
      this.generalError = ['Error al crear la cuenta. Inténtalo de nuevo.'];
    } finally {
      this.isLoading = false;
    }
  }

  async createPart(request: ParticipanteRequest){
    this.generalError = ['']

    try {
      const response = await firstValueFrom(
        this.participanteService.PostCreate(this.registrationForm.value)
      );

      if (response.isSuccess) {
        this.registrationEmail = this.registrationForm.value.email;

        const ReqCodigo = {
          purpose: 'validUser',
          email: this.registrationEmail
        };

        const codeResponse = await firstValueFrom(
          this.codigoService.CreateCode(ReqCodigo)
        );

        if(codeResponse.isSuccess){
          const formData = this.registrationForm.value;

          const tempUserData = {
            email: formData.email,
            name: `${formData.pNombre} ${formData.pApellido}`,
            role: this.userType === 'internal' ? 'student' : 'external',
            userType: this.userType,
            registrationDate: new Date().toISOString(),
            isEmailVerified: false
          };

          sessionStorage.setItem('pendingUserRegistration', JSON.stringify(tempUserData));
          this.currentStep = 'verification';
        }

      }

    } catch (err: unknown) {
      if (err instanceof HttpErrorResponse) {
        const apiresponse = err.error as BaseApiResponse<any>;

        if (apiresponse && apiresponse.errors && apiresponse.errors.length > 0) {
          this.generalError = apiresponse.errors.map((err: ApiError) => err.errorMessage);

        } else if (apiresponse && apiresponse.message) {
          this.generalError = [apiresponse.message];

        } else {
          this.generalError = ['Ha ocurrido un error. Intente de nuevo.'];
        }
      } else {
        this.generalError = ['Ha ocurrido un error. Intente de nuevo.'];
      }
    }
  }

  // Helper para mostrar errores de los formularios reactivos
  getControlError(controlName: string): string | null {
    const control = this.registrationForm.get(controlName);

    if (control?.invalid && (control?.touched || control?.dirty)) {
      if (control.errors?.['required']) {
        return 'Este campo es obligatorio';
      }
      if (control.errors?.['email']) {
        return 'Ingrese un correo electrónico válido';
      }
      if (control.errors?.['minlength']) {
        return 'La contraseña debe tener al menos 8 caracteres';
      }
      if (control.errors?.['invalidInternalEmail']) {
        return 'Debe usar un correo institucional (@miumg.edu.gt)';
      }
      if (control.errors?.['invalidExternalEmail']) {
        return 'Debe usar un correo externo';
      }
      if (control.errors?.['requiredTrue']) {
        return 'Debe aceptar los términos y condiciones';
      }
    }

    if (controlName === 'confirmPassword' && this.registrationForm.errors?.['mismatch']) {
      return 'Las contraseñas no coinciden';
    }

    return null;
  }

  handleInputChange(controlName: string, value: any): void {
    this.registrationForm.get(controlName)?.setValue(value);
    this.registrationForm.updateValueAndValidity();
  }

  handleBackToRegistration(): void {
    this.currentStep = 'registration';
    sessionStorage.removeItem('pendingUserRegistration');
    this.initializeForm(); // Reinicializa el formulario si es necesario
  }

  handleVerificationSuccess(): void {
    // ... tu lógica para completar el registro
    const pendingUser = JSON.parse(sessionStorage.getItem('pendingUserRegistration') || '{}');

    const userData = {
      ...pendingUser
    }

    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userData', JSON.stringify(userData));
    this.onSuccess.emit();
  }

  handleResendCode(): void {
    // ... tu lógica para reenviar el código
  }

}
