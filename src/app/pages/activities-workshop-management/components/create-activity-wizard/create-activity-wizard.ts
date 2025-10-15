import { Component, EventEmitter, OnInit, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Info, Calendar, User, BookOpen, Settings, CheckCircle, X, ChevronRight, Monitor, MapPin, Combine, Gift, CreditCard, PlusCircle, Trash2 } from 'lucide-angular';

import { Button } from '../../../../shared/components/reusables/button/button';
import { InputComponent } from '../../../../shared/components/reusables/input/input';
import { SelectComponent, SelectOption } from '../../../../shared/components/reusables/select-component/select-component';
import { NivelActividad } from '../../../workshop-activity-catalog/services/nivel-actividad';
import { nivelActividadResponse } from '../../../workshop-activity-catalog/models/nivel-actividad.interface';
import { Ponente } from '../../../workshop-activity-catalog/services/ponente';
import { PonenteResponse } from '../../../homepage/models/ponente-response.interface';
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
    // Basic Information
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    imagen: null,
    // Schedule & Location
    startDate: '',
    startTime: '',
    endTime: '',
    locationType: 'virtual',
    platform: '',
    room: '',
    address: '',
    // Capacity & Enrollment
    maxCapacity: '',
    prerequisites: '',
    // Instructor & Resources
    instructorId: '',
    // Content & Materials
    objectives: [''],
    difficulty: 'beginner',
    // Settings
    status: 'draft',
  });
  errors = signal<any>({});

  // --- DATA () ---
  // TODO: Cargar desde servicios
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
        // Manejar el error, por ejemplo, mostrando un mensaje al usuario
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

    // Extraer el valor si el argumento es un objeto de evento (ej. InputEvent, ChangeEvent)
    if (value && value.target && typeof value.target.value !== 'undefined') {
      const target = value.target as HTMLInputElement;
      if (target.type === 'checkbox') {
        actualValue = target.checked;
      } else {
        actualValue = target.value;
      }
    }

    this.formData.update(prev => ({ ...prev, [field]: actualValue }));

    if (field === 'description') {
      // Asegurarse de que la descripción corta se genere a partir del valor extraído
      const shortDesc = (actualValue || '').substring(0, 150) + '...';
      this.formData.update(prev => ({ ...prev, shortDescription: shortDesc }));
    }

    if (this.errors()[field]) {
      this.errors.update(prev => ({ ...prev, [field]: '' }));
    }
  }

  handleFileInput(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      this.formData.update(prev => ({ ...prev, imagen: fileList![0] }));
    }
  }

  handleNewInstructorChange(field: string, value: any) {
    this.formData.update(prev => ({
      ...prev,
      newInstructor: {
        ...prev.newInstructor,
        [field]: value
      }
    }));
  }

  addObjective(): void {
    this.formData.update(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  }

  removeObjective(index: number): void {
    if (this.formData().objectives.length <= 1) return;
    this.formData.update(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_: any, i: number) => i !== index)
    }));
  }

  handleObjectiveChange(index: number, value: string): void {
    this.formData.update(prev => {
      const newObjectives = [...prev.objectives];
      newObjectives[index] = value;
      return { ...prev, objectives: newObjectives };
    });
  }

  validateStep(step: number): boolean {
    const newErrors: any = {};
    const data = this.formData();

    switch (step) {
      case 1:
        if (!data.title?.trim()) newErrors.title = 'Título es requerido';
        if (!data.description?.trim()) newErrors.description = 'Descripción es requerida';
        if (!data.category) newErrors.category = 'Categoría es requerida';
        // if (!data.type) newErrors.type = 'Tipo es requerido';
        break;
      case 2:
        if (!data.startDate) newErrors.startDate = 'Fecha de inicio es requerida';
        if (!data.startTime) newErrors.startTime = 'Hora de inicio es requerida';
        if (data.locationType === 'virtual' && !data.platform) {
          newErrors.platform = 'Plataforma es requerida para eventos virtuales';
        }
        if (data.locationType === 'presential' && !data.room) {
          newErrors.room = 'Sala es requerida para eventos presenciales';
        }
        break;
      case 3:
        if (this.instructorSelectionMode() === 'existing' && !data.instructorId) {
          newErrors.instructorId = 'Debe seleccionar un instructor existente.';
        } 
        // else if (this.instructorSelectionMode() === 'new') {
        //   if (!data.newInstructor.name?.trim()) newErrors.newInstructorName = 'El nombre es requerido.';
        //   if (!data.newInstructor.email?.trim()) newErrors.newInstructorEmail = 'El email es requerido.';
        // }
        break;
      case 5:
        // if (data.pricingType === 'paid' && (!data.amount || data.amount <= 0)) {
        //   newErrors.amount = 'Precio debe ser mayor a 0 para eventos pagados';
        // }
        if (!data.maxCapacity || data.maxCapacity < 1) {
          newErrors.maxCapacity = 'Capacidad máxima debe ser al menos 1';
        }
        break;
    }

    this.errors.set(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  handleNext() {
    if (this.validateStep(this.currentStep())) {
      this.currentStep.update(prev => Math.min(prev + 1, this.steps.length));
    }
  }

  handlePrevious() {
    this.currentStep.update(prev => Math.max(prev - 1, 1));
  }

  handleSubmit() {
    if (this.validateStep(this.currentStep())) {
      this._actividadService.createActividad(this.formData()).subscribe({
        next: (response) => {
          console.log('Actividad creada exitosamente', response);
          this.save.emit(this.formData());
          this.close.emit();
        },
        error: (error) => {
          console.error('Error al crear la actividad', error);
          // Aquí podrías actualizar el estado de los errores para mostrar un mensaje al usuario
        }
      });
    }
  }
}
