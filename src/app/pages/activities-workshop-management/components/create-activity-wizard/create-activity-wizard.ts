import { Component, EventEmitter, OnInit, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Info, Calendar, User, BookOpen, Settings, CheckCircle, X, ChevronRight, Monitor, MapPin, Combine, Gift, CreditCard, PlusCircle, Trash2 } from 'lucide-angular';

import { Button } from '../../../../shared/components/reusables/button/button';
import { InputComponent } from '../../../../shared/components/reusables/input/input';
import { SelectComponent, SelectOption } from '../../../../shared/components/reusables/select-component/select-component';
import { NivelActividad } from '../../../workshop-activity-catalog/services/nivel-actividad';
import { Ponente } from '../../../workshop-activity-catalog/services/ponente';
import { Categoria } from '../../../workshop-activity-catalog/services/categoria';
import { Actividad } from '../../../workshop-activity-catalog/services/actividad';

@Component({
  selector: 'app-create-activity-wizard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    Button,
    InputComponent,
    SelectComponent
  ],
  templateUrl: './create-activity-wizard.html',
  styleUrls: ['./create-activity-wizard.css']
})
export class CreateActivityWizard implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  private _nivelActividadService = inject(NivelActividad);
  private _ponenteService = inject(Ponente);
  private _categoriaService = inject(Categoria);
  private _actividadService = inject(Actividad);


  readonly icons = {
    x: X,
    chevronRight: ChevronRight,
    monitor: Monitor,
    mapPin: MapPin,
    combine: Combine,
    gift: Gift,
    creditCard: CreditCard,
    plusCircle: PlusCircle,
    trash2: Trash2
  }

  // --- STATE SIGNALS ---
  currentStep = signal(1);
  instructorSelectionMode = signal<'existing' | 'new'>('existing');
  formData = signal<any>({
    congresoId: 1,
    // Basic Information
    titulo: '',
    descripcion: '',
    descripcionTotal: '',
    tipoActividadId: '',
    imagen: null,
    // Schedule & Location
    fecha: '',
    horaInicio: '',
    horaFin: '',
    ubicacion: '',
    locationType: 'virtual',
    platform: '',
    room: '',
    // Capacity & Enrollment
    cuposTotal: '',
    requisitos: '',
    // Instructor & Resources
    ponenteId: '',
    // Content & Materials
    objetivosActividad: [''],
    materialesActividad: [''],
    nivelDificultadId: '',
    // Settings
    status: 'draft',
  });
  errors = signal<any>({});

  // --- DATA () ---
  typeOptions = [
      { value: 'tecnico', label: 'Técnico' },
      { value: 'academico', label: 'Académico' },
  ];

  difficultyOptions: SelectOption[] = [];
  instructorOptions: SelectOption[] = [];
  categoryOptions: SelectOption[] = [];

  readonly steps = [
    { id: 1, title: 'Información Básica', icon: Info },
    { id: 2, title: 'Horario y Ubicación', icon: Calendar },
    { id: 3, title: 'Instructor', icon: User },
    { id: 4, title: 'Contenido y Material', icon: BookOpen },
    { id: 5, title: 'Capacidad y Precios', icon: Settings },
    { id: 6, title: 'Revisión Final', icon: CheckCircle }
  ];

  ngOnInit(): void {
    this.loadDifficultyLevels();
    this.loadInstructors();
    this.loadCategories();
  }

  loadDifficultyLevels(): void {
    this._nivelActividadService.getAllNivelActividad().subscribe({
      next: (response) => {
        if (response.data) {
          this.difficultyOptions = response.data.map(nivel => ({
            value: nivel.nivelId.toString(),
            label: nivel.nombre
          }));
        }
      },
      error: (err) => {
        console.error('Error loading difficulty levels', err);
      }
    });
  }

  loadInstructors(): void {
    this._ponenteService.getAllPonente().subscribe({
      next: (response) => {
        if (response.data) {
          this.instructorOptions = response.data.map(ponente => ({
            value: ponente.ponenteId.toString(),
            label: `${ponente.nombrePonente} ${ponente.apellidoPonente}`
          }));
        }
      },
      error: (err) => {
        console.error('Error loading instructors', err);
      }
    });
  }

  loadCategories(): void{
    this._categoriaService.getAllCategoria().subscribe({
      next: (response) => {
        if (response.data) {
          this.categoryOptions = response.data.map(categoria => ({
            value: categoria.tipoActividadId,
            label: categoria.nombre
          }));
        }
      },
      error: (err) => {
        console.error('Error loading categories', err);
      }
    });
  }

  // --- LOGIC METHODS ---

  trackByIndex(index: number, item: any): any {
    return index;
  }

  handleInputChange(field: string, value: any) {
    let actualValue = value;

    if (value && value.target && typeof value.target.value !== 'undefined') {
      const target = value.target as HTMLInputElement;
      actualValue = target.type === 'checkbox' ? target.checked : target.value;
    }

    this.formData.update(prev => ({ ...prev, [field]: actualValue }));

    if (field === 'descripcionTotal') {
      const shortDesc = (actualValue || '').substring(0, 150);
      this.formData.update(prev => ({ ...prev, descripcion: shortDesc }));
    }

    if (this.errors()[field]) {
      this.errors.update(prev => ({ ...prev, [field]: '' }));
    }
  }

  handleFileInput(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.formData.update(prev => ({ ...prev, imagen: fileList![0] }));
    }
  }

  addObjective(): void {
    this.formData.update(prev => ({
      ...prev,
      objetivosActividad: [...prev.objetivosActividad, '']
    }));
  }

  removeObjective(index: number): void {
    if (this.formData().objetivosActividad.length <= 1) return;
    this.formData.update(prev => ({
      ...prev,
      objetivosActividad: prev.objetivosActividad.filter((_: any, i: number) => i !== index)
    }));
  }

  handleObjectiveChange(index: number, value: string): void {
    this.formData.update(prev => {
      const newObjectives = [...prev.objetivosActividad];
      newObjectives[index] = value;
      return { ...prev, objetivosActividad: newObjectives };
    });
  }

  addMaterial(): void {
    this.formData.update(prev => ({
      ...prev,
      materialesActividad: [...prev.materialesActividad, '']
    }));
  }

  removeMaterial(index: number): void {
    if (this.formData().materialesActividad.length <= 1) return;
    this.formData.update(prev => ({
      ...prev,
      materialesActividad: prev.materialesActividad.filter((_: any, i: number) => i !== index)
    }));
  }

  handleMaterialChange(index: number, value: string): void {
    this.formData.update(prev => {
      const newMaterials = [...prev.materialesActividad];
      newMaterials[index] = value;
      return { ...prev, materialesActividad: newMaterials };
    });
  }

  getCategoryName(id: string): string {
    if (!id) return 'N/A';
    const category = this.categoryOptions.find(c => c.value === id);
    return category ? category.label : 'N/A';
  }

  getInstructorName(id: string): string {
    if (!id) return 'N/A';
    const instructor = this.instructorOptions.find(i => i.value === id);
    return instructor ? instructor.label : 'N/A';
  }

  goToStep(stepId: number): void {
    const current = this.currentStep();
    if (stepId > current) {
      for (let i = current; i < stepId; i++) {
        if (!this.validateStep(i)) {
          this.currentStep.set(i);
          return;
        }
      }
    }
    this.currentStep.set(stepId);
    if (stepId === this.steps.length) {
        this.formData.update(data => ({...data}));
    }
  }

  validateStep(step: number): boolean {
    const newErrors: any = {};
    const data = this.formData();

    switch (step) {
      case 1:
        if (!data.titulo?.trim()) newErrors.titulo = 'Título es requerido';
        if (!data.descripcionTotal?.trim()) newErrors.descripcionTotal = 'La descripción detallada es requerida';
        if (!data.tipoActividadId) newErrors.tipoActividadId = 'Categoría es requerida';
        break;
      case 2:
        if (!data.fecha) newErrors.fecha = 'Fecha de inicio es requerida';
        if (!data.horaInicio) newErrors.horaInicio = 'Hora de inicio es requerida';
        if (data.locationType === 'virtual' && !data.platform) {
          newErrors.platform = 'Plataforma es requerida para eventos virtuales';
        }
        if (data.locationType === 'presential' && !data.room) {
          newErrors.room = 'Sala es requerida para eventos presenciales';
        }
        break;
      case 3:
        if (this.instructorSelectionMode() === 'existing' && !data.ponenteId) {
          newErrors.ponenteId = 'Debe seleccionar un instructor existente.';
        }
        break;
      case 5:
        if (!data.cuposTotal || data.cuposTotal < 1) {
          newErrors.cuposTotal = 'Capacidad máxima debe ser al menos 1';
        }
        break;
    }

    this.errors.set(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  handleNext() {
    const current = this.currentStep();
    if (this.validateStep(current)) {
      const nextStep = current + 1;
      this.currentStep.set(nextStep);
      if (nextStep === this.steps.length) { // Al entrar en la vista de resumen
        this.formData.update(data => ({...data})); // Forzar actualización para el resumen
      }
    }
  }

  handlePrevious() {
    this.currentStep.update(prev => Math.max(prev - 1, 1));
  }

  handleSubmit() {
    // Validate all steps before submitting
    for (let i = 1; i <= this.steps.length; i++) {
      if (!this.validateStep(i)) {
        this.currentStep.set(i);
        return;
      }
    }

    this._actividadService.createActividad(this.formData()).subscribe({
      next: (response) => {
        console.log('Actividad creada exitosamente', response);
        this.save.emit(this.formData());
        this.close.emit();
      },
      error: (error) => {
        console.error('Error al crear la actividad', error);
      }
    });
  }
}
