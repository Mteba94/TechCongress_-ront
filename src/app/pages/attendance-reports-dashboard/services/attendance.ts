import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';
import { attendanceData, chartsData, metricsData } from '../models/attendance-resp.interface';
import { endpoint } from '../../../shared/utils/endpoints.util';
import { environment as env } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class Attendance {
  private readonly httpClient = inject(HttpClient);

  getMetricsData(): Observable<BaseApiResponse<metricsData>> {
    const requestUrl = `${env.api}${endpoint.SPECIFIC_METRICS}`;

    return this.httpClient
      .get<BaseApiResponse<metricsData>>(requestUrl)
      .pipe(
        map((resp) => {
          return resp
        })
      )
  }

  getChartsData(): Observable<BaseApiResponse<chartsData>> {
    const requestUrl = `${env.api}${endpoint.CHARTS_DATA}`;

    return this.httpClient
      .get<BaseApiResponse<chartsData>>(requestUrl)
      .pipe(
        map((resp) => {
          return resp
        })
      )
  }

  getAttendanceData(): Observable<BaseApiResponse<attendanceData[]>> {
    const requestUrl = `${env.api}${endpoint.ASISTENCIA_DETAILS}`;

    return this.httpClient
      .get<BaseApiResponse<attendanceData[]>>(requestUrl)
      .pipe(
        map((resp) => {
          return resp
        })
      )
  }
}