import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';
import { endpoint } from '../../../shared/utils/endpoints.util';
import { ObjetivoActividadResponse } from '../models/objetivo.interface';
import { environment as env } from '../../../../environments/environment.development';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ObjetivoActividad {
  private readonly httpClient = inject(HttpClient);

  getAllObjetivoActividad(): Observable<BaseApiResponse<ObjetivoActividadResponse[]>> {
    const requestUrl = `${env.api}${endpoint.LIST_OBJETIVO_ACTIVIDAD}?download=true`;
      
    return this.httpClient
      .get<BaseApiResponse<ObjetivoActividadResponse[]>>(requestUrl)
      .pipe(
        map((resp) => {
          return resp
        })
      )
  }
}
