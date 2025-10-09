import { Component, computed, input, signal, Output, EventEmitter } from '@angular/core';
import { Button } from '../../../../shared/components/reusables/button/button';
import { AlertTriangle, Calendar, Check, CheckCircle, Clock, Code, LucideAngularModule, LucideIconData, MapPin, Package, Timer, Trophy, User, UserPlus, Users } from 'lucide-angular';
import { Activity } from '../../models/activity.interface';

@Component({
  selector: 'app-activity-detail-modal',
  imports: [
    Button,
    LucideAngularModule
  ],
  templateUrl: './activity-detail-modal.html',
  styleUrl: './activity-detail-modal.css'
})
export class ActivityDetailModal {
  readonly icons = {
    check: Check,
    user: User,
    calendar: Calendar,
    clock: Clock,
    timer: Timer,
    mapPin: MapPin,
    users: Users,
    checkCirle: CheckCircle,
    package: Package,
    alertTriangle: AlertTriangle,
    userPlus:UserPlus
  }
  // Inputs as signals for property binding
  activity = input<Activity | null>();
  isOpen = input<boolean>(false);
  @Output() onClose = new EventEmitter<void>();
  @Output() onEnroll = new EventEmitter<Activity>();
  //onEnroll = input<(activity: Activity) => void>();
  userEnrollments = input<number[]>([]);

  // State signals
  showEnrollConfirm = signal(false);

  // Computed signals for derived state
  isEnrolled = computed(() => {
    const activity = this.activity();
    if (!activity) return false;
    return this.userEnrollments().includes(activity.id);
  });
  spotsLeft = computed(() => (this.activity()?.capacity || 0) - (this.activity()?.enrolled || 0));
  isFull = computed(() => this.spotsLeft() <= 0);

  statusText = computed(() => {
    if (this.isFull()) return 'Completo';
    if (this.spotsLeft() <= 5) return 'Últimos cupos';
    return 'Disponible';
  });

  statusClasses = computed(() => {
    if (this.isFull()) return 'text-red-600 bg-red-50';
    if (this.spotsLeft() <= 5) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  });

  // Helper functions translated to class methods
  getCategoryIcon(category: string): LucideIconData {
    switch (category) {
      case 'workshop': return Code;
      case 'competition': return Trophy;
      case 'social': return Users;
      default: return Calendar;
    }
  }

  handleEnrollClick(): void {
    if (!this.isEnrolled() && !this.isFull()) {
      this.showEnrollConfirm.set(true);
    }
  }

  // confirmEnrollment(): void {
  //   if (this.activity() && this.onEnroll()) {
  //     this.onEnroll()!(this.activity()!);
  //     this.showEnrollConfirm.set(false);
  //     this.onClose.emit();
  //   }
  // }

  confirmEnrollment(): void {
    if (this.activity()) {
      this.onEnroll.emit(this.activity()!);
      this.showEnrollConfirm.set(false);
    }
  }

  handleBackdropClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;
    if (target === currentTarget) {
      this.onClose.emit();
    }
  }
}