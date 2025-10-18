import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { InscripcionRequest } from '../models/inscripcion-req.interface';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';
import { map, Observable } from 'rxjs';
import { endpoint } from '../../../shared/utils/endpoints.util';
import { environment as env } from '../../../../environments/environment.development';
import { InscripcionResponse } from '../models/inscripcion-resp.interface';

@Injectable({
  providedIn: 'root'
})
export class InscripcionService {
  private readonly httpClient = inject(HttpClient);

  ByUser(userId: number): Observable<BaseApiResponse<InscripcionResponse[]>>{
    const requestUrl = `${env.api}${endpoint.BY_USER_ID}${userId}`;

    return this.httpClient.get<BaseApiResponse<InscripcionResponse[]>>(requestUrl).pipe(
      map((response: BaseApiResponse<InscripcionResponse[]>) => {
        return response;
      })
    )
  }

  PostCreate(request: InscripcionRequest): Observable<BaseApiResponse<boolean>> {
    const requestUrl = `${env.api}${endpoint.CREATE_INSCRIPCION}`;

    return this.httpClient.post<BaseApiResponse<boolean>>(requestUrl, request).pipe(
      map((response: BaseApiResponse<boolean>) => {
        return response;
      })
    )
  }
}
