import { Component, computed, inject, signal, OnDestroy } from '@angular/core';
import { Activity as ActivityInterface } from '../../workshop-activity-catalog/models/activity.interface';
import { Activity, Calendar, CheckSquare, Loader, LucideAngularModule, Search, Square } from 'lucide-angular';
import { Header } from '../../../shared/components/layout/header/header';
import { Breadcrumbs } from '../../../shared/components/reusables/breadcrumbs/breadcrumbs';
import { Button } from '../../../shared/components/reusables/button/button';
import { InputComponent } from '../../../shared/components/reusables/input/input';
import { SelectComponent } from '../../../shared/components/reusables/select-component/select-component';
import { Actividad } from '../../workshop-activity-catalog/services/actividad';
import { ActivityGrid } from '../../activities-workshop-management/components/activity-grid/activity-grid';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { ActivityList } from '../../activities-workshop-management/components/activity-list/activity-list';
import { CreateActivityWizard } from '../../activities-workshop-management/components/create-activity-wizard/create-activity-wizard';

/** Interface for component filter values. */
interface Filters {
  searchTerm: string;
  category: string;
  status: string;
  instructor: string;
  capacity: 'low' | 'medium' | 'high' | 'full' | '';
  dateRange: string;
}

/**
 * @description
 * Component for managing the creation, visualization, and administration of congress activities and workshops.
 * It provides a comprehensive control center for administrators.
 */
@Component({
  selector: 'app-activities-workshop-management',
  standalone: true,
  imports: [
    LucideAngularModule,
    Header,
    Breadcrumbs,
    Button,
    InputComponent,
    SelectComponent,
    ActivityGrid,
    ActivityList,
    CreateActivityWizard
  ],
  templateUrl: './activities-workshop-management.html',
  styleUrl: './activities-workshop-management.css'
})
export class ActivitiesWorkshopManagement implements OnDestroy {
  /** Icons used in the template. */
  readonly icons = {
    loader: Loader,
    calendar: Calendar,
    activity: Activity,
    checkSquare: CheckSquare,
    search: Search,
    square: Square
  };

  /** Service for fetching activity data. */
  private readonly actividadService = inject(Actividad);
  
  /** Subject to manage subscription cleanup on component destruction. */
  private readonly destroy$ = new Subject<void>();

  // --- STATE SIGNALS ---

  /** Holds the list of all activities fetched from the service. */
  activities = signal<ActivityInterface[]>([]);
  /** Represents the loading state for data fetching operations. */
  loading = signal(true);
  /** Indicates if there are more activities to load from the server. */
  hasMore = signal(true);
  /** Holds the currently logged-in user's data. */
  user = signal<any | null>({}); // TODO: Replace 'any' with a proper User interface.

  // --- UI STATE SIGNALS ---

  /** Current display mode for activities ('grid' or 'list'). */
  viewMode = signal<'grid' | 'list'>('grid');
  /** Toggles the visibility of the calendar view. */
  showCalendarView = signal(false);
  /** Toggles the visibility of the activity creation wizard. */
  showCreateWizard = signal(false);
  /** Toggles the visibility of the activity detail modal. */
  showActivityModal = signal(false);
  /** Toggles the visibility of the bulk operations modal. */
  showBulkModal = signal(false);
  /** Current sorting criteria for the activities list. */
  sortBy = signal('popularity');

  // --- SELECTION STATE SIGNALS ---

  /** The currently selected activity for viewing or editing details. */
  selectedActivity = signal<ActivityInterface | null>(null);
  /** List of IDs of all selected activities for bulk operations. */
  selectedActivities = signal<string[]>([]);

  // --- FILTER AND PAGINATION STATE ---

  /** Holds all active filter criteria for the activities list. */
  filters = signal<Filters>({
    searchTerm: '',
    category: 'all',
    status: '',
    instructor: '',
    capacity: '',
    dateRange: ''
  });
  
  /** Current page number for pagination. */
  currentPage = signal(0);
  /** Number of items to fetch per page. */
  readonly pageSize = 6;

  /** Static options for the category filter dropdown. */
  readonly categoryOptions = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'workshop', label: 'Talleres' },
    { value: 'competition', label: 'Competencias' },
    { value: 'social', label: 'Actividades sociales' }
  ];
  
  // --- DERIVED/COMPUTED STATE ---

  /**
   * A computed signal that filters and sorts the activities based on the current
   * state of `filters` and `sortBy` signals.
   */
  processedActivities = computed(() => {
    let filtered = this.activities();
    const currentFilters = this.filters();
    const currentSort = this.sortBy();

    // Apply search term filter
    if (currentFilters.searchTerm) {
      const searchLower = currentFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(searchLower) ||
        activity.description.toLowerCase().includes(searchLower) ||
        activity.instructor.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (currentFilters.category && currentFilters.category !== 'all') {
      filtered = filtered.filter(activity => activity.category === currentFilters.category);
    }
    
    // TODO: Implement other filters (status, instructor, etc.) here.

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (currentSort) {
        case 'popularity':
          return b.enrolled - a.enrolled;
        case 'schedule':
          return new Date(`2000-01-01T${a.startTime}`).getTime() - new Date(`2000-01-01T${b.startTime}`).getTime();
        case 'category':
          return a.category.localeCompare(b.category);
        case 'availability':
          const spotsA = a.capacity - a.enrolled;
          const spotsB = b.capacity - b.enrolled;
          return spotsB - spotsA;
        default:
          return 0;
      }
    });
  });

  // --- LIFECYCLE HOOKS ---

  /**
   * Angular lifecycle hook that is called after data-bound properties of a directive are initialized.
   */
  ngOnInit(): void {
    this._fetchActivities();
  }

  /**
   * Angular lifecycle hook that is called when a directive, pipe, or service is destroyed.
   * Used for cleanup.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- DATA FETCHING METHODS ---

  /**
   * Fetches activities from the service. Can either load the initial set or append more activities.
   * @param {boolean} [loadMore=false] - If true, fetches the next page and appends it to the existing list.
   * @private
   */
  private _fetchActivities(loadMore: boolean = false): void {
    this.loading.set(true);
    const pageToFetch = loadMore ? this.currentPage() + 1 : 0;

    this.actividadService.getAll(this.pageSize, 'titulo', 'asc', pageToFetch, this.filters().searchTerm)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.set(false))
      )
      .subscribe(resp => {
        console.log(resp);
        if (loadMore) {
          this.activities.update(existing => [...existing, ...resp.data]);
        } else {
          this.activities.set(resp.data);
        }
        this.currentPage.set(pageToFetch);
        this.hasMore.set(this.activities().length < resp.totalRecords);
      });
  }
  
  /**
   * Public method to trigger loading more activities.
   */
  loadMoreActivities(): void {
    if (!this.hasMore() || this.loading()) return;
    this._fetchActivities(true);
  }

  // --- EVENT HANDLERS ---

  /**
   * Updates a specific filter value and triggers a refetch of the activities.
   * @param {keyof Filters} key - The filter property to update.
   * @param {string} value - The new value for the filter.
   */
  handleFilterChange(key: keyof Filters, value: string): void {
    this.filters.update(prev => ({ ...prev, [key]: value }));
    // Trigger a refetch whenever filters change
    this._fetchActivities();
  }

  /**
   * Toggles the selection of all currently visible activities.
   * If all are selected, it deselects all. Otherwise, it selects all.
   */
  handleSelectAll(): void {
    const allIds = this.processedActivities().map(activity => String(activity.id));
    if (this.selectedActivities().length === allIds.length) {
      this.selectedActivities.set([]);
    } else {
      this.selectedActivities.set(allIds);
    }
  }

  /**
   * Placeholder for handling bulk operations on selected activities.
   * @logs The currently selected activity IDs.
   */
  handleBulkApply(): void {
    console.log('Bulk apply clicked for:', this.selectedActivities());
  }

  /**
   * Placeholder for handling the enrollment action for an activity.
   * @param {ActivityInterface} activity - The activity to enroll in.
   * @logs The activity being enrolled in.
   */
  handleEnroll(activity: ActivityInterface): void {
    console.log('Enroll clicked for:', activity);
  }

  /**
   * Sets the selected activity to be displayed in a detail view or modal.
   * @param {ActivityInterface} activity - The activity to view.
   * @logs The activity being viewed.
   */
  handleViewDetails(activity: ActivityInterface): void {
    this.selectedActivity.set(activity);
    console.log('View details for:', activity);
    // this.isDetailModalOpen.set(true); // Example of how to open a modal
  }

  /**
   * Sets the display mode for activities.
   * @param {'grid' | 'list'} mode - The view mode to set.
   */
  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  handleCreateSave(activity: ActivityInterface){

  }

}
