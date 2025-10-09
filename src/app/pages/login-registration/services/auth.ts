import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { LoginRequest } from '../models/login-request.interface';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';
import { environment as env } from '../../../../environments/environment.development';
import { endpoint } from '../../../shared/utils/endpoints.util';
import { RecoveryPaswordRequest } from '../models/recoveryPass-req.interface';
import { CurrentUser } from '../models/user-resp.interface';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private user: BehaviorSubject<string>;
  private currentUserSubject: BehaviorSubject<CurrentUser | null>;

  public get userToken(): string {
    return this.user.value;
  }

  public get currentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  constructor() {
    const storedToken  = localStorage.getItem('token');

    this.user = new BehaviorSubject<string>(
      JSON.parse(localStorage.getItem('token')!)
    );

    this.currentUserSubject = new BehaviorSubject<CurrentUser | null>(
      storedToken  ? this.decodeToken(storedToken) : null
    );
  }

  login(request: LoginRequest): Observable<BaseApiResponse<string>> {
    const requestUrl = `${env.api}${endpoint.LOGIN}`;

    return this.http.post<BaseApiResponse<string>>(requestUrl, request).pipe(
      map((response: BaseApiResponse<string>) => {
        if (response.isSuccess) {
          localStorage.setItem('token', JSON.stringify(response.accessToken));
            this.user.next(response.accessToken);
            this.currentUserSubject.next(this.decodeToken(response.accessToken));
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

  recoveryPassword(request: RecoveryPaswordRequest): Observable<BaseApiResponse<string>> {
    const requestUrl = `${env.api}${endpoint.RECOVERY_PASSWORD}`;

    return this.http.put<BaseApiResponse<string>>(requestUrl, request).pipe(
      map((response: BaseApiResponse<string>) => {
        return response;
      })
    )
    
  }

  private decodeToken(token: string): CurrentUser | null {
    try {
      const decoded: any = jwtDecode(token);
      // 👇 Mapea los valores que vienen en el payload
      return {
        id: decoded.sub,
        name: decoded.given_name + ' ' + decoded.family_name,
        email: decoded.email,
        role: decoded.role
      };
    } catch (error) {
      console.error('Token inválido', error);
      return null;
    }
  }
}
