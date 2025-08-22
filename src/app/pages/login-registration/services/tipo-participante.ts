import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment as env } from '../../../../environments/environment.development';
import { endpoint } from '../../../shared/utils/endpoints.util';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';
import { map, Observable } from 'rxjs';
import { SelectResponse } from '../models/select-response.interface';


@Injectable({
  providedIn: 'root'
})
export class TipoParticipante {
  private readonly httpClient = inject(HttpClient);


  getSelectTipoParticipante():Observable<BaseApiResponse<SelectResponse[]>> {
    const requestUrl = `${env.api}${endpoint.SELECT_TIPO_PARTICIPANTE}`;

    return this.httpClient
      .get<BaseApiResponse<SelectResponse[]>>(requestUrl)
      .pipe(
        map((resp) => {
          return resp;
        })
      )
  }
}
