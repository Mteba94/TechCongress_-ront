import { Component, computed, signal, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { NgOptimizedImage, CommonModule } from '@angular/common';
import { Calendar, Check, Clock, Code, LucideAngularModule, LucideIconData, Timer, Trophy, User, Users } from 'lucide-angular';
import { Button } from '../../../../shared/components/reusables/button/button';
import { Activity } from '../../models/activity.interface';

interface AvailabilityStatus {
  status: 'full' | 'waitlist' | 'available';
  text: string;
  color: string;
}

@Component({
  selector: 'app-activity-card',
  imports: [
    NgOptimizedImage,
    CommonModule,
    LucideAngularModule,
    Button
  ],
  templateUrl: './activity-card.html',
  styleUrl: './activity-card.css'
})
export class ActivityCard implements OnChanges {
  readonly icons = {
    check: Check,
    user: User,
    clock: Clock,
    timer: Timer,
    users: Users
  }
  @Input() activityInput!: Activity;
  @Input() userEnrollmentsInput!: number[];

  @Output() onEnroll = new EventEmitter<Activity>();
  @Output() onViewDetails = new EventEmitter<Activity>();

  _activity = signal<Activity>({
    id: 0,
    title: '',
    description: '',
    fullDescription: '',
    image: '',
    category: '',
    difficulty: 'beginner',
    prerequisites: '',
    instructor: '',
    instructorBio: '',
    date: '',
    startTime: '',
    endTime: '',
    duration: '',
    location: '',
    capacity: 0,
    enrolled: 0,
    code: '',
    learningObjectives: [],
    materials: [],
    conflictingActivities: []
  });
  _userEnrollments = signal<number[]>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activityInput']) {
      this._activity.set(this.activityInput);
    }
    if (changes['userEnrollmentsInput']) {
      this._userEnrollments.set(this.userEnrollmentsInput);
    }
  }

  isEnrolled = computed(() => this._userEnrollments().includes(this._activity().id));
  
  availability = computed<AvailabilityStatus>(() => {
    const spotsLeft = this._activity().capacity - this._activity().enrolled;
    if (spotsLeft <= 0) return { status: 'full', text: 'Completo', color: 'text-red-600 bg-red-50' };
    if (spotsLeft <= 5) return { status: 'waitlist', text: 'Últimos cupos', color: 'text-orange-600 bg-orange-50' };
    return { status: 'available', text: 'Disponible', color: 'text-green-600 bg-green-50' };
  });

  spotsLeft = computed(() => this._activity().capacity - this._activity().enrolled);

  handleEnrollClick(event: MouseEvent) {
    event.stopPropagation();

    if (!this.isEnrolled() && this.availability().status !== 'full') {
      this.onEnroll.emit(this._activity());
      //console.log(this.activityInput)
    }
  }

  handleViewDetails() {
    this.onViewDetails.emit(this._activity());
  }

  getCategoryIcon(category: string): LucideIconData {
    switch (category) {
      case 'Taller': return Code;
      case 'competition': return Trophy;
      case 'Social': return Users;
      default: return Calendar;
    }
  }

  getCategoryColor(category: string): string {
    switch (category) {
      case 'Taller': return 'text-blue-600 bg-blue-50';
      case 'competition': return 'text-amber-600 bg-amber-50';
      case 'Social': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'advanced': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  getProgressBarColor(status: string): string {
    switch (status) {
      case 'full': return 'bg-red-500';
      case 'waitlist': return 'bg-orange-500';
      default: return 'bg-green-500';
    }
  }

  formatTime(time: string): string {
    const [hour, minute] = time.split(':');
    return `${hour}:${minute}`;
  }
}