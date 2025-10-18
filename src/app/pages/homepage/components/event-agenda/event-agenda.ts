import { CommonModule, formatDate } from '@angular/common';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  Calendar, UserCheck, Award, Mic, Code, Users, Coffee, Trophy, Network,
  Info, ArrowRight, UserPlus
} from 'lucide-angular';
import { finalize } from 'rxjs';

// Import service and interface
import { Actividad } from '../../../workshop-activity-catalog/services/actividad';
import { Activity } from '../../../workshop-activity-catalog/models/activity.interface';
import { Auth } from '../../../login-registration/services/auth';

// Define the structure the template uses
interface AgendaEvent {
  time: string;
  title: string;
  type: string;
  location: string;
  description: string;
  speaker?: string;
}

interface AgendaDay {
  day: number;
  date: string;
  title: string;
  theme: string;
  events: AgendaEvent[];
}

@Component({
  selector: 'app-event-agenda',
  standalone: true, // Make it standalone
  imports: [
    CommonModule,
    LucideAngularModule,
    RouterLink
  ],
  templateUrl: './event-agenda.html',
  styleUrl: './event-agenda.css'
})
export class EventAgenda implements OnInit {
  selectedDay: number = 1;
  loading = signal(true);
  agendaDays: WritableSignal<AgendaDay[]> = signal([]);

  isLoggedIn: boolean = false;

  private actividadService = inject(Actividad);
  private readonly authService = inject(Auth);

  readonly icons = {
    calendar: Calendar,
    userCheck: UserCheck,
    award: Award,
    mic: Mic,
    code: Code,
    users: Users,
    coffee: Coffee,
    trophy: Trophy,
    network: Network,
    info: Info,
    arrowRight: ArrowRight,
    userPlus: UserPlus
  };

  constructor() { // Use constructor to set initial auth state
    this.isLoggedIn = this.authService.isAuthenticated;
  }

  ngOnInit(): void {
    this.loadAgendaData();
  }

  loadAgendaData(): void {
    this.loading.set(true);
    this.actividadService.getAll(50, 'fecha', 'asc', 0, '')
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          const activities = response.data;
          const groupedByDate = this.groupActivitiesByDate(activities);
          const formattedAgenda = this.formatAgenda(groupedByDate);
          this.agendaDays.set(formattedAgenda);
        },
        error: (err) => {
          console.error('Error loading activities:', err);
          // Handle error, maybe show a message to the user
        }
      });
  }

  private groupActivitiesByDate(activities: Activity[]): Map<string, Activity[]> {
    const grouped = new Map<string, Activity[]>();
    activities.forEach(activity => {
      const date = activity.date; // Assuming date is in a string format like 'YYYY-MM-DD'
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(activity);
    });
    return grouped;
  }

  private formatAgenda(groupedActivities: Map<string, Activity[]>): AgendaDay[] {
    let dayCounter = 1;
    const agendaDays: AgendaDay[] = [];

    // Define titles and themes for each day, can be extended
    const dayInfo = [
        { title: "Día de Apertura", theme: "Fundamentos y Tendencias" },
        { title: "Día de Profundización", theme: "Tecnologías Emergentes" },
        { title: "Día de Clausura", theme: "Innovación y Futuro" }
    ];

    for (const [date, activities] of groupedActivities.entries()) {
      // Sort activities by start time for the day

      activities.sort((a, b) => {
        const timeTo24Hour = (timeStr: string) => {
          const [time, modifier] = timeStr.split(' ');
          let [hours, minutes] = time.split(':').map(Number);

          if (hours === 12) {
            hours = modifier.toUpperCase() === 'AM' ? 0 : 12;
          } else if (modifier.toUpperCase() === 'PM') {
            hours += 12;
          }
          
          return hours * 60 + minutes;
        };

        const aTotalMinutes = timeTo24Hour(a.startTime);
        const bTotalMinutes = timeTo24Hour(b.startTime);

        return aTotalMinutes - bTotalMinutes;
      });
      

      const dayInfoForThisDay = dayInfo[dayCounter - 1] || { title: `Día ${dayCounter}`, theme: "Actividades del Congreso" };

      agendaDays.push({
        day: dayCounter,
        date: this.formatDate(date),
        title: dayInfoForThisDay.title,
        theme: dayInfoForThisDay.theme,
        events: activities.map(activity => ({
          time: `${activity.startTime} - ${activity.endTime}`,
          title: activity.title,
          type: activity.category.toLowerCase(), // Use category for type
          location: activity.location,
          description: activity.description,
          speaker: activity.instructor
        }))
      });
      dayCounter++;
    }
    return agendaDays;
  }

  private formatDate(dateString: string): string {
    if (!dateString) return 'Fecha no definida';
    // Usamos el pipe nativo de Angular 'date' con el formato 'shortDate' y locale 'es'
    // Como no podemos usar pipes en la clase, usamos la función global de JS/Angular
    try {
      return formatDate(dateString, 'dd/MM/yyyy', 'es-ES');
    } catch (e) {
      // Fallback si la fecha no es válida
      return dateString;
    }
  }

  selectDay(day: number): void {
    this.selectedDay = day;
  }

  getEventIcon(type: string): any {
    const iconMap: { [key: string]: any } = {
      registration: this.icons.userCheck,
      ceremony: this.icons.award,
      keynote: this.icons.mic,
      workshop: this.icons.code,
      taller: this.icons.code, // alias for workshop
      conferencia: this.icons.mic, // alias for keynote/panel
      panel: this.icons.users,
      break: this.icons.coffee,
      competencia: this.icons.trophy,
      competition: this.icons.trophy,
      networking: this.icons.network,
      social: this.icons.users,
    };
    return iconMap[type] || this.icons.calendar;
  }

  getEventColor(type: string): any {
    const colorMap: { [key: string]: string } = {
      registration: 'bg-blue-100 text-blue-700 border-blue-200',
      ceremony: 'bg-purple-100 text-purple-700 border-purple-200',
      keynote: 'bg-[var(--color-primary)]/[0.10] text-[var(--color-primary)] border-[var(--color-primary)]/[0.20]',
      conferencia: 'bg-[var(--color-primary)]/[0.10] text-[var(--color-primary)] border-[var(--color-primary)]/[0.20]',
      workshop: 'bg-green-100 text-green-700 border-green-200',
      taller: 'bg-green-100 text-green-700 border-green-200',
      panel: 'bg-orange-100 text-orange-700 border-orange-200',
      break: 'bg-gray-100 text-gray-700 border-gray-200',
      competition: 'bg-red-100 text-red-700 border-red-200',
      competencia: 'bg-red-100 text-red-700 border-red-200',
      networking: 'bg-teal-100 text-teal-700 border-teal-200',
      social: 'bg-teal-100 text-teal-700 border-teal-200',
    };
    return colorMap[type] || 'bg-gray-100 text-gray-700 border-gray-200';
  }
}