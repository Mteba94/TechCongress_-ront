import { Component, signal, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ActivityCard } from '../activity-card/activity-card';
import { CommonModule } from '@angular/common';
import { ChevronDown, LucideAngularModule, Search } from 'lucide-angular';
import { Button } from '../../../../shared/components/reusables/button/button';

interface Activity {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: boolean;
  instructor: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  capacity: number;
  enrolled: number;
  code: string;
}

@Component({
  selector: 'app-activity-grid',
  imports: [
    ActivityCard,
    CommonModule,
    LucideAngularModule,
    //Button
  ],
  templateUrl: './activity-grid.html',
  styleUrl: './activity-grid.css'
})
export class ActivityGrid implements OnChanges {
  readonly icons = {
    search: Search,
    chevronDown: ChevronDown
  }
  @Input() activitiesInput!: Activity[];
  @Input() loadingInput!: boolean;
  @Input() userEnrollmentsInput!: number[];
  @Input() hasMoreInput!: boolean;

  @Output() onEnroll = new EventEmitter<Activity>();
  @Output() onViewDetails = new EventEmitter<Activity>();
  @Output() onLoadMore = new EventEmitter<void>();

  _activities = signal<Activity[]>([]);
  _loading = signal<boolean>(false);
  _userEnrollments = signal<number[]>([]);
  _hasMore = signal<boolean>(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activitiesInput']) {
      this._activities.set(this.activitiesInput);
    }
    if (changes['loadingInput']) {
      this._loading.set(this.loadingInput);
    }
    if (changes['userEnrollmentsInput']) {
      this._userEnrollments.set(this.userEnrollmentsInput);
    }
    if (changes['hasMoreInput']) {
      this._hasMore.set(this.hasMoreInput);
    }
  }

  handleEnroll(activity: Activity) {
    this.onEnroll.emit(activity);
  }

  handleViewDetails(activity: Activity) {
    this.onViewDetails.emit(activity);
  }

  handleLoadMore() {
    this.onLoadMore.emit();
  }

  getIconSvg(name: string): string {
    switch (name) {
      case 'Search': return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`;
      case 'ChevronDown': return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>`;
      default: return '';
    }
  }
}