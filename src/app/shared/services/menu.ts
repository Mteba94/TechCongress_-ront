import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiResponse } from '../models/reusables/base-api-response.interface';
import { environment as env } from '../../../environments/environment.development';
import { MenuResponse } from '../models/layout/menu.interface';
import { endpoint } from '../utils/endpoints.util';


@Injectable({
  providedIn: 'root'
})
export class Menu {
  private readonly http = inject(HttpClient);

  getMenuByRole(): Observable<BaseApiResponse<MenuResponse[]>> {
    const requestUrl = `${env.api}${endpoint.MENU_BY_USER}`;
    return this.http.get<BaseApiResponse<MenuResponse[]>>(requestUrl);
  }
}
