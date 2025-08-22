import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CodigoRequest, ValidateCodigo } from '../models/codigo-req.interface';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';
import { map, Observable } from 'rxjs';
import { environment as env } from '../../../../environments/environment.development';
import { endpoint } from '../../../shared/utils/endpoints.util';

@Injectable({
  providedIn: 'root'
})
export class Codigo {
  private readonly httpClient = inject(HttpClient)

  CreateCode(request: CodigoRequest): Observable<BaseApiResponse<string>> {
    const requestUrl = `${env.api}${endpoint.CREATE_CODIGO}`

    return this.httpClient.post<BaseApiResponse<string>>(requestUrl, request).pipe(
          map((response: BaseApiResponse<string>) => {
            return response;
          })
        )
  }

  Validate(request: ValidateCodigo): Observable<BaseApiResponse<boolean>>{
    const requestUrl = `${env.api}${endpoint.VALIDATE_CODIGO}`

    return this.httpClient.post<BaseApiResponse<boolean>>(requestUrl, request).pipe(
          map((response: BaseApiResponse<boolean>) => {
            return response;
          })
        )
  }
}
