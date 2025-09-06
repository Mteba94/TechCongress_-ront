import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Award, Calendar, CheckCircle, LucideAngularModule, TrendingUp } from 'lucide-angular';

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
export class QuickStats {
  public stats = {
    enrolledActivities: 0,
    completedActivities: 0,
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

  ngOnInit(): void {
    // Mock data - in real app this would come from API
    const mockStats = {
      enrolledActivities: 8,
      completedActivities: 5,
      earnedCertificates: 3,
      attendanceRate: 87
    };
    this.stats = mockStats;

    this.statItems = [
      {
        label: 'Actividades Inscritas',
        value: this.stats.enrolledActivities,
        icon: this.icons.calendar,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      {
        label: 'Completadas',
        value: this.stats.completedActivities,
        icon: this.icons.checkCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      },
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
