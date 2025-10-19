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
    const sessionToken = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    const tokenToUse = storedToken || sessionToken;

    // console.log('Auth Service Constructor:');
    // console.log('  storedToken:', storedToken);
    // console.log('  sessionToken:', sessionToken);
    // console.log('  tokenToUse:', tokenToUse);

    this.userTokenSubject = new BehaviorSubject<string | null>(tokenToUse);

    let initialUser: CurrentUser | null = null;
    if (tokenToUse) {
      initialUser = this.decodeToken(tokenToUse);
    }
    this.currentUserSubject = new BehaviorSubject<CurrentUser | null>(initialUser);
    // console.log('  initialUser (from decodeToken):', initialUser);
    // console.log('  currentUserSubject after initial setup:', this.currentUserSubject.value);

    if (tokenToUse && initialUser) {
      this.roleService.getUserRole(initialUser.id).pipe(
        map(roleResp => {
          if (roleResp.isSuccess && initialUser) {
            initialUser.role = roleResp.data.nombre.toLowerCase();
            this.currentUserSubject.next(initialUser);
            //console.log('  currentUserSubject after role fetch success:', this.currentUserSubject.value);
          } else {
            //console.warn('Failed to fetch application role, clearing session.');
            this.logout();
          }
        }),
        catchError(err => {
          //console.error('Error fetching user role on reload, clearing session.', err);
          this.logout();
          return of(null);
        })
      ).subscribe();
    }
  }

  login(request: LoginRequest, rememberMe: boolean = false): Observable<BaseApiResponse<string>> {
    const requestUrl = `${env.api}${endpoint.LOGIN}`;

    return this.http.post<BaseApiResponse<string>>(requestUrl, request).pipe(
      switchMap((response: BaseApiResponse<string>) => {
        if (response.isSuccess && response.accessToken && response.message !== 'Recovery') {
          const token = response.accessToken;

          if (rememberMe) {
            localStorage.setItem('token', token);
            sessionStorage.removeItem('token'); // Clear session storage if rememberMe is true
          } else {
            sessionStorage.setItem('token', token);
            localStorage.removeItem('token'); // Clear local storage if rememberMe is false
          }
          this.userTokenSubject.next(token);

          const decodedUser = this.decodeToken(token);

          if (decodedUser) {
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
          sessionStorage.removeItem('token');
        }
        this.currentUserSubject.next(null);
        return of(response);
      }),
      catchError(err => {
        console.error('Login failed', err);
        this.userTokenSubject.next(null);
        this.currentUserSubject.next(null);
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        return throwError(() => err);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('userData'); // This is not used anywhere else
    localStorage.removeItem('isAuthenticated'); // This is not used anywhere else
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