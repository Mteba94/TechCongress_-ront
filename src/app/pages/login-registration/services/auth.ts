import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { LoginRequest } from '../models/login-request.interface';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';
import { environment as env } from '../../../../environments/environment.development';
import { endpoint } from '../../../shared/utils/endpoints.util';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private user: BehaviorSubject<string>;

  public get userToken(): string {
    return this.user.value;
  }

  constructor() {
    this.user = new BehaviorSubject<string>(
      JSON.parse(localStorage.getItem('token')!)
    );
  }

  login(request: LoginRequest): Observable<BaseApiResponse<string>> {
    const requestUrl = `${env.api}${endpoint.LOGIN}`;

    return this.http.post<BaseApiResponse<string>>(requestUrl, request).pipe(
      map((response: BaseApiResponse<string>) => {
        if (response.isSuccess) {
          localStorage.setItem('token', JSON.stringify(response.accessToken));
            this.user.next(response.accessToken);
        }
        //console.log(response)
        return response;
      })
    );
  }

  logout(){
    localStorage.removeItem('token')
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userData');
    this.user.next('');
    this.router.navigate(['/congress-homepage']);
  }
}
