import { Component, inject, OnInit } from '@angular/core';
import { Award, Calendar, CheckCircle, LucideAngularModule, TrendingUp } from 'lucide-angular';
import { Auth } from '../../../login-registration/services/auth';
import { firstValueFrom, forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Users } from '../../../user-management-system/services/users';

interface Stat {
  label: string;
  value: number | string;
  icon: any;
  color: string;
  bgColor: string;
}

@Component({
  selector: 'app-quick-stats',
  imports: [
    LucideAngularModule,
    CommonModule
  ],
  templateUrl: './quick-stats.html',
  styleUrl: './quick-stats.css'
})
export class QuickStats implements OnInit {
  public stats = {
    enrolledActivities: 0,
    // completedActivities: 0,
    earnedCertificates: 0,
    attendanceRate: 0
  };

  public statItems: Stat[] = [];

  // Lucide icons
  public icons = {
    calendar: Calendar,
    checkCircle: CheckCircle,
    award: Award,
    trendingUp: TrendingUp
  };

  private readonly usersService = inject(Users);
  private readonly authService = inject(Auth);

  async ngOnInit(): Promise<void> {
    const user = await firstValueFrom(this.authService.currentUser$);
    if (user) {
      try {
        const [inscriptions, certificates, attendance] = await firstValueFrom(forkJoin([
          this.usersService.InscriptionsByUser(user.id),
          this.usersService.CertificatesByUser(user.id),
          this.usersService.AttendancePercentage(user.id)
        ]));

        this.stats = {
          enrolledActivities: inscriptions.isSuccess ? inscriptions.data.inscriptionsCount : 0,
          // completedActivities: 0, // Not directly available, keep as 0 or derive if possible
          earnedCertificates: certificates.isSuccess ? certificates.data.certificateCount : 0,
          attendanceRate: attendance.isSuccess ? attendance.data.attendancePercentage : 0
        }

        //console.log('User Stats:', this.stats);

      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    }

    this.statItems = [
      {
        label: 'Actividades Inscritas',
        value: this.stats.enrolledActivities,
        icon: this.icons.calendar,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      // {
      //   label: 'Completadas',
      //   value: this.stats.completedActivities,
      //   icon: this.icons.checkCircle,
      //   color: 'text-green-600',
      //   bgColor: 'bg-green-50'
      // },
      {
        label: 'Certificados',
        value: this.stats.earnedCertificates,
        icon: this.icons.award,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50'
      },
      {
        label: 'Asistencia',
        value: `${this.stats.attendanceRate}%`,
        icon: this.icons.trendingUp,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      }
    ];
  }
}
