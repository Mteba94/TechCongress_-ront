import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment as env } from '../../../../environments/environment.development';
import { endpoint } from '../../../shared/utils/endpoints.util';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';

// Interface for the QR code response data
export type QrCodeResponse = string;

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {
  private readonly httpClient = inject(HttpClient);

  /**
   * Fetches a Base64 encoded QR code for a specific activity.
   * @param actividadId The ID of the activity.
   * @returns An observable with the Base64 QR code string.
   */
  generateQrCode(actividadId: number): Observable<BaseApiResponse<string>> {
    const requestUrl = `${env.api}${endpoint.GENERATE_ATTENDANCE_QR}?actividadId=${actividadId}`;
    return this.httpClient.get<BaseApiResponse<string>>(requestUrl);
  }

  generateQRuser(userId: number, activityId?: number): Observable<BaseApiResponse<any>> {
    const requestUrl = `${env.api}${endpoint.GENERATE_USER_QR}${userId}/GenerateQrCode/${activityId}`;

    return this.httpClient.get<BaseApiResponse<string>>(requestUrl);
  }

  markAttendance(data: any): Observable<any> {
    const requestUrl = `${env.api}${endpoint.MARK_ATTENDANCE}`;
    return this.httpClient.post(requestUrl, data);
  }

}
