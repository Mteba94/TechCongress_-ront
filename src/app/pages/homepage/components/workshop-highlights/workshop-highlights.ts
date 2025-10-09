import { Component, computed, inject, signal } from '@angular/core';
import { ArrowLeft, ArrowRight, Clock, Code, Grid3X3, LucideAngularModule, User, UserPlus, Users } from 'lucide-angular';
import { Button } from '../../../../shared/components/reusables/button/button';
import { Actividad } from '../../../workshop-activity-catalog/services/actividad';
import { Activity } from '../../../workshop-activity-catalog/models/activity.interface';


interface Workshop {
  id: number;
  title: string;
  instructor: string;
  duration: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  capacity: string;
  image: string;
  description: string;
  topics: string[];
  featured: boolean;
  isExpanded?: boolean;
}

@Component({
  selector: 'app-workshop-highlights',
  imports: [
    LucideAngularModule,
    Button
  ],
  templateUrl: './workshop-highlights.html',
  styleUrl: './workshop-highlights.css'
})
export class WorkshopHighlights {
  readonly icons = {
    code: Code,
    user: User,
    clock: Clock,
    users: Users,
    userPlus: UserPlus,
    arrowRight: ArrowRight,
  };

  workshops = signal<Activity[]>([]);

  private readonly actividadService = inject(Actividad)

  ngOnInit() {
    this.loadInitialActivities();
  }
  
  // Use computed signals to filter the data
  featuredWorkshops = computed(() => this.workshops().filter(w => w.featured));
  otherWorkshops = computed(() => this.workshops().filter(w => !w.featured));

  toggleTopics(id: number): void {
    this.workshops.update(workshops => 
      workshops.map(w => 
        w.id === id ? { ...w, isExpanded: !w.isExpanded } : w
      )
    );
  }

  paginatorOptions = {
    pageSizeOptions: [6, 12, 24],
    pageSize: 6,
    pageLength: 0,
    currentPage: 0,
  };

  loadInitialActivities() {
    //this.loading.set(true);
    this.paginatorOptions.currentPage = 0;
    this.actividadService.getAll(this.paginatorOptions.pageSize, 'titulo', 'asc', this.paginatorOptions.currentPage, '').subscribe(resp => {
      this.workshops.set(resp.data);
      // this.paginatorOptions.pageLength = resp.totalRecords;
      // this.hasMore.set(this.displayedActivities().length < resp.totalRecords);
      // this.loading.set(false);
    });
  }

  /**
   * Returns a Tailwind class for the workshop's difficulty level.
   * @param level The workshop level.
   * @returns Tailwind CSS class string.
   */
  getLevelColor(level: 'beginner' | 'intermediate' | 'advanced'): string {
    const colors = {
      "beginner": "bg-green-100 text-green-700",
      "intermediate": "bg-yellow-100 text-yellow-700",
      "advanced": "bg-red-100 text-red-700"
    };
    return colors[level] || "bg-gray-100 text-gray-700";
  }

  /**
   * Handles navigation to the workshops catalog.
   */
  handleViewAllWorkshops(): void {
    window.location.href = '/workshop-activity-catalog';
  }

  /**
   * Handles navigation to the registration page.
   */
  handleRegister(): void {
    window.location.href = '/login-registration';
  }
}