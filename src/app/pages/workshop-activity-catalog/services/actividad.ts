import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';
import { endpoint } from '../../../shared/utils/endpoints.util';
import { environment as env } from '../../../../environments/environment.development';
import { ActividadResponse } from '../models/actividad-req.interface';
import { Activity } from '../models/activity.interface';
import { mapActividadResponseToActivity } from '../mappers/activity.mapper';
import { Categoria } from './categoria';
import { Ponente } from './ponente';
import { ActividadPonente } from './actividad-ponente';
import { PonenteResponse } from '../../homepage/models/ponente-response.interface';
import { NivelActividad } from './nivel-actividad';
import { ObjetivoActividad } from './objetivo-actividad';

@Injectable({
  providedIn: 'root'
})
export class Actividad {
  private readonly httpClient = inject(HttpClient);
  private readonly categoriaActividad = inject(Categoria);
  private readonly ponenteService = inject(Ponente);
  private readonly actividadPonenteService = inject(ActividadPonente);
  private readonly nivelActividad = inject(NivelActividad);
  private readonly objetivoActividad = inject(ObjetivoActividad)

  getAll(
    size: number,
    sort: string,
    order: string,
    numPage: number,
    getInputs: string
  ): Observable<BaseApiResponse<Activity[]>>{
    const requestUrl = `${env.api}${endpoint.LIST_ACTIVIDAD
      }?records=${size}&sort=${sort}&order=${order}&numPage=${numPage + 1
      }${getInputs}`;

      return forkJoin({
        actividades: this.httpClient.get<BaseApiResponse<ActividadResponse[]>>(requestUrl),
        categorias: this.categoriaActividad.getAllCategoria(),
        ponentes: this.ponenteService.getAllPonente(),
        actividadPonentes: this.actividadPonenteService.getAllActividadPonente(),
        nivelActividad: this.nivelActividad.getAllNivelActividad(),
        objetivoActividad: this.objetivoActividad.getAllObjetivoActividad()
      }) 
        .pipe(
          map(({ 
            actividades, 
            categorias, 
            ponentes, 
            actividadPonentes,
            nivelActividad,
            objetivoActividad
          }) => {
            const tipoCategoria = new Map<number, string>();
            categorias.data.forEach((tipo: any) => {
                tipoCategoria.set(tipo.tipoActividadId, tipo.nombre);
            });

            const ponenteMap = new Map<number, PonenteResponse>();
            ponentes.data.forEach(ponente => {
              ponenteMap.set(ponente.ponenteId, ponente);
            });

            const actividadPonenteMap = new Map<number, number>();
            actividadPonentes.data.forEach(ap => {
              actividadPonenteMap.set(ap.actividadId, ap.ponenteId);
            });

            const nivelesActividad = new Map<number, string>();
            nivelActividad.data.forEach(nivel => {
              nivelesActividad.set(nivel.nivelId, nivel.nombre);
            });

            const objetivosActividad = new Map<number, string[]>();
            objetivoActividad.data.forEach(objetivo => {
              if (!objetivosActividad.has(objetivo.actividadId)) {
                objetivosActividad.set(objetivo.actividadId, []);
              }
              objetivosActividad.get(objetivo.actividadId)!.push(objetivo.objetivoDescripcion);
            });

            const mappedData = actividades.data.map(actividad => 
              mapActividadResponseToActivity(
                actividad,
                tipoCategoria,
                ponenteMap,
                actividadPonenteMap,
                nivelesActividad,
                objetivosActividad
              )
            );
            return { ...actividades, data: mappedData };
          })
        )
  }
}
