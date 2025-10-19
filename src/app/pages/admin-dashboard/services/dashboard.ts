import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';
import { MetricsCards } from '../models/metrics-resp.interface';
import { environment as env } from '../../../../environments/environment.development';
import { endpoint } from '../../../shared/utils/endpoints.util';

@Injectable({
  providedIn: 'root'
})
export class Dashboard {
  private readonly httpClient = inject(HttpClient);

  GetMetrics(timeRange: string): Observable<BaseApiResponse<MetricsCards>> {
    const requestUrl = `${env.api}${endpoint.METRICS_CARDS}?timeRange=${timeRange}`;

    return this.httpClient
      .get<BaseApiResponse<MetricsCards>>(requestUrl)
      .pipe(
        map((resp) => {
          return resp
        })
      )
  }
}
