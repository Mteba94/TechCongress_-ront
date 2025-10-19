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
import { MaterialActividad } from './material-actividad';
import { UpdateActividadCommand } from '../models/actividad.commands';

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
  private readonly materialActividad = inject(MaterialActividad)


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
        objetivoActividad: this.objetivoActividad.getAllObjetivoActividad(),
        materialActividad: this.materialActividad.getAllMaterialActividad()
      }) 
        .pipe(
          map(({ 
            actividades, 
            categorias, 
            ponentes, 
            actividadPonentes,
            nivelActividad,
            objetivoActividad,
            materialActividad
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

            const materialesActividad = new Map<number, string[]>();
            materialActividad.data.forEach(material => {
              if (!materialesActividad.has(material.actividadId)) {
                materialesActividad.set(material.actividadId, []);
              }
              materialesActividad.get(material.actividadId)!.push(material.materialDesc);
            });


            const mappedData = actividades.data.map(actividad => 
              mapActividadResponseToActivity(
                actividad,
                tipoCategoria,
                ponenteMap,
                actividadPonenteMap,
                nivelesActividad,
                objetivosActividad,
                materialesActividad
              )
            );
            console.log(actividades)
            return { ...actividades, data: mappedData };
          })
        )
  }

  getById(actividadId: number): Observable<BaseApiResponse<Activity>>{
    const requestUrl = `${env.api}${endpoint.ACTIVIDAD_BY_ID}${actividadId}`;

    return forkJoin({
      actividad: this.httpClient.get<BaseApiResponse<ActividadResponse>>(requestUrl),
      categorias: this.categoriaActividad.getAllCategoria(),
      ponentes: this.ponenteService.getAllPonente(),
      actividadPonentes: this.actividadPonenteService.getAllActividadPonente(),
      nivelActividad: this.nivelActividad.getAllNivelActividad(),
      objetivoActividad: this.objetivoActividad.getAllObjetivoActividad(),
      materialActividad: this.materialActividad.getAllMaterialActividad()
    })
      .pipe(
        map(({ 
          actividad, 
          categorias, 
          ponentes, 
          actividadPonentes,
          nivelActividad,
          objetivoActividad,
          materialActividad
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

          const materialesActividad = new Map<number, string[]>();
          materialActividad.data.forEach(material => {
            if (!materialesActividad.has(material.actividadId)) {
              materialesActividad.set(material.actividadId, []);
            }
            materialesActividad.get(material.actividadId)!.push(material.materialDesc);
          });

          const mappedData = mapActividadResponseToActivity(
            actividad.data,
            tipoCategoria,
            ponenteMap,
            actividadPonenteMap,
            nivelesActividad,
            objetivosActividad,
            materialesActividad
          );
          return { ...actividad, data: mappedData };
        })
      )
  }

  createActividad(activityData: any): Observable<any> {
    const formData = new FormData();

    formData.append('CongresoId', activityData.congresoId);
    formData.append('Titulo', activityData.titulo);
    formData.append('Descripcion', activityData.descripcion);
    formData.append('DescripcionTotal', activityData.descripcionTotal);
    formData.append('TipoActividadId', activityData.tipoActividadId);
    formData.append('Fecha', activityData.fecha);
    formData.append('HoraInicio', activityData.horaInicio);
    formData.append('HoraFin', activityData.horaFin);
    formData.append('CuposTotal', activityData.cuposTotal);
    formData.append('permitirInscripcion', activityData.permitirInscripcion);

    let ubicacion = '';
    if (activityData.locationType === 'virtual') {
      ubicacion = activityData.platform;
    } else if (activityData.locationType === 'presential') {
      ubicacion = activityData.room;
    }
    formData.append('Ubicacion', ubicacion);

    formData.append('Requisitos', activityData.requisitos);
    formData.append('NivelDificultadId', activityData.nivelDificultadId);

    if (activityData.imagen) {
      formData.append('Imagen', activityData.imagen, activityData.imagen.name);
    }

    if (activityData.ponenteId) {
      const actividadPonente = { PonenteId: parseInt(activityData.ponenteId, 10) };
      formData.append('ActividadPonente', JSON.stringify(actividadPonente));
    }

    if (activityData.objetivosActividad && activityData.objetivosActividad.length > 0 && activityData.objetivosActividad[0].trim() !== '') {
      const objetivos = activityData.objetivosActividad.map((obj: string) => ({ ObjetoDesc: obj.trim() }));
      formData.append('ObjetivosActividad', JSON.stringify(objetivos));
    }
    
    if (activityData.materialesActividad && activityData.materialesActividad.length > 0 && activityData.materialesActividad[0].trim() !== '') {
      const materiales = activityData.materialesActividad.map((mat: string) => ({ MaterialDesc: mat.trim() }));
      formData.append('MaterialesActividad', JSON.stringify(materiales));
    }
    
    const requestUrl = `${env.api}${endpoint.CREATE_ACTIVIDAD}`;
    return this.httpClient.post(requestUrl, formData);
  }

  updateActividad(request: UpdateActividadCommand): Observable<BaseApiResponse<boolean>>{
    const requestUrl = `${env.api}${endpoint.UPDATE_ACTIVIDAD}`;

    return this.httpClient.put<BaseApiResponse<boolean>>(requestUrl, request).pipe(
      map((response: BaseApiResponse<boolean>) => {
        return response;
      })
    )
  }

  deleteActividad(id: number): Observable<BaseApiResponse<boolean>>{
    const requestUrl = `${env.api}${endpoint.DELETE_ACTIVIDAD}/${id}`;

    return this.httpClient.delete<BaseApiResponse<boolean>>(requestUrl).pipe(
      map((response: BaseApiResponse<boolean>) => {
        return response;
      })
    )
  }

  changeStatusActividad(actividadId: number, newEstadoActividad: string): Observable<BaseApiResponse<boolean>>{
    const requestUrl = `${env.api}${endpoint.CHANGE_STATUS_ACTIVIDAD}`;
    const body = { actividadId, newEstadoActividad };
    return this.httpClient.put<BaseApiResponse<boolean>>(requestUrl, body).pipe(
      map((response: BaseApiResponse<boolean>) => {
        return response;
      })
    )
  }
}