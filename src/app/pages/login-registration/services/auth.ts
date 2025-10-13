import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable, switchMap, of, catchError, throwError } from 'rxjs';
import { LoginRequest } from '../models/login-request.interface';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';
import { environment as env } from '../../../../environments/environment.development';
import { endpoint } from '../../../shared/utils/endpoints.util';
import { RecoveryPaswordRequest } from '../models/recoveryPass-req.interface';
import { CurrentUser } from '../models/user-resp.interface';
import { jwtDecode } from 'jwt-decode';
import { UserRole } from './user-role';

interface JwtPayload {
  sub: string;
  given_name: string;
  family_name: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly roleService = inject(UserRole);

  private currentUserSubject: BehaviorSubject<CurrentUser | null>;
  public userTokenSubject: BehaviorSubject<string | null>;

  public get userToken(): string | null{
    return this.userTokenSubject.value;
  }

  public get currentUser$(): Observable<CurrentUser | null> {
    return this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  public get isAuthenticated(): boolean {
    return !!this.userTokenSubject.value;
  }

  constructor() {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    this.userTokenSubject = new BehaviorSubject<string | null>(storedToken);

    let user = null;
    if (storedToken) {
      try {
        const parsedToken = JSON.parse(storedToken);
        user = this.decodeToken(parsedToken);
      } catch (error) {
        user = this.decodeToken(storedToken);
      }
    }
    this.currentUserSubject = new BehaviorSubject<CurrentUser | null>(user);
  }

  login(request: LoginRequest): Observable<BaseApiResponse<string>> {
    const requestUrl = `${env.api}${endpoint.LOGIN}`;

    return this.http.post<BaseApiResponse<string>>(requestUrl, request).pipe(
      switchMap((response: BaseApiResponse<string>) => {
        if (response.isSuccess && response.accessToken && response.message !== 'Recovery') {
          const token = response.accessToken;

          localStorage.setItem('token', token);
          this.userTokenSubject.next(token);

          const decodedUser = this.decodeToken(token);

          if (decodedUser) {
            //console.log(decodedUser);
            return this.roleService.getUserRole(decodedUser.id).pipe(
              map(roleResp => {
                if (roleResp.isSuccess) {
                  decodedUser.role = roleResp.data.nombre.toLowerCase();
                  this.currentUserSubject.next(decodedUser);
                }
                return response;
              })
            );
          }
        }

        if (response.message === 'Recovery') {
          this.userTokenSubject.next(null);
          this.currentUserSubject.next(null);
          localStorage.removeItem('token');
          localStorage.removeItem('isAuthenticated');
        }
        this.currentUserSubject.next(null);
        return of(response);
      }),
      catchError(err => {
        console.error('Login failed', err);
        return throwError(() => err);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('isAuthenticated');
    this.userTokenSubject.next(null);
    this.currentUserSubject.next(null);
    this.router.navigate(['/congress-homepage']);
  }

  recoveryPassword(request: RecoveryPaswordRequest): Observable<BaseApiResponse<string>> {
    const requestUrl = `${env.api}${endpoint.RECOVERY_PASSWORD}`;
    return this.http.put<BaseApiResponse<string>>(requestUrl, request);
  }

  private decodeToken(token: string): CurrentUser | null {
    try {
      const decoded: JwtPayload = jwtDecode(token);
      return {
        id: Number(decoded.sub),
        name: `${decoded.given_name} ${decoded.family_name}`,
        email: decoded.email,
        role: decoded.role
      };
    } catch (error) {
      console.error('Invalid token', error);
      return null;
    }
  }
}