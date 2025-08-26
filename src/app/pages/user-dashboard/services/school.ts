import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment as env } from '../../../../environments/environment.development';
import { endpoint } from '../../../shared/utils/endpoints.util';
import { map, Observable } from 'rxjs';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';
import { SchoolByIdResp } from '../models/schoolById-resp.interface';

@Injectable({
  providedIn: 'root'
})
export class School {
  private readonly httpClient = inject(HttpClient);

  getSelectSchool(schoolId: number): Observable<BaseApiResponse<SchoolByIdResp>> {
    const requestUrl = `${env.api}${endpoint.BY_ID_SCHOOL}${schoolId}`;

    return this.httpClient
      .get<BaseApiResponse<SchoolByIdResp>>(requestUrl)
      .pipe(
        map((resp) => {
          return resp;
        })
      );
  }
}
