import { Component, Input, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Users, CheckCircle, Activity, TrendingUp, TrendingDown, Loader, LucideIconData } from 'lucide-angular';

interface MetricCardDisplay {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: LucideIconData;
  description: string;
}

@Component({
  selector: 'app-attendance-metrics-cards',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './attendance-metrics-cards.html',
  styleUrl: './attendance-metrics-cards.css'
})
export class AttendanceMetricsCards implements OnChanges {
  @Input() metricsData : any //etricCardDisplay[]>; // Raw data from service

  metrics = signal<MetricCardDisplay[]>([]);

  readonly icons = {
    Users: Users,
    CheckCircle: CheckCircle,
    Activity: Activity,
    TrendingUp: TrendingUp,
    TrendingDown: TrendingDown,
    Loader: Loader
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['metricsData'] && changes['metricsData'].currentValue) {
      this.metrics.set(changes['metricsData'].currentValue);
    }
  }

  private updateMetrics(rawData: any): void {
    this.metrics.set(rawData);
  }
}
