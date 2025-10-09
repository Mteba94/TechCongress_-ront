import { Component, signal, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ActivityCard } from '../activity-card/activity-card';
import { CommonModule } from '@angular/common';
import { ChevronDown, LucideAngularModule, Search } from 'lucide-angular';
import { Button } from '../../../../shared/components/reusables/button/button';
import { Activity } from '../../models/activity.interface';

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

}