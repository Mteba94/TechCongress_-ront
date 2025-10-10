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
export class UserRole {
  private readonly httpClient = inject(HttpClient);

  getUserRole(userId: number):Observable<BaseApiResponse<SelectResponse>> {
      const requestUrl = `${env.api}${endpoint.ROLE_BY_USER}${userId}`;
  
      return this.httpClient
        .get<BaseApiResponse<SelectResponse>>(requestUrl)
        .pipe(
          map((resp) => {
            return resp;
          })
        )
    }
}
