import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';
import { PonenteResponse } from '../../homepage/models/ponente-response.interface';
import { endpoint } from '../../../shared/utils/endpoints.util';
import { environment as env } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class Ponente {
  private readonly httpClient = inject(HttpClient);

  getAllPonente(): Observable<BaseApiResponse<PonenteResponse[]>> {
        const requestUrl = `${env.api}${endpoint.LIST_PONENTES}?StateFilter=${1}&download=true`;
    
        return this.httpClient
          .get<BaseApiResponse<PonenteResponse[]>>(requestUrl)
          .pipe(
            map((resp) => {
              return resp
            })
          )
      }
}
