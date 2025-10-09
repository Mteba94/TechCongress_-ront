import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';
import { endpoint } from '../../../shared/utils/endpoints.util';
import { environment as env } from '../../../../environments/environment.development';
import { SelectResponse } from '../../login-registration/models/select-response.interface';

@Injectable({
  providedIn: 'root'
})
export class Categoria {
  private readonly httpClient = inject(HttpClient);


  getAllCategoria(): Observable<BaseApiResponse<SelectResponse[]>> {
      const requestUrl = `${env.api}${endpoint.LIST_CATEGORIA}`;
  
      return this.httpClient
        .get<BaseApiResponse<SelectResponse[]>>(requestUrl)
        .pipe(
          map((resp) => {
            return resp
          })
        )
    }
}
