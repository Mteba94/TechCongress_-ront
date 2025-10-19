import { Component, input, signal, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, BarChart3, Clock, PieChart, BarChart, LineChart, TrendingUp, TrendingDown, LucideIconData } from 'lucide-angular';
import { Chart, ChartConfiguration, ChartData, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

interface ChartTab {
  id: string;
  label: string;
  icon: LucideIconData;
}

interface ChartDataDisplay {
  attendanceByActivity: any; // Placeholder for chart.js data structure
  attendanceTrend: any; // Placeholder for chart.js data structure
  demographicsData: any; // Add demographics data
}

@Component({
  selector: 'app-attendance-charts',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    
  ],
  templateUrl: './attendance-charts.html',
  styleUrl: './attendance-charts.css'
})
export class AttendanceCharts implements OnChanges, AfterViewInit {
  @ViewChild('activityChartCanvas') activityChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('hourlyChartCanvas') hourlyChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('demographicsChartCanvas') demographicsChartCanvas!: ElementRef<HTMLCanvasElement>;

  chartsData = input<ChartDataDisplay | null>(null);

  activeChart = signal('activity');

  chartTabs: ChartTab[] = [
    { id: 'activity', label: 'Por Actividad', icon: BarChart3 },
    { id: 'hourly', label: 'Por Hora', icon: Clock },
    { id: 'demographics', label: 'Demografía', icon: PieChart }
  ];

  readonly icons = {
    BarChart3: BarChart3,
    Clock: Clock,
    PieChart: PieChart,
    TrendingUp: TrendingUp,
    TrendingDown: TrendingDown
  };

  // Chart.js instances
  private activityChart: Chart | undefined;
  private hourlyChart: Chart | undefined;
  private demographicsChart: Chart | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartsData'] && this.chartsData()) {
      setTimeout(() => this.renderCharts(), 0);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.renderCharts(), 0);
  }

  setActiveChart(chartId: string): void {
    this.activeChart.set(chartId);
    // Re-render charts when tab changes to ensure visibility
    setTimeout(() => this.renderCharts(), 0);
  }

  private renderCharts(): void {
    const data = this.chartsData();
    if (!data) return;

    // Activity Chart (Bar Chart)
    if (this.activityChartCanvas && this.activeChart() === 'activity') {
      if (this.activityChart) this.activityChart.destroy();
      const activityChartData: ChartData = {
        labels: data.attendanceByActivity?.map((item: any) => item.name),
        datasets: [
          {
            data: data.attendanceByActivity?.map((item: any) => item.attendance),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      };
      this.activityChart = new Chart(this.activityChartCanvas.nativeElement, {
        type: 'bar',
        data: activityChartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    // Hourly Chart (Line Chart)
    if (this.hourlyChartCanvas && this.activeChart() === 'hourly') {
      if (this.hourlyChart) this.hourlyChart.destroy();
      const hourlyChartData: ChartData = {
        labels: data.attendanceTrend?.map((item: any) => item.hour),
        datasets: [
          {
            data: data.attendanceTrend?.map((item: any) => item.participants),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
            tension: 0.1
          }
        ]
      };
      this.hourlyChart = new Chart(this.hourlyChartCanvas.nativeElement, {
        type: 'line',
        data: hourlyChartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    // Demographics Chart (Pie Chart)
    if (this.demographicsChartCanvas && this.activeChart() === 'demographics') {
      if (this.demographicsChart) this.demographicsChart.destroy();
      const demographicsChartData: ChartData = {
        labels: data.demographicsData?.map((item: any) => item.name),
        datasets: [
          {
            data: data.demographicsData?.map((item: any) => item.value),
            backgroundColor: [
              '#1E3A8A', // Dark Blue
              '#0F766E', // Teal
              '#059669', // Green
              '#D97706', // Orange
              '#DC2626'  // Red
            ],
            hoverOffset: 4
          }
        ]
      };
      this.demographicsChart = new Chart(this.demographicsChartCanvas.nativeElement, {
        type: 'pie',
        data: demographicsChartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } }
        }
      });
    }
  }
}
