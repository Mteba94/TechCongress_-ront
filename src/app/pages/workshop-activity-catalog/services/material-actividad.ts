import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';
import { environment as env } from '../../../../environments/environment.development';
import { endpoint } from '../../../shared/utils/endpoints.util';
import { MaterialActividadDTO } from '../models/materialActividad-resp.interface';

@Injectable({
  providedIn: 'root'
})
export class MaterialActividad {
  private readonly httpClient = inject(HttpClient);

  getAllMaterialActividad(): Observable<BaseApiResponse<MaterialActividadDTO[]>> {
          const requestUrl = `${env.api}${endpoint.LIST_MATERIAL_ACTIVIDAD}?StateFilter=${1}&download=true`;
      
          return this.httpClient
            .get<BaseApiResponse<MaterialActividadDTO[]>>(requestUrl)
            .pipe(
              map((resp) => {
                return resp
              })
            )
        }
}
