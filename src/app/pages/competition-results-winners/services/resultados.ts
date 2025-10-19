import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';
import { TopWinnersLastActivities } from '../models/resultados-resp.interface';
import { endpoint } from '../../../shared/utils/endpoints.util';
import { environment as env } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class Resultados {
  private readonly httpClient = inject(HttpClient);

  TopWinners(): Observable<BaseApiResponse<TopWinnersLastActivities[]>> {
      const requestUrl = `${env.api}${endpoint.TOP_WINNERS_LAST_ACTIVITIES}`;
  
      return this.httpClient
        .get<BaseApiResponse<TopWinnersLastActivities[]>>(requestUrl)
        .pipe(
          map((resp) => {
            return resp
          })
        )
    }
}
