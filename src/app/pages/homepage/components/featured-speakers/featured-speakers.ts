import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  Users,
  ArrowRight,
  Linkedin,
  Twitter,
  Github,
  Dribbble
} from 'lucide-angular';
import { PonenteService } from '../../services/ponente-service';
import { BaseApiResponse } from '../../../../shared/models/reusables/base-api-response.interface';
import { PonenteResponse, SpeakerInterface } from '../../models/ponente-response.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { PonenteTagService } from '../../services/ponente-tag-service';
import { forkJoin, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-featured-speakers',
  imports: [
    CommonModule,
    LucideAngularModule,
    RouterLink
  ],
  templateUrl: './featured-speakers.html',
  styleUrl: './featured-speakers.css'
})
export class FeaturedSpeakers {
  readonly icons = {
    users: Users,
    arrowRight: ArrowRight,
    linkedin: Linkedin,
    twitter: Twitter,
    github: Github,
    dribbble: Dribbble
  };

  speakers: SpeakerInterface[] = [];

  private readonly ponenteService = inject(PonenteService);
  private readonly ponenteTagService = inject(PonenteTagService);


  ngOnInit(): void {
    this.loadSpeakers();
  }

  loadSpeakers(): void {
    this.ponenteService.ponentePopular().pipe(
      // Usamos switchMap para cambiar al nuevo observable
      switchMap(resp => {
        if (!resp.isSuccess || !resp.data) {
          return of([]); // Si no hay datos, retorna un observable vacío
        }
        
        // Creamos un array de observables, uno por cada ponente
        const ponenteObservables = resp.data.map(ponente => {
          return this.ponenteTagService.GetPonenteTagsByPonenteId(ponente.ponenteId).pipe(
            // Mapeamos la respuesta de tags y la unimos con los datos del ponente
            map(tagsResp => {
              const expertise = tagsResp.isSuccess ? tagsResp.data.map(tag => tag.tagName) : [];

              return {
                id: ponente.ponenteId,
                name: `${ponente.nombrePonente} ${ponente.apellidoPonente}`.trim(),
                title: ponente.tituloPonente,
                company: ponente.empresaPonente,
                image: ponente.imagePonente, // Usa una imagen por defecto
                expertise: expertise, // 👈 Asignamos las tags aquí
                bio: ponente.bioPonente,
                social: {
                  linkedin: '',
                  twitter: '',
                  github: '',
                  dribbble: ''
                }
              } as SpeakerInterface; // Aseguramos el tipo de retorno
            })
          );
        });

        // forkJoin espera a que todos los observables se completen y luego emite un array con todos los resultados
        return forkJoin(ponenteObservables);
      })
    ).subscribe({
      next: (finalSpeakers) => {
        this.speakers = finalSpeakers; // Asignamos el array de ponentes ya completado
      },
      error: (error) => {
        console.error('Error al cargar ponentes y sus tags:', error);
      }
    });
  }
}
