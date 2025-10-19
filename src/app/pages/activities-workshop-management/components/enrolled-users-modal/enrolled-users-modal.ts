import { Component, input, output, signal, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Users, X, Award, Shield } from 'lucide-angular';
import { ActividadParticipanteService, ActivityParticipant } from '../../services/actividad-participante.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-enrolled-users-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './enrolled-users-modal.html',
  styleUrls: ['./enrolled-users-modal.css']
})
export class EnrolledUsersModal implements OnChanges {
  // Inputs & Outputs
  activityId = input<number | null>(null);
  activityTitle = input<string>('');
  isOpen = input<boolean>(false);
  close = output<void>();

  // Services
  private readonly participanteService = inject(ActividadParticipanteService);

  // State Signals
  participants = signal<ActivityParticipant[]>([]);
  loading = signal(true);

  // Icons
  readonly icons = {
    users: Users,
    x: X,
    award: Award,
    shield: Shield
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      this.fetchParticipants();
    }
  }

  fetchParticipants(): void {
    const id = this.activityId();
    if (!id) return;

    this.loading.set(true);
    this.participanteService.getParticipantsByActivityId(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.participants.set(response.data || []); // Ensure it's always an array
          }
        },
        error: (err) => {
          console.error('Error fetching participants:', err);
          this.participants.set([]);
        }
      });
  }

  onClose(): void {
    this.close.emit();
  }
}
