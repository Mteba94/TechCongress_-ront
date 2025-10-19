import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  Trophy, Award, Share2, ExternalLink, ChevronLeft, ChevronRight, 
  LucideIconData, Loader
} from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { Button } from '../../../../shared/components/reusables/button/button';
import { Router } from '@angular/router';

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

@Component({
  selector: 'app-winner-hero-carousel',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    //Button
  ],
  templateUrl: './winner-hero-carousel.html',
  styleUrl: './winner-hero-carousel.css'
})
export class WinnerHeroCarousel implements OnInit, OnDestroy {
  @Input() winners: Winner[] = [];
  @Input() onShare: (winner: Winner) => void = () => {};

  currentSlide = signal(0);
  isAutoPlaying = signal(true);
  private intervalId: any;

  readonly icons = {
    Trophy: Trophy,
    Award: Award,
    Share2: Share2,
    ExternalLink: ExternalLink,
    ChevronLeft: ChevronLeft,
    ChevronRight: ChevronRight,
    Loader: Loader
  };

  private router = inject(Router);

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  startAutoPlay(): void {
    this.stopAutoPlay(); // Clear any existing interval
    if (this.isAutoPlaying() && this.winners.length > 1) {
      this.intervalId = setInterval(() => {
        this.currentSlide.update(prev => (prev + 1) % this.winners.length);
      }, 5000);
    }
  }

  stopAutoPlay(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  goToSlide(index: number): void {
    this.currentSlide.set(index);
    this.isAutoPlaying.set(false);
    this.stopAutoPlay();
  }

  nextSlide(): void {
    this.currentSlide.update(prev => (prev + 1) % this.winners.length);
    this.isAutoPlaying.set(false);
    this.stopAutoPlay();
  }

  prevSlide(): void {
    this.currentSlide.update(prev => (prev - 1 + this.winners.length) % this.winners.length);
    this.isAutoPlaying.set(false);
    this.stopAutoPlay();
  }

  handleToggleAutoPlay(): void {
    this.isAutoPlaying.update(prev => !prev);
    if (this.isAutoPlaying()) {
      this.startAutoPlay();
    } else {
      this.stopAutoPlay();
    }
  }

  openProjectUrl(url: string): void {
    window.open(url, '_blank');
  }
}