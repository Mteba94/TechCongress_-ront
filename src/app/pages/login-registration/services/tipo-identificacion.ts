import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';
import { SelectResponse } from '../models/select-response.interface';
import { environment as env } from '../../../../environments/environment.development';
import { endpoint } from '../../../shared/utils/endpoints.util';

@Injectable({
  providedIn: 'root'
})
export class TipoIdentificacion {
  private readonly httpClient = inject(HttpClient);

  getSelectTipoIdentificacion(): Observable<BaseApiResponse<SelectResponse[]>> {
      const requestUrl = `${env.api}${endpoint.SELECT_TIPO_IDENTIFICACION}`;
  
      return this.httpClient
        .get<BaseApiResponse<SelectResponse[]>>(requestUrl)
        .pipe(
          map((resp) => resp)
        );
    }
}
