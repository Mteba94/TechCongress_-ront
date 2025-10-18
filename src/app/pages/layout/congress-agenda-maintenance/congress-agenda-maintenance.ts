import { Component, inject, OnInit, signal, computed, effect, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectComponent } from '../../../shared/components/reusables/select-component/select-component';
import { Button } from '../../../shared/components/reusables/button/button';
import { AlertTriangle, Calendar, CheckCircle, Edit, Eye, LucideAngularModule } from 'lucide-angular';
import { Header } from '../../../shared/components/layout/header/header';
import { Breadcrumbs } from '../../../shared/components/reusables/breadcrumbs/breadcrumbs';
import { ActivityLibrary } from '../../congress-agenda-maintenance/components/activity-library/activity-library';
import { Activity } from '../../workshop-activity-catalog/models/activity.interface';
import { Actividad } from '../../workshop-activity-catalog/services/actividad';
import { finalize } from 'rxjs';
import { AgendaWizard } from '../../congress-agenda-maintenance/components/agenda-wizard/agenda-wizard';

// --- INTERFACES ---

interface AgendaItem {
  id: string;
  activityId: string;
  day: number;
  startTime: string;
  endTime: string;
  room: string;
  status: 'confirmed' | 'tentative';
}

interface Conflict {
  type: 'room_overlap' | 'instructor_conflict';
  items: string[];
  message: string;
}

interface LibraryFilters {
  search: string;
  category: string;
  duration: string;
}

@Component({
  selector: 'app-congress-agenda-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    SelectComponent,
    Button,
    LucideAngularModule,
    Header,
    Breadcrumbs,
    ActivityLibrary,
    AgendaWizard
  ],
  templateUrl: './congress-agenda-maintenance.html',
  styleUrls: ['./congress-agenda-maintenance.css']
})
export class CongressAgendaMaintenance implements OnInit {
  readonly icons = {
    calendar: Calendar,
    edit: Edit,
    eye: Eye,
    checkCircle: CheckCircle,
    alertTriangle: AlertTriangle
  }
  
  // --- MOCK DATA ---
  readonly mockAgenda: AgendaItem[] = [];

  readonly timeSlots: string[] = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00'
  ];

  readonly rooms: string[] = [
    'Auditorio Principal', 'Sala A', 'Sala B', 'Sala C',
    'Lab de Computadoras', 'Lobby Central', 'Terraza'
  ];

  // --- STATE SIGNALS ---
  user = signal<any>(null);
  activities: WritableSignal<Activity[]> = signal([]);
  agendaItems: WritableSignal<AgendaItem[]> = signal([]);
  selectedDay = signal(1);
  loading = signal(false);
  showWizard = signal(false);
  agendaStatus = signal('draft');
  
  libraryFilters: WritableSignal<LibraryFilters> = signal({
    search: '',
    category: '',
    duration: ''
  });

  // --- INJECTED SERVICES ---
  private actividadService = inject(Actividad);

  // --- COMPUTED SIGNALS (DERIVED STATE) ---
  activitiesForSelectedDayCount = computed(() => {
    return this.agendaItems().filter(item => item.day === this.selectedDay()).length;
  });

  conflicts = computed<Conflict[]>(() => {
    const items = this.agendaItems();
    const acts = this.activities();
    const newConflicts: Conflict[] = [];
    
    items.forEach((item1, index1) => {
      items.slice(index1 + 1).forEach((item2) => {
        // Check for time overlap in the same room on the same day
        if (item1.room === item2.room && item1.day === item2.day) {
          const start1 = new Date(`2025-01-01T${item1.startTime}`);
          const end1 = new Date(`2025-01-01T${item1.endTime}`);
          const start2 = new Date(`2025-01-01T${item2.startTime}`);
          const end2 = new Date(`2025-01-01T${item2.endTime}`);
          
          if (start1 < end2 && start2 < end1) {
            newConflicts.push({
              type: 'room_overlap',
              items: [item1.id, item2.id],
              message: `Conflicto de sala: ${item1.room} ocupada simultáneamente`
            });
          }
        }
        
        // Check for instructor availability
        const activity1 = acts.find(a => String(a.id) === item1.activityId);
        const activity2 = acts.find(a => String(a.id) === item2.activityId);
        
        if (activity1?.instructor && activity2?.instructor && 
            activity1.instructor === activity2.instructor && 
            item1.day === item2.day) {
          const start1 = new Date(`2025-01-01T${item1.startTime}`);
          const end1 = new Date(`2025-01-01T${item1.endTime}`);
          const start2 = new Date(`2025-01-01T${item2.startTime}`);
          const end2 = new Date(`2025-01-01T${item2.endTime}`);
          
          if (start1 < end2 && start2 < end1) {
            newConflicts.push({
              type: 'instructor_conflict',
              items: [item1.id, item2.id],
              message: `${activity1.instructor} programado en dos actividades simultáneas`
            });
          }
        }
      });
    });
    
    return newConflicts;
  });

  filteredActivities = computed<Activity[]>(() => {
    const allActivities = this.activities();
    const filters = this.libraryFilters();

    return allActivities.filter(activity => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search || 
        activity.title.toLowerCase().includes(searchLower) ||
        (activity.instructor && activity.instructor.toLowerCase().includes(searchLower));
      
      const matchesCategory = !filters.category || activity.category === filters.category;
      
      const matchesDuration = !filters.duration || (() => {
        const duration = parseInt(activity.duration, 10) || 0;
        switch (filters.duration) {
          case 'short': return duration <= 60;
          case 'medium': return duration > 60 && duration <= 180;
          case 'long': return duration > 180;
          default: return true;
        }
      })();
      
      return matchesSearch && matchesCategory && matchesDuration;
    });
  });

  constructor() {
    // Effect to log conflicts when they change, similar to useEffect
    effect(() => {
      console.log('Conflicts detected:', this.conflicts());
    });
  }

  ngOnInit(): void {
    // TODO: Implement authentication check
     this.user.set({ name: 'Admin', role: 'admin' });

    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.actividadService.getAll(100, 'titulo', 'asc', 0, '')
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response) => {
          this.activities.set(response.data);
          // For now, we keep the agenda empty until we load it from a service as well
          this.agendaItems.set(this.mockAgenda); 
        },
        error: (err) => {
          console.error('Error loading activities:', err);
          // Optionally, show an error message to the user
        }
      });
  }

  // --- EVENT HANDLERS ---

  handleDragEnd(result: any): void {
    if (!result?.destination) return;

    const { source, destination } = result;
    
    // If dropped on timeline, create new agenda item
    if (destination?.droppableId?.startsWith('timeline')) {
      const activityId = result.draggableId;
      const timeSlot = destination.droppableId.split('-')[1];
      const room = destination.droppableId.split('-')[2] || this.rooms[0];
      
      const activity = this.activities().find(a => String(a.id) === activityId);
      if (!activity) return;
      
      const endTime = this.calculateEndTime(timeSlot, parseInt(activity.duration, 10) || 0);
      
      const newAgendaItem: AgendaItem = {
        id: `agenda_${Date.now()}`,
        activityId,
        day: this.selectedDay(),
        startTime: timeSlot,
        endTime,
        room,
        status: 'tentative'
      };
      
      this.agendaItems.update(prev => [...prev, newAgendaItem]);
    }
    
    // TODO: Handle reordering within timeline
    if (source?.droppableId === destination?.droppableId && 
        source?.droppableId?.startsWith('timeline')) {
      // Handle reordering logic
    }
  }

  handleFilterChange(newFilters: LibraryFilters): void {
    this.libraryFilters.set(newFilters);
  }

  handleSaveAgenda(agenda: AgendaItem[]): void {
    this.agendaItems.set(agenda);
    this.showWizard.set(false);
  }

  handleRemoveFromAgenda(agendaItemId: string): void {
    this.agendaItems.update(prev => prev.filter(item => item.id !== agendaItemId));
  }

  handleUpdateAgendaItem(agendaItemId: string, updates: Partial<AgendaItem>): void {
    this.agendaItems.update(prev => 
      prev.map(item => 
        item.id === agendaItemId 
          ? { ...item, ...updates }
          : item
      )
    );
  }

  handlePublishAgenda(): void {
    if (this.conflicts().length > 0) {
      alert('No se puede publicar la agenda con conflictos pendientes. Resuelve todos los conflictos primero.');
      return;
    }
    
    if (confirm('¿Estás seguro de que quieres publicar la agenda? Los participantes serán notificados.')) {
      this.agendaStatus.set('published');
      // Here would be the API call to publish
      console.log('Agenda published');
    }
  }

  // --- UTILITY METHODS ---

  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date(2025, 0, 1, hours, minutes);
    startDate.setMinutes(startDate.getMinutes() + durationMinutes);
    return `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
  }
}