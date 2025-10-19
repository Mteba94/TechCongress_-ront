import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
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
import { School } from '../../services/school';
import { AutocompleteInput } from '../../../../shared/components/reusables/autocomplete-input/autocomplete-input';
import { SelectResponse } from '../../models/select-response.interface';
import { TipoIdentificacion } from '../../services/tipo-identificacion';

export interface gradeOptions{
  value: number,
  label: string
}

export interface schoolOptions{
  value: number,
  label: string
}

interface TipoIdentificacionOptions{
  value: number,
  label: string
}

const schoolInputValidator = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) {
    return null; // El valor es válido
  }
  return { schoolRequired: true }; // El valor es inválido
};

@Component({
  selector: 'app-registration-form',
  imports: [
    CommonModule,
    LucideAngularModule,
    ReactiveFormsModule,
    InputComponent,
    //CheckPointComponent,
    Button,
    UserTypeSelector,
    SelectComponent,
    EmailVerification,
    AutocompleteInput
  ],
  templateUrl: './registration-form.html',
  styleUrl: './registration-form.css'
})
export class RegistrationForm {
  @Output() onSuccess = new EventEmitter<void>();

  currentStep: 'registration' | 'verification' = 'registration';
  registrationEmail: string = '';
  registrationPass: string = '';

  private readonly nivelAcademicoService = inject(NivelAcademico)
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly participanteService = inject(Participante)
  private readonly codigoService = inject(Codigo)
  private readonly schoolService = inject(School)
  private readonly TipoIdentificacionService = inject(TipoIdentificacion)


  registrationForm!: FormGroup;
  userType: 'internal' | 'external' = 'external';
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  generalError: string[] | null = null;
  apiError: string[] = []
  passwordMismatchError: boolean | false = false;
  showSemestreField = false;

  readonly icons = { 
    alertCircle: AlertCircle,
    eye: Eye,
    eyeOff: EyeOff,
    userPlus: UserPlus
   };

  get nivelAcademicoIdControl(): FormControl {
    return this.registrationForm.get('nivelAcademicoId') as FormControl;
  }

  get schoolControl(): FormControl {
    return this.registrationForm.get('schoolId') as FormControl;
  }

  gradeOp: gradeOptions[] = []
  schoolOp: schoolOptions[] = []
  tipoIdentificacionOp: TipoIdentificacionOptions[] = []
  schoolName: string = '';
  carneId: number | null = null;
  universidadId: number | null = null;

  ngOnInit(): void {
    this.initializeForm();

    this.getSelectNivelAcademico();
    this.getSelectNSchool();
    this.getSelectTipoIdentificacion();
    this.updateSemestreFieldVisibility();
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
          const universidadOption = resp.data.find(item => item.nombre.toLowerCase().includes('universidad'));
          if (universidadOption) {
            this.universidadId = universidadOption.id;
          }
        }else{

        }
      })
  }

  schools: SelectResponse[] = [];
  schoolOptions: string[] = []; 
  internalSchool: schoolOptions | null = null;

  getSelectNSchool(): void{
    this.schoolService
      .getSelectSchool()
      .subscribe((resp) => {
        if(resp.isSuccess){
            this.schoolOp = resp.data.map(item => ({
              value: item.id,
              label: item.nombre
            }));

            this.internalSchool = this.schoolOp.find(s =>
              this.normalizeString(s.label).includes(this.normalizeString('Mariano Gálvez'))
            ) || null;
        }else{

        }
      })
  }

  private allTipoIdentificacionOp: TipoIdentificacionOptions[] = [];

  getSelectTipoIdentificacion(): void{
    this.TipoIdentificacionService
      .getSelectTipoIdentificacion()
      .subscribe((resp) => {
        if(resp.isSuccess){
          this.allTipoIdentificacionOp = resp.data
            .filter(item => item.nombre !== 'Sin Documento')
            .map(item => ({
              value: item.id,
              label: item.nombre
            }));
          
          const carneOption = this.allTipoIdentificacionOp.find(op => op.label === 'Carné');
          if (carneOption) {
            this.carneId = carneOption.value;
          }

          this.updateTipoIdentificacionOptions();
        }
      })
  }

  updateTipoIdentificacionOptions(): void {
    if (this.userType === 'external') {
      this.tipoIdentificacionOp = this.allTipoIdentificacionOp.filter(item => item.label !== 'Carné');
    } else {
      this.tipoIdentificacionOp = this.allTipoIdentificacionOp;
    }
    const tipoIdentificacionControl = this.registrationForm.get('tipoIdentificacionId');
    if (tipoIdentificacionControl && !this.tipoIdentificacionOp.some(op => op.value === tipoIdentificacionControl.value)) {
      tipoIdentificacionControl.setValue(0);
    }
  }

  private normalizeString(value: string): string {
    return value
      .toLowerCase()
      .normalize("NFD")                // separa acentos
      .replace(/[̀-ͯ]/g, ""); // elimina acentos
  }

  onSchoolChange(value: schoolOptions | string): void {
    if (typeof value === 'object') {
      this.schoolControl.setValue(value.value);
      this.schoolName = value.label;
    } else {
      this.schoolControl.setValue(value);
      this.schoolName = value;
    }
    this.schoolControl.updateValueAndValidity();
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
      schoolId: [''],
      nivelAcademicoId: [''],
      semestre: [''],
      fechaNacimiento: [''],
      tipoIdentificacionId: [''],
      numeroIdentificacion: [''],
      carneGroup: this.fb.group({
        carnePart1: [''],
        carnePart2: [''],
        carnePart3: ['']
      }),
      acceptTerms: [false, Validators.requiredTrue],
      acceptMarketing: [false]
    }, {
      validator: (form: FormGroup) => this.passwordMatchValidator(form)
    });

    this.registrationForm.get('tipoIdentificacionId')?.valueChanges.subscribe(id => {
      this.onTipoIdentificacionChange(id);
    });

    this.registrationForm.get('nivelAcademicoId')?.valueChanges.subscribe(() => {
      this.updateSemestreFieldVisibility();
    });

    this.updateValidatorsForUserType();
  }

  updateSemestreFieldVisibility(): void {
    const userIsInternal = this.userType === 'internal';
    const isUniversidad = this.registrationForm.get('nivelAcademicoId')?.value === this.universidadId;
    
    const semestreControl = this.registrationForm.get('semestre');

    if (userIsInternal || isUniversidad) {
      this.showSemestreField = true;
      semestreControl?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(10),
        Validators.pattern(/^[0-9]+$/)
      ]);
    } else {
      this.showSemestreField = false;
      semestreControl?.clearValidators();
      semestreControl?.setValue(null);
    }
    semestreControl?.updateValueAndValidity();
  }

  onTipoIdentificacionChange(id: number): void {
    const numeroIdentificacionControl = this.registrationForm.get('numeroIdentificacion');
    const carneGroup = this.registrationForm.get('carneGroup');
    const carnePart1 = carneGroup?.get('carnePart1');
    const carnePart2 = carneGroup?.get('carnePart2');
    const carnePart3 = carneGroup?.get('carnePart3');

    numeroIdentificacionControl?.clearValidators();
    numeroIdentificacionControl?.setValue(null);
    carnePart1?.clearValidators();
    carnePart2?.clearValidators();
    carnePart3?.clearValidators();
    carneGroup?.reset();

    if (id === this.carneId) {
      carnePart1?.setValidators([Validators.required, Validators.maxLength(7)]);
      carnePart2?.setValidators([Validators.required, Validators.maxLength(7)]);
      carnePart3?.setValidators([Validators.required, Validators.maxLength(7)]);
    } else if (id) {
      numeroIdentificacionControl?.setValidators(Validators.required);
    }

    numeroIdentificacionControl?.updateValueAndValidity();
    carneGroup?.updateValueAndValidity();
  }

  isCarneSelected(): boolean {
    return this.registrationForm.get('tipoIdentificacionId')?.value === this.carneId;
  }

  updateValidatorsForUserType(): void {
    const schoolControl = this.registrationForm.get('schoolId');
    const gradeControl = this.registrationForm.get('nivelAcademicoId');
    const birthDateControl = this.registrationForm.get('fechaNacimiento');
    const emailControl = this.registrationForm.get('email');

    if (this.userType === 'external') {
      schoolControl?.setValidators(schoolInputValidator);
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

      const schoolIdControl = this.registrationForm.get('schoolId');
      if (schoolIdControl) {
        const newSchoolValue = this.userType === 'internal' && this.internalSchool ? this.internalSchool.value : '';
        schoolIdControl.setValue(newSchoolValue);
      }

      const tipoParticipanteIdControl = this.registrationForm.get('tipoParticipanteId');
      if(tipoParticipanteIdControl){
        const valuenew = this.userType === 'external' ? 1 : 2;
        tipoParticipanteIdControl.setValue(valuenew)
      }

      if (type === 'internal' && this.carneId) {
        this.registrationForm.get('tipoIdentificacionId')?.setValue(this.carneId);
      } else {
        this.registrationForm.get('tipoIdentificacionId')?.setValue(0);
      }

    this.updateValidatorsForUserType();
    this.registrationForm.get('email')?.updateValueAndValidity();
    this.updateTipoIdentificacionOptions();
    this.updateSemestreFieldVisibility();
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
      //console.log(this.registrationForm.getRawValue());
      Object.keys(this.registrationForm.controls).forEach(key => {
        const controlS = this.registrationForm.get(key);

        if (controlS!.invalid) {
          //console.log(`El control '${key}' es inválido.`);
          //console.log('Errores:', controlS!.errors);
        }
      });
      this.generalError = ['Por favor, corrige los errores del formulario.'];
      return;
    }

    this.isLoading = true;
    this.generalError = null;

    try {
      if (this.isCarneSelected()) {
        const { carnePart1, carnePart2, carnePart3 } = this.registrationForm.value.carneGroup;
        this.registrationForm.patchValue({
          numeroIdentificacion: `${carnePart1}-${carnePart2}-${carnePart3}`
        }, { emitEvent: false });
      }

      const formData = this.registrationForm.value;

      let schoolId_to_send: number | null = null;
      let schoolName_to_send: string | null = null;

      if(this.userType === 'internal' && this.internalSchool) {
        schoolId_to_send = this.internalSchool.value;
        schoolName_to_send = this.internalSchool.label;
      }else{
        if (typeof this.schoolControl.value === 'number') {
          schoolId_to_send = this.schoolControl.value;
          schoolName_to_send = this.schoolOp.find(op => op.value === schoolId_to_send)?.label || '';
        } else if (typeof this.schoolControl.value === 'string' && this.schoolControl.value.trim() !== '') {
          schoolName_to_send = this.schoolControl.value.trim();
          schoolId_to_send = null;
        }
      }

      const semestreValue = formData.semestre ? parseInt(formData.semestre, 10) : null;

      const dataToSend: ParticipanteRequest = {
        ...formData,
        schoolId: schoolId_to_send,
        schoolName: schoolName_to_send,
        semestre: semestreValue
      };
      delete (dataToSend as any).carneGroup;
      delete (dataToSend as any).confirmPassword;
      delete (dataToSend as any).acceptTerms;
      delete (dataToSend as any).acceptMarketing;

      await this.createPart(dataToSend);

      this.registrationEmail = formData.email;
      this.registrationPass = formData.password;
      
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
        this.participanteService.PostCreate(request)
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

  getControlError(controlName: string): string | null {
    const control = this.registrationForm.get(controlName);

    if (control?.invalid && (control?.touched || control?.dirty)) {
      if (control.errors?.['required']) {
        return 'Este campo es obligatorio';
      }
      if (control.errors?.['schoolRequired']) {
        return 'El nombre de la institución educativa es obligatorio';
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
      if (control.errors?.['min']) {
        return `El valor mínimo es ${control.errors['min'].min}`;
      }
      if (control.errors?.['max']) {
        return `El valor máximo es ${control.errors['max'].max}`;
      }
      if (control.errors?.['pattern']) {
        return 'Este campo solo acepta números enteros.';
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
    this.initializeForm();
  }

  handleVerificationSuccess(): void {
    const pendingUser = JSON.parse(sessionStorage.getItem('pendingUserRegistration') || '{}');

    const userData = {
      ...pendingUser
    }

    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userData', JSON.stringify(userData));
    this.onSuccess.emit();
  }

  handleResendCode(): void {
  }

  validaEdad(): boolean {
    const fechaNacimiento = new Date(this.registrationForm.value.fechaNacimiento);
    const fechaActual = new Date();
    
    const diferenciaEnMilisegundos = fechaActual.getTime() - fechaNacimiento.getTime();
    const edad = Math.floor(diferenciaEnMilisegundos / (1000 * 60 * 60 * 24 * 365.25));
    
    return edad >= 18;
  }

}