import { AfterViewInit, Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { User } from '../../models/userResp.interface';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AlertCircle, LucideAngularModule, X } from 'lucide-angular';
import { InputComponent } from '../../../../shared/components/reusables/input/input';
import { SelectComponent } from '../../../../shared/components/reusables/select-component/select-component';
import { AutocompleteInput } from '../../../../shared/components/reusables/autocomplete-input/autocomplete-input';
import { Button } from '../../../../shared/components/reusables/button/button';
import { Checkbox } from '../../../../shared/components/reusables/checkbox/checkbox';
import { School } from '../../../login-registration/services/school';
import { gradeOptions, schoolOptions } from '../../../login-registration/components/registration-form/registration-form';
import { NivelAcademico } from '../../../login-registration/services/nivel-academico';
import { ParticipanteRequest } from '../../../login-registration/models/participante-req.interface';
import { firstValueFrom } from 'rxjs';
import { Participante } from '../../../login-registration/services/participante';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError, BaseApiResponse } from '../../../../shared/models/reusables/base-api-response.interface';

const schoolInputValidator = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) {
    return null; // El valor es válido
  }
  return { schoolRequired: true }; // El valor es inválido
};

@Component({
  selector: 'app-user-modal',
  imports: [
    LucideAngularModule,
    InputComponent,
    SelectComponent,
    //AutocompleteInput,
    Button,
    //Checkbox,
    ReactiveFormsModule
  ],
  templateUrl: './user-modal.html',
  styleUrl: './user-modal.css'
})
export class UserModal {
  @Input() user: User | null | undefined;
  @Input() isSaving: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<User>();
  //@Output() save = new EventEmitter<(user: User) => Promise<void>>();

  readonly icons = {
    x: X,
    alertCircle: AlertCircle
  }

  private readonly schoolService = inject(School)
  private readonly nivelAcademicoService = inject(NivelAcademico)
  private readonly participanteService = inject(Participante)

  form!: FormGroup;
  isLoading = signal(false);
  generalError: string[] | null = null;
  schoolOp: schoolOptions[] = []
  internalSchool: schoolOptions | null = null;
  schoolName: string = '';
  gradeOp: gradeOptions[] = []
  universidadId: number | null = null;
  registrationEmail: string = '';
  mode: string = '';
  userType: number = 1;

  roleOptions = [
    //{ value: 3, label: 'Administrador' },
    { value: 2, label: 'Estudiante Interno' },
    { value: 1, label: 'Estudiante Externo' }
  ];

  statusOptions = [
    { value: 1, label: 'Activo' },
    { value: 2, label: 'Pendiente' },
    { value: 3, label: 'Bloqueado' }
  ];

  constructor(private fb: FormBuilder) {}

  get schoolControl(): FormControl {
    return this.form.get('schoolId') as FormControl;
  }

  onSchoolChange(value: schoolOptions | string): void {
    if (typeof value === 'object') {
      // Solo actualizar nombre interno si quieres mostrarlo aparte
      this.schoolName = value.label;
    } else {
      this.schoolName = value;
    }
    this.schoolControl.updateValueAndValidity();
  }

  ngOnInit(): void {
    this.initializeForm();

    if(this.user){
      this.initUpdateMode()
      this.mode = 'edit'
    }else{
      this.mode = 'create'
    }

    this.getSelectNSchool();
    this.getSelectNivelAcademico()

    this.form.get('tipoParticipanteId')?.valueChanges.subscribe((value) => {
     this.handleTipoParticipanteChange('tipoParticipanteId', value);
    });

  }

  handleTipoParticipanteChange(controlName: string, value: any): void {
    this.userType = value;

    if (value === 2) {

      const defaultSchool = this.schoolOp.find(s =>
        s.label.toLowerCase().includes('mariano galvez')
      );

      if (defaultSchool) {
        this.schoolControl.setValue(defaultSchool.value);
        this.schoolName = defaultSchool.label;
      }
      this.schoolControl.disable();
    } else {
      // Si selecciona Estudiante Externo, habilitar el campo
      this.schoolControl.enable();
      this.schoolControl.reset();
    }

    this.updateValidatorsForUserType();
  }


  initializeForm(): void {
    this.form = this.fb.group({
      userId:[''],
      pnombre: ['', Validators.required],
      snombre: [''],
      papellido: ['', Validators.required],
      sapellido: [''],
      email: ['', [Validators.required, Validators.email]],
      tipoParticipanteId: [''],
      estado: [''],
      schoolId: [''],
      telefono: [''],
      nivelAcademicoId: [''],
      password: [''],
      tipoIdentificacionId:[1]
    });

    this.updateValidatorsForUserType();
  }

  initUpdateMode(){
    this.initCurrentValuesForm()
  }

  initCurrentValuesForm() {
    setTimeout(() => {
      if (this.user) {
        this.form.patchValue({
          ...this.user,
          //tipoParticipanteId: this.user.role,
        });
      }
      setTimeout(() => {
        this.nivelAcademicoIdControl.setValue(this.user?.nivelAcademico);
      }, 10);
    }, 10)
  }


  editForm(): void {
    this.form = this.fb.group({
      pnombre: [this.user?.pnombre || '', Validators.required],
      snombre: [this.user?.snombre || ''],
      papellido: [this.user?.papellido || '', Validators.required],
      sapellido: [this.user?.sapellido || ''],
      //name: [this.user?.name || '', Validators.required],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      tipoParticipanteId: [this.user?.role || 1, Validators.required],
      estado: [this.user?.estado != null ? Number(this.user.estado) : 1, Validators.required],
      schoolId: [this.user?.school || ''],
      telefono: [this.user?.telefono || ''],
      nivelAcademicoId: [this.user?.nivelAcademico != null ? Number(this.user.nivelAcademico) : 1, Validators.required],
      sendWelcomeEmail: [this.user ? false : true],
      generatePassword: [this.user ? false : true]
    });
  }

  get nivelAcademicoIdControl(): FormControl {
    return this.form.get('nivelAcademicoId') as FormControl;
  }

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

            if (this.mode === 'edit' && this.user?.school) {
              const selectedSchool = this.schoolOp.find(
                s => s.value === Number(this.user!.school)
              );
              if (selectedSchool) {
                this.schoolControl.setValue(selectedSchool.value);
                this.schoolName = selectedSchool.label;
              }
            }
        }else{

        }
      })
  }

  private normalizeString(value: string): string {
    return value
      .toLowerCase()
      .normalize("NFD")                // separa acentos
      .replace(/[̀-ͯ]/g, ""); // elimina acentos
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

  handleInputChange(controlName: string, value: any): void {
    this.form.get(controlName)?.setValue(value);
    this.form.updateValueAndValidity();
  }

  async handleSubmit(){
    this.form.markAllAsTouched();
    
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        const controlS = this.form.get(key);

        if (controlS!.invalid) {
          this.generalError =[`El control '${key}' es inválido.`]
        }
      });
      this.generalError = ['Por favor, corrige los errores del formulario.'];
      return;
    }

    this.isLoading.set(true);

    if(this.form.valid){
      const formData: User = this.form.value;

      let schoolId_to_send: number | null = null;
      let schoolName_to_send: string | null = null;

      if(this.userType === 2 && this.internalSchool) {
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

      const dataToSend: User = {
        ...formData,
        schoolId: schoolId_to_send?.toString(),
        autogen: 'true',
        estado: 4
        //schoolName: schoolName_to_send,
        // semestre: semestreValue
      };

      try {
    // espera a que el padre termine
      await this.save.emit(dataToSend);
      } catch (err) {
        this.generalError = ['Ocurrió un error al guardar.'];
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  async handleSubmit2(): Promise<void> {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        const controlS = this.form.get(key);

        if (controlS!.invalid) {
          console.log(`El control '${key}' es inválido.`);
          console.log('Errores:', controlS!.errors);
        }
      });
      this.generalError = ['Por favor, corrige los errores del formulario.'];
      return;
    }

    this.isLoading.set(true);
    this.generalError = null;

    const formData = this.form.value;

    try {
      let schoolId_to_send: number | null = null;
      let schoolName_to_send: string | null = null;

      if(this.userType === 2 && this.internalSchool) {
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

      const dataToSend: ParticipanteRequest = {
        ...formData,
        schoolId: schoolId_to_send,
        schoolName: schoolName_to_send,
        // semestre: semestreValue
      };

      switch(this.mode){
        case 'create':
          return this.createPart(dataToSend);
          break;
        case 'edit':
          return this.updatePart(dataToSend)
          break;
      }

    } catch (error) {
      this.generalError = ['Error al crear la cuenta. Inténtalo de nuevo.'];
    }finally{
      this.isLoading.set(false);
    }

  }

  async createPart(request: ParticipanteRequest){
    this.generalError = ['']

    try {
      const randomPassword = this.generatePassword(8);

      request.password = randomPassword;
      request.tipoIdentificacionId = 1;

      const response = await firstValueFrom(
        this.participanteService.PostCreate(request)
      );

      if (response.isSuccess) {
        this.registrationEmail = this.form.value.email;

        const ReqCodigo = {
          purpose: 'validUser',
          email: this.registrationEmail
        };

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

  async updatePart(request: ParticipanteRequest){
    console.log('update')
  }

  getControlError(controlName: string): string | null {
    const control = this.form.get(controlName);

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

    if (controlName === 'confirmPassword' && this.form.errors?.['mismatch']) {
      return 'Las contraseñas no coinciden';
    }

    return null;
  }

  generatePassword(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  updateValidatorsForUserType(): void {
      const schoolControl = this.form.get('schoolId');
      const gradeControl = this.form.get('nivelAcademicoId');
      //const birthDateControl = this.form.get('fechaNacimiento');
      const emailControl = this.form.get('email');

      //console.log(emailControl!.value)
  
      if (this.userType === 1) {
        schoolControl?.setValidators(schoolInputValidator);
        gradeControl?.setValidators(Validators.required);
        //birthDateControl?.setValidators(Validators.required);
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
      emailControl?.updateValueAndValidity();
    }

  onClose(): void {
    this.close.emit();
  }
}
