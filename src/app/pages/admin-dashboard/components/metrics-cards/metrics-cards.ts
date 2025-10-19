import { Component, input, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, TrendingUp, TrendingDown, Users, Calendar, Award, LucideIconData, BarChart3 } from 'lucide-angular';

interface MetricCardDisplay {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: LucideIconData;
  iconColor: string;
  bgColor: string;
  description: string;
}

@Component({
  selector: 'app-metrics-cards',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './metrics-cards.html',
  styleUrl: './metrics-cards.css'
})
export class MetricsCards implements OnChanges {
  metricsData = input<MetricCardDisplay[]>([]);

  metrics = signal<MetricCardDisplay[]>([]);

  readonly icons = {
    TrendingUp: TrendingUp,
    TrendingDown: TrendingDown,
    Users: Users,
    Calendar: Calendar,
    Award: Award,
    BarChart3: BarChart3,
  };

  ngOnChanges(changes: SimpleChanges): void {
    console.log('dddd')
    if (changes['metricsData'] && this.metricsData()) {
      this.metrics.set(this.metricsData());
    }
  }
}
