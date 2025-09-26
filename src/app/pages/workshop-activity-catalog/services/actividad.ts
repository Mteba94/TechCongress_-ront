import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';
import { endpoint } from '../../../shared/utils/endpoints.util';
import { environment as env } from '../../../../environments/environment.development';
import { ActividadResponse } from '../models/actividad-req.interface';

@Injectable({
  providedIn: 'root'
})
export class Actividad {
  private readonly httpClient = inject(HttpClient);

  getAll(
    size: number,
    sort: string,
    order: string,
    numPage: number,
    getInputs: string
  ): Observable<BaseApiResponse<ActividadResponse[]>>{
    const requestUrl = `${env.api}${endpoint.LIST_ACTIVIDAD
      }?records=${size}&sort=${sort}&order=${order}&numPage=${numPage + 1
      }${getInputs}`;

      return this.httpClient
        .get<BaseApiResponse<ActividadResponse[]>>(requestUrl)
        .pipe(
          map((resp) => {
            resp.data.forEach(function (actividad: any){
              actividad.cuposOcupados = actividad.cuposTotales - actividad.cuposDisponibles;
            });
            return resp;
          })
        )
  }
}