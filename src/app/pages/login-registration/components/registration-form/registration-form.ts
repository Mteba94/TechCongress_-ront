import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
    SelectComponent
  ],
  templateUrl: './registration-form.html',
  styleUrl: './registration-form.css'
})
export class RegistrationForm {
  @Output() onSuccess = new EventEmitter<void>();

  registrationForm!: FormGroup;
  userType: 'internal' | 'external' = 'external';
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  generalError: string | null = null;
  passwordMismatchError: boolean | false = false;

  readonly icons = { 
    alertCircle: AlertCircle,
    eye: Eye,
    eyeOff: EyeOff,
    userPlus: UserPlus
   };

  gradeOptions = [
    { value: '10', label: 'Décimo Grado' },
    { value: '11', label: 'Undécimo Grado' },
    { value: '12', label: 'Duodécimo Grado' },
    { value: 'graduate', label: 'Graduado' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.registrationForm = this.fb.group({
      pNombre: ['', Validators.required],
      sNombre: [''],
      pApellido: ['', Validators.required],
      sApellido: [''],
      tipoParticipante: [this.userType],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      telefono: [''],
      school: [''],
      grade: [''],
      fechaNacimiento: [''],
      acceptTerms: [false, Validators.requiredTrue],
      acceptMarketing: [false]
    }, {
      validator: (form: FormGroup) => this.passwordMatchValidator(form)
    });

    // Subscribirse a los cambios de userType para aplicar validaciones condicionales
    // (Esta lógica se moverá al UserTypeSelector o se gestionará de otra forma)
    // this.registrationForm.get('email')?.valueChanges.subscribe(value => {
    //     if (this.userType === 'internal' && value && !value.includes('universidad.edu')) {
    //         this.registrationForm.get('email')?.setErrors({ 'invalidInternalEmail': true });
    //     } else {
    //         this.registrationForm.get('email')?.setErrors(null);
    //     }
    // });

    // Validaciones condicionales para campos de 'external'
    this.updateValidatorsForUserType();
  }

  updateValidatorsForUserType(): void {
    //const phoneControl = this.registrationForm.get('telefono');
    const schoolControl = this.registrationForm.get('school');
    const gradeControl = this.registrationForm.get('grade');
    const birthDateControl = this.registrationForm.get('fechaNacimiento');
    const emailControl = this.registrationForm.get('email');

    if (this.userType === 'external') {
      //phoneControl?.setValidators(Validators.required);
      schoolControl?.setValidators(Validators.required);
      gradeControl?.setValidators(Validators.required);
      birthDateControl?.setValidators(Validators.required);
      if (emailControl) {
        //emailControl.setValidators([Validators.required, Validators.email]);
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

  // Custom validator for password match
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
    this.registrationForm.markAllAsTouched(); // Marcar todos los campos como tocados para mostrar errores

    if (this.registrationForm.invalid) {
      this.generalError = 'Por favor, corrige los errores del formulario.';
      return;
    }

    this.isLoading = true;
    this.generalError = null;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const formData = this.registrationForm.value;
      const userData = {
        email: formData.email,
        name: `${formData.pNombre} ${formData.pApellido}`,
        role: this.userType === 'internal' ? 'student' : 'external',
        userType: this.userType,
        registrationDate: new Date().toISOString()
      };

      console.log(formData)

      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userData', JSON.stringify(userData));

      this.onSuccess.emit();
    } catch (error) {
      this.generalError = 'Error al crear la cuenta. Inténtalo de nuevo.';
    } finally {
      this.isLoading = false;
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

}
