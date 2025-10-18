import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { X, Check, Sparkles, Info, ArrowLeft, ArrowRight, Zap, LucideAngularModule, FileCog, ListChecks, CalendarPlus, CalendarCheck } from 'lucide-angular';
import { BehaviorSubject, Observable, take } from 'rxjs';
import { SelectComponent } from '../../../../shared/components/reusables/select-component/select-component';
import { InputComponent } from '../../../../shared/components/reusables/input/input';
import { Checkbox } from '../../../../shared/components/reusables/checkbox/checkbox';
import { Activity } from '../../../workshop-activity-catalog/models/activity.interface';

// Define el tipo de dato para las preferencias de prioridades
export type PriorityTime = 'morning' | 'afternoon' | 'evening' | 'any';

export interface PrioritiesConfig {
  keynotes: PriorityTime;
  workshops: PriorityTime;
  competitions: PriorityTime;
  networking: PriorityTime;
}

// Define la estructura de datos para el Wizard
export interface WizardData {
  template: string;
  days: number;
  startTime: string; // Ej. '08:00'
  endTime: string; // Ej. '18:00'
  breakDuration: number; // Minutos
  lunchDuration: number; // Minutos
  selectedActivities: string[]; // IDs de actividades
  autoSchedule: boolean;
  priorities: PrioritiesConfig;
}

// Estructura de un paso del Wizard
export interface WizardStep {
  id: number;
  title: string;
  icon: any;
}

// Estructura para las opciones de plantillas
export interface TemplateOption {
  value: string;
  label: string;
}

// Estructura de la Agenda generada
export interface AgendaItem {
  id: string;
  activityId: string;
  day: number;
  startTime: string;
  endTime: string;
  room: string;
  status: 'tentative' | 'confirmed';
}

// Datos iniciales
export const INITIAL_WIZARD_DATA: WizardData = {
  template: '',
  days: 3,
  startTime: '08:00',
  endTime: '18:00',
  breakDuration: 15,
  lunchDuration: 60,
  selectedActivities: [],
  autoSchedule: true,
  priorities: {
    keynotes: 'morning',
    workshops: 'afternoon',
    competitions: 'any',
    networking: 'evening'
  }
};


@Component({
  selector: 'app-agenda-wizard',
  imports: [
    LucideAngularModule,
    CommonModule,
    SelectComponent,
    InputComponent,
    Checkbox
  ],
  templateUrl: './agenda-wizard.html',
  styleUrl: './agenda-wizard.css'
})
export class AgendaWizard {
  @Input() activities: Activity[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<AgendaItem[]>();
  
  public currentStep: number = 1;
  
  public wizardData: WizardData = INITIAL_WIZARD_DATA;

  public readonly steps: WizardStep[] = [
    { id: 1, title: 'Configuración Inicial', icon: 'file-cog' },
    { id: 2, title: 'Selección de Actividades', icon: 'list-checks' },
    { id: 3, title: 'Ajustes de Horario', icon: 'calendar-plus' },
    { id: 4, title: 'Revisión y Generación', icon: 'calendar-check' },
  ];

  public templates: TemplateOption[] = [
    { value: 'default', label: 'Plantilla por Defecto' },
    { value: 'tech-focus', label: 'Enfoque Técnico' },
  ];

  public dayOptions = [
    { value: 1, label: '1 día' },
    { value: 2, label: '2 días' },
    { value: 3, label: '3 días' },
    { value: 4, label: '4 días' },
    { value: 5, label: '5 días' }
  ];

  public timePreferenceOptions = [
    { value: 'morning', label: 'Mañana (8:00 - 12:00)' },
    { value: 'afternoon', label: 'Tarde (12:00 - 17:00)' },
    { value: 'evening', label: 'Noche (17:00+)' },
    { value: 'any', label: 'Cualquier momento' }
  ];

  readonly icons = {
    x: X,
    check: Check,
    sparkles: Sparkles,
    info: Info,
    arrowLeft: ArrowLeft,
    arrowRight: ArrowRight,
    zap: Zap,
    fileCog: FileCog,
    listChecks: ListChecks,
    calendarPlus: CalendarPlus,
    calendarCheck: CalendarCheck
  };
  
  onClose() {
    this.close.emit();
  }

  handlePrevious() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  handleNext() {
    if (this.currentStep < this.steps.length) {
      this.currentStep++;
    }
  }

  isNextDisabled(): boolean {
    if (this.currentStep === 1 && !this.wizardData.template) {
      return true;
    }
    if (this.currentStep === 2 && this.wizardData.selectedActivities.length === 0) {
      return true;
    }
    return false;
  }

  handleGenerate() {
    const newAgenda = this.generateAgenda(this.wizardData);
    this.save.emit(newAgenda);
    this.onClose();
  }

  updateWizardData(key: keyof WizardData, value: any) {
    this.wizardData = {
      ...this.wizardData,
      [key]: value
    };
  }

  toggleActivitySelection(activityId: string, checked: boolean) {
    const selected = this.wizardData.selectedActivities;
    if (checked) {
      this.updateWizardData('selectedActivities', [...selected, activityId]);
    } else {
      this.updateWizardData('selectedActivities', selected.filter(id => id !== activityId));
    }
  }

  selectAllActivities() {
    this.updateWizardData('selectedActivities', this.activities.map(a => String(a.id)));
  }

  clearActivitySelection() {
    this.updateWizardData('selectedActivities', []);
  }

  updatePriority(key: keyof PrioritiesConfig, value: PriorityTime) {
    this.wizardData = {
      ...this.wizardData,
      priorities: {
        ...this.wizardData.priorities,
        [key]: value
      }
    };
  }

  getTemplateLabel(templateValue: string): string {
    return this.templates.find(t => t.value === templateValue)?.label || '';
  }

  getActivityById(id: string): Activity | undefined {
    return this.activities.find(a => String(a.id) === id);
  }

  formatDuration(minutes: number): string {
    if (!minutes) return 'N/A';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m > 0 ? `${m}m` : ''}`;
  }

  getCurrentStepTitle(): string {
    const step = this.steps.find(s => s.id === this.currentStep);
    return step ? step.title : '';
  }

  private generateAgenda(config: WizardData): AgendaItem[] {
    const agenda: AgendaItem[] = [];
    let currentId = 1;

    const selectedActivities = this.activities.filter(activity =>
      config.selectedActivities.includes(String(activity.id))
    );

    const rooms = ['Auditorio Principal', 'Sala A', 'Sala B', 'Lab de Computadoras'];
    let currentTime = config.startTime;
    let currentDay = 1;

    selectedActivities.forEach((activity, index) => {
      const duration = activity.duration || 120;
      const endTime = this.addMinutesToTime(currentTime, 0);

      agenda.push({
        id: `agenda_${currentId++}`,
        activityId: String(activity.id),
        day: currentDay,
        startTime: currentTime,
        endTime: endTime,
        room: rooms[index % rooms.length],
        status: 'tentative'
      });

      currentTime = this.addMinutesToTime(endTime, config.breakDuration);

      if (this.isTimeLater(currentTime, config.endTime)) {
        currentDay++;
        currentTime = config.startTime;
      }
    });

    return agenda;
  }

  private addMinutesToTime(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  }

  private isTimeLater(time1: string, time2: string): boolean {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    return (h1 * 60 + m1) > (h2 * 60 + m2);
  }
}
