import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';
import { SelectResponse } from '../../login-registration/models/select-response.interface';
import { endpoint } from '../../../shared/utils/endpoints.util';
import { environment as env } from '../../../../environments/environment.development';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private readonly httpClient = inject(HttpClient);

  getAllTags(): Observable<BaseApiResponse<SelectResponse[]>> {
    const requestUrl = `${env.api}${endpoint.LIST_TAG}`;

    return this.httpClient
      .get<BaseApiResponse<SelectResponse[]>>(requestUrl)
      .pipe(
        map((resp) => {
          return resp
        })
      )
  }
}
