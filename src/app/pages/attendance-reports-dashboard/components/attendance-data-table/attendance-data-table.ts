import { Component, input, output, signal, computed, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Search, Award, Mail, User, ArrowUpDown, ArrowUp, ArrowDown, Eye, Download, MoreHorizontal, ChevronLeft, ChevronRight, LucideIconData } from 'lucide-angular';
import { InputComponent } from '../../../../shared/components/reusables/input/input';
import { Button } from '../../../../shared/components/reusables/button/button';
import { AttendanceDetailDisplay } from '../../models/attendance-detail-display.interface';

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}


@Component({
  selector: 'app-attendance-data-table',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    InputComponent,
    Button
  ],
  templateUrl: './attendance-data-table.html',
  styleUrl: './attendance-data-table.css'
})
export class AttendanceDataTable implements OnChanges {
  details = input<AttendanceDetailDisplay[]>([]);
  onBulkAction = output<{ action: string, selectedIds: string[] }>();

  selectedRows = signal<string[]>([]);
  sortConfig = signal<SortConfig>({ key: 'checkInTime', direction: 'desc' });
  currentPage = signal(1);
  searchTerm = signal('');
  itemsPerPage = 10;

  public Math = Math;
  public Date = Date;

  readonly icons = {
    Search: Search,
    Award: Award,
    Mail: Mail,
    User: User,
    ArrowUpDown: ArrowUpDown,
    ArrowUp: ArrowUp,
    ArrowDown: ArrowDown,
    Eye: Eye,
    Download: Download,
    MoreHorizontal: MoreHorizontal,
    ChevronLeft: ChevronLeft,
    ChevronRight: ChevronRight
  };

  ngOnChanges(changes: SimpleChanges): void {

      console.log('--- Datos de Asistencia Recibidos en Tabla (ngOnChanges) ---');
      console.log('Detalles recibidos:', changes);
      console.log('Cantidad de registros:', changes['details'])
    if (changes['details']) {
      this.selectedRows.set([]);
      this.currentPage.set(1);
    }
  }

  filteredData = computed(() => {
    const data = this.details();
    const term = this.searchTerm().toLowerCase();
    if (!data || data.length === 0) {
      return []; 
    }

    return data.filter(item =>
    {
      if (!item) {
            return false; // Ignora los elementos nulos o indefinidos en el array
        }
      return (item.participant ?? '').toLowerCase().includes(term) ||
               (item.activity ?? '').toLowerCase().includes(term) ||
               (item.institution ?? '').toLowerCase().includes(term);
    }
    );
  });

  handleInputChange(controlName: string, value: any): void {
    // this.form.get(controlName)?.setValue(value);
    // this.form.updateValueAndValidity();
  }

  sortedData = computed(() => {
    const data = [...this.filteredData()];
    const config = this.sortConfig();

    if (config.key) {
      data.sort((a: any, b: any) => {
        const aValue = a[config.key];
        const bValue = b[config.key];

        if (aValue < bValue) return config.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return config.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  });

  totalPages = computed(() => Math.ceil(this.sortedData().length / this.itemsPerPage));
  startIndex = computed(() => (this.currentPage() - 1) * this.itemsPerPage);
  paginatedData = computed(() => {
    const start = this.startIndex();
    const end = start + this.itemsPerPage;
    return this.sortedData().slice(start, end);
  });

  handleSort(key: string): void {
    const currentConfig = this.sortConfig();
    let direction: 'asc' | 'desc' = 'asc';

    if (currentConfig.key === key && currentConfig.direction === 'asc') {
      direction = 'desc';
    }
    this.sortConfig.set({ key, direction });
  }

  handleSelectAll(checked: boolean): void {
    if (checked) {
      this.selectedRows.set(this.paginatedData().map(item => item.id));
    } else {
      this.selectedRows.set([]);
    }
  }

  handleSelectRow(id: string, checked: boolean): void {
    if (checked) {
      this.selectedRows.update(prev => [...prev, id]);
    } else {
      this.selectedRows.update(prev => prev.filter(rowId => rowId !== id));
    }
  }

  isSelected(id: string): boolean {
    return this.selectedRows().includes(id);
  }

  getStatusBadgeClasses(status: string): string {
    switch (status.toLowerCase()) {
      case 'presente':
        return 'bg-success/10 text-success';
      case 'ausente':
        return 'bg-error/10 text-error';
      case 'parcial':
        return 'bg-warning/10 text-warning';
      case 'completado':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getStudentTypeBadgeClasses(type: string): string {
    switch (type.toLowerCase()) {
      case 'externo':
        return 'bg-secondary/10 text-secondary';
      case 'universitario':
        return 'bg-accent/10 text-accent';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getSortIcon(key: string): LucideIconData {
    const config = this.sortConfig();
    if (config.key !== key) {
      return ArrowUpDown;
    }
    return config.direction === 'asc' ? ArrowUp : ArrowDown;
  }

  setCurrentPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  get paginationPages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    for (let i = 0; i < this.Math.min(5, total); i++) {
      const pageNumber = current <= 3 ? i + 1 : current - 2 + i;
      if (pageNumber <= total) {
        pages.push(pageNumber);
      }
    }
    return pages;
  }

  formatDate(date: Date): string {
    if (!date) return '';
    return date.toLocaleDateString('es-ES');
  }

  formatTime(date: Date): string {
    if (!date) return '';
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
}
