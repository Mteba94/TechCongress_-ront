import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';
import { PonenteTagByPonenteIdResponse } from '../models/ponenteTags-response.interface';
import { endpoint } from '../../../shared/utils/endpoints.util';
import { environment as env } from '../../../../environments/environment.development';
import { TagService } from './tag-service';
import { SelectResponse } from '../../login-registration/models/select-response.interface';

@Injectable({
  providedIn: 'root'
})
export class PonenteTagService {
  private readonly httpClient = inject(HttpClient);
  private readonly tagService = inject(TagService)

  GetPonenteTagsByPonenteId(ponenteId: number): Observable<BaseApiResponse<PonenteTagByPonenteIdResponse[]>> {
    const requestUrl = `${env.api}${endpoint.PONENTES_TAG_BY_PONENTE_ID}${ponenteId}?download=true`;

    return forkJoin({
      ponenteTags: this.httpClient.get<BaseApiResponse<PonenteTagByPonenteIdResponse[]>>(requestUrl, {}),
      tags: this.tagService.getAllTags()
    }) 
      .pipe(
        map(({
          ponenteTags,
          tags
        }) => {
          const tagsAll = new Map<number, string>();
          tags.data.forEach((tipo: any) => {
            tagsAll.set(tipo.tagId, tipo.nombre);
          });

          ponenteTags.data.forEach(function (pt: PonenteTagByPonenteIdResponse){
            pt.tagName = tagsAll.get(pt.tagId);
          })
          return ponenteTags;
        })
      );
  }
}
