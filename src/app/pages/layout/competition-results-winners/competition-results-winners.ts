import { Component, OnInit, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Trophy, Brain, Globe, Smartphone, Bot, Wifi, Shield, Link, Gamepad2, Users, Search, Zap,
  LucideIconData
} from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { Header } from '../../../shared/components/layout/header/header';
import { RegistrationCallToAction } from '../../../shared/components/reusables/registration-call-to-action/registration-call-to-action';
import { Breadcrumbs } from '../../../shared/components/reusables/breadcrumbs/breadcrumbs';
import { SearchAndFilters } from '../../workshop-activity-catalog/components/search-and-filters/search-and-filters';
import { Button } from '../../../shared/components/reusables/button/button';
import { Router } from '@angular/router';
import { WinnerHeroCarousel } from '../../competition-results-winners/components/winner-hero-carousel/winner-hero-carousel';
import { Resultados } from '../../competition-results-winners/services/resultados';
import { Users as UsersService } from '../../user-management-system/services/users';
import { School } from '../../user-dashboard/services/school';
import { forkJoin, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { User } from '../../user-management-system/models/userResp.interface';
import { Participante } from '../../login-registration/services/participante';

interface Winner {
  id: string;
  name: string;
  school: string;
  category: string;
  categoryId: string;
  projectTitle: string;
  description: string;
  photo: string;
  position: number;
  technologies: string[];
  projectImages: string[];
  projectUrl: string;
  githubUrl: string;
  videoUrl: string;
  mentor: string;
  year: string;
}

interface Category {
  id: string;
  name: string;
  icon: LucideIconData;
  participantCount: number;
}

@Component({
  selector: 'app-competition-results-winners',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    Header,
    RegistrationCallToAction,
    Breadcrumbs,
    WinnerHeroCarousel
    //SearchAndFilters,
    //Button,
    // Placeholder components
    // WinnerHeroCarousel,
    // CategoryTabs,
    // WinnerPodium,
    // HistoricalArchive,
    // WinnerModal,
    // SocialShareModal
  ],
  templateUrl: './competition-results-winners.html',
  styleUrl: './competition-results-winners.css'
})
export class CompetitionResultsWinners implements OnInit {
  activeCategory = signal('all');
  selectedWinner = signal<Winner | null>(null);
  isWinnerModalOpen = signal(false);
  isShareModalOpen = signal(false);
  shareWinner = signal<Winner | null>(null);
  searchTerm = signal('');
  filters = signal<any>({});
  allWinners = signal<Winner[]>([]); // Will be fetched from API
  filteredWinners = signal<Winner[]>([]);

  private readonly router = inject(Router);
  private readonly resultadosService = inject(Resultados);
  private readonly usersService = inject(UsersService);
  private readonly schoolService = inject(School);

  readonly icons = {
    Trophy: Trophy,
    Brain: Brain,
    Globe: Globe,
    Smartphone: Smartphone,
    Bot: Bot,
    Wifi: Wifi,
    Shield: Shield,
    Link: Link,
    Gamepad2: Gamepad2,
    Users: Users,
    Search: Search,
    Zap: Zap
  };

  // Mock data for competition categories
  categories: Category[] = [
    {
      id: 'all',
      name: 'Todos los Resultados',
      icon: Trophy,
      participantCount: 156
    },
    {
      id: 'ai',
      name: 'Inteligencia Artificial',
      icon: Brain,
      participantCount: 28
    },
    {
      id: 'web',
      name: 'Desarrollo Web',
      icon: Globe,
      participantCount: 34
    },
    {
      id: 'mobile',
      name: 'Apps Móviles',
      icon: Smartphone,
      participantCount: 22
    },
    {
      id: 'robotics',
      name: 'Robótica',
      icon: Bot,
      participantCount: 18
    },
    {
      id: 'iot',
      name: 'IoT y Sensores',
      icon: Wifi,
      participantCount: 15
    },
    {
      id: 'cybersecurity',
      name: 'Ciberseguridad',
      icon: Shield,
      participantCount: 12
    },
    {
      id: 'blockchain',
      name: 'Blockchain',
      icon: Link,
      participantCount: 8
    },
    {
      id: 'gamedev',
      name: 'Desarrollo de Juegos',
      icon: Gamepad2,
      participantCount: 19
    }
  ];

  // Hero carousel winners (top 3 overall)
  heroWinners = signal<Winner[]>([]);

  constructor() {
    effect(() => {
      this.filterWinners();
    });
  }

  ngOnInit(): void {
    this.loadHeroWinners();
  }

  loadHeroWinners(): void {
    this.resultadosService.TopWinners().pipe(
      switchMap(response => {
        if (!response.data || response.data.length === 0) {
          return of([]);
        }
        const topWinners = response.data;
        return forkJoin(
          topWinners.map(winner =>
            this.usersService.getById(winner.winnerUserId).pipe(
              map(userResponse => ({ ...winner, user: userResponse.data }))
            )
          )
        );
      }),
      switchMap(winnersWithUsers => {
        if (!winnersWithUsers || winnersWithUsers.length === 0) {
          return of([]);
        }
        return forkJoin(
          winnersWithUsers.map(data => {
            if (data.user && data.user.school) {
              return this.schoolService.getSelectSchool(Number(data.user.school)).pipe(
                map(schoolResponse => ({ ...data, schoolName: schoolResponse.data ? schoolResponse.data.schoolName : '' }))
              );
            } else {
              return of({ ...data, schoolName: 'Institución no especificada' });
            }
          })
        );
      }),
      map(finalData => {
        console.log(finalData)
        return finalData.map((data, index) => ({
          id: data.winnerUserId.toString(),
          name: data.winnerUserName,
          school: data.schoolName,
          category: data.actividadTitulo,
          categoryId: data.actividadId.toString(),
          projectTitle: data.actividadTitulo,
          description: `Ganador de la actividad "${data.actividadTitulo}".`,
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', // Placeholder photo
          position: index + 1,
          technologies: [],
          projectImages: [],
          projectUrl: '',
          githubUrl: '',
          videoUrl: '',
          mentor: '',
          year: new Date().getFullYear().toString()
        }));
      })
    ).subscribe(winners => {
      this.heroWinners.set(winners);
      this.allWinners.set(winners);
    });
  }

  

  filterWinners(): void {
    let filtered = [...this.allWinners()];

    // Filter by category
    if (this.activeCategory() !== 'all') {
      filtered = filtered.filter(winner => winner.categoryId === this.activeCategory());
    }

    // Filter by search term
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(winner =>
        winner.name.toLowerCase().includes(term) ||
        winner.projectTitle.toLowerCase().includes(term) ||
        winner.school.toLowerCase().includes(term) ||
        winner.category.toLowerCase().includes(term)
      );
    }

    // Apply additional filters
    const currentFilters = this.filters();
    if (currentFilters.year) {
      filtered = filtered.filter(winner => winner.year === currentFilters.year);
    }

    if (currentFilters.school) {
      filtered = filtered.filter(winner => winner.school === currentFilters.school);
    }

    if (currentFilters.position) {
      if (currentFilters.position === 'top10') {
        filtered = filtered.filter(winner => winner.position <= 10);
      } else {
        filtered = filtered.filter(winner => winner.position.toString() === currentFilters.position);
      }
    }

    this.filteredWinners.set(filtered);
  }

  handleWinnerClick(winner: Winner): void {
    this.selectedWinner.set(winner);
    this.isWinnerModalOpen.set(true);
  }

  handleShare(winner: Winner): void {
    this.shareWinner.set(winner);
    this.isShareModalOpen.set(true);
  }

  handleSearch(term: string): void {
    this.searchTerm.set(term);
  }

  handleFilter(newFilters: any): void {
    this.filters.set(newFilters);
  }

  handleClearFilters(): void {
    this.searchTerm.set('');
    this.filters.set({});
  }

  getCurrentCategoryWinners(): Winner[] {
    return this.filteredWinners().sort((a, b) => a.position - b.position);
  }

  getActiveCategoryName(): string {
    const activeCategory = this.activeCategory();
    const category = this.categories.find(c => c.id === activeCategory);
    return category ? category.name : 'Todos los Ganadores';
  }

  hasActiveFilters(): boolean {
    return this.filters() && Object.keys(this.filters()).length > 0;
  }



  navigateTo(url: string) {
    this.router.navigate([url]);
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}