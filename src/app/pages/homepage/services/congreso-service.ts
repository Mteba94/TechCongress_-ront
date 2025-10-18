import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { SelectResponse } from '../../login-registration/models/select-response.interface';
import { environment as env } from '../../../../environments/environment.development';
import { endpoint } from '../../../shared/utils/endpoints.util';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';
import { CongresoResponse } from '../models/congreso-resp.interface';

@Injectable({
  providedIn: 'root'
})
export class CongresoService {
  private readonly httpClient = inject(HttpClient);

  getAllCongreso(): Observable<BaseApiResponse<CongresoResponse[]>> {
    const requestUrl = `${env.api}${endpoint.LIST_TAG}`;

    return this.httpClient
      .get<BaseApiResponse<CongresoResponse[]>>(requestUrl)
      .pipe(
        map((resp) => {
          return resp
        })
      )
  }
  
  congresoSelect(): Observable<SelectResponse[]> {
  const requestUrl = `${env.api}${endpoint.CONGRESO_SELECT}`;
  return this.httpClient
    .get<BaseApiResponse<SelectResponse[]>>(requestUrl)
    .pipe(
      map((resp) => resp.data ?? [])
    );
}
}
