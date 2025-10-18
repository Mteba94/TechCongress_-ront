import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';
import { CertificatesByUser, InscriptionByUser } from '../../user-management-system/models/userResp.interface';
import { endpoint } from '../../../shared/utils/endpoints.util';
import { environment as env } from '../../../../environments/environment.development';
import { AttendancePercentage } from '../models/user-resp.interface';

@Injectable({
  providedIn: 'root'
})
export class User {
  private readonly httpClient = inject(HttpClient);
  
  InscriptionsByUser(userId: number): Observable<BaseApiResponse<InscriptionByUser>>{
      const requestUrl = `${env.api}${endpoint.USER_BY_ID}${userId}/Inscriptions/Count`;
  
      return this.httpClient.get<BaseApiResponse<InscriptionByUser>>(requestUrl).pipe(
        map((response: BaseApiResponse<InscriptionByUser>) => {
          return response;
        })
      )
    }
  
    CertificatesByUser(userId: number): Observable<BaseApiResponse<CertificatesByUser>>{
      const requestUrl = `${env.api}${endpoint.USER_BY_ID}${userId}/Certificates/Count`;
  
      return this.httpClient.get<BaseApiResponse<CertificatesByUser>>(requestUrl).pipe(
        map((response: BaseApiResponse<CertificatesByUser>) => {
          return response;
        })
      )
    }

    AttendancePercentage(userId: number): Observable<BaseApiResponse<AttendancePercentage>>{
      const requestUrl = `${env.api}${endpoint.USER_BY_ID}${userId}/AttendancePercentage`;
  
      return this.httpClient.get<BaseApiResponse<AttendancePercentage>>(requestUrl).pipe(
        map((response: BaseApiResponse<AttendancePercentage>) => {
          return response;
        })
      )
    }
}
