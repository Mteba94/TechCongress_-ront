import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { Header } from "../../../shared/components/layout/header/header";
import { Hero } from '../../homepage/components/hero/hero';
import { Overview } from '../../homepage/components/overview/overview';
import { FeaturedSpeakers } from "../../homepage/components/featured-speakers/featured-speakers";
import { EventAgenda } from "../../homepage/components/event-agenda/event-agenda";
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-homepage',
  imports: [
    Header,
    Hero,
    Overview,
    FeaturedSpeakers,
    EventAgenda
],
  templateUrl: './homepage.html',
  //styleUrl: './homepage.css'
})
export class Homepage {
  private imageObserver?: IntersectionObserver;

  constructor(
    private titleService: Title,
    private metaService: Meta,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Set page title and meta description
      this.titleService.setTitle('TechCongress 2025 - Innovación & Futuro Tecnológico');
      this.metaService.updateTag({
        name: 'description',
        content: 'Únete al evento tecnológico más importante del año. Talleres especializados, conferencias magistrales y networking con profesionales de la industria.'
      });

      // Set up lazy loading for images (using IntersectionObserver)
      this.setupProgressiveImageLoading();
    }
  }

  ngOnDestroy(): void {
    if (this.imageObserver) {
      this.imageObserver.disconnect();
    }
  }

  @HostListener('click', ['$event'])
  handleSmoothScroll(event: Event): void {
    if (isPlatformBrowser(this.platformId)) {
      const target = (event.target as HTMLElement).closest('a[href^="#"]');
      if (target) {
        event.preventDefault();
        const targetId = target.getAttribute('href')?.substring(1);
        if (targetId) {
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      }
    }
  }

  private setupProgressiveImageLoading(): void {
    const images = document.querySelectorAll('img[data-src]');
    if (images.length === 0) {
      return;
    }

    this.imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset['src'];
          if (src) {
            img.src = src;
            img.classList.remove('lazy');
          }
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => {
      if (this.imageObserver) {
        this.imageObserver.observe(img);
      }
    });
  }
}
