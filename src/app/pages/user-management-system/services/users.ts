import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';
import { CertificatesByUser, InscriptionByUser, User, UserApi, UserSummary } from '../models/userResp.interface';
import { endpoint } from '../../../shared/utils/endpoints.util';
import { environment as env } from '../../../../environments/environment.development';
import { School } from '../../login-registration/services/school';
import { NivelAcademico } from '../../login-registration/services/nivel-academico';
import { TipoParticipante } from '../../login-registration/services/tipo-participante';
import { UserRole } from '../../login-registration/services/user-role';
import { CreateParticipanteCommand, UpdateParticipanteCommand } from '../models/participante.commands';

@Injectable({
  providedIn: 'root'
})
export class Users {
  private readonly httpClient = inject(HttpClient);

  private readonly school = inject(School);
  private readonly nivelAcademico = inject(NivelAcademico);
  private readonly tipoParticipante = inject(TipoParticipante)
  private readonly roleUser = inject(UserRole)
  

  getAll(
      size: number,
      sort: string,
      order: string,
      numPage: number,
      getInputs: string
    ): Observable<BaseApiResponse<User[]>>{
      const requestUrl = `${env.api}${endpoint.LIST_USER
            }?records=${size}&sort=${sort}&order=${order}&numPage=${numPage + 1
            }${getInputs}`;
            
      return forkJoin({
        usuarios: this.httpClient.get<BaseApiResponse<UserApi[]>>(requestUrl),
        schools: this.school.getSelectSchool(),
        nivelAcademico: this.nivelAcademico.getSelectNivelAcademico(),
        tipoParticipante: this.tipoParticipante.getSelectTipoParticipante(),
        summary: this.UserSummary()
      })
        .pipe(
          switchMap(({
            usuarios,
            schools,
            nivelAcademico,
            tipoParticipante,
            summary
          }) => {
            const school = new Map<number, string>();
            schools.data.forEach((tipo: any) => {
                school.set(tipo.id, tipo.nombre)
            });

            const nivel = new Map<number, string>();
            nivelAcademico.data.forEach((tipo: any) => {
                nivel.set(tipo.id, tipo.nombre)
            });

            const tipoP = new Map<number, string>();
            tipoParticipante.data.forEach((tipo: any) => {
                tipoP.set(tipo.id, tipo.nombre)
            });

            const summaryMap = new Map<number, UserSummary>();
            summary.data.forEach(user => {
              summaryMap.set(user.userId, user);
            });


            const mappedUsers: User[] = usuarios.data.map((user: UserApi) => {
              const nameParts = [
                user.pnombre,
                user.snombre ? user.snombre : '',
                user.papellido,
                user.sapellido ? user.sapellido : ''
              ];

              const filteredParts = nameParts.filter(part => part && part.trim() !== '');

              return {
                ...user,
                name: filteredParts.join(' '),
                grade: nivel.get(Number(user.nivelAcademico)),
                institution: school.get(Number(user.school)),
                tipoParticipanteDescripcion: tipoP.get(Number(user.tipoParticipanteId)),
                role: tipoP.get(Number(user.tipoParticipanteId)) ?? '',
                activitiesCount: summaryMap.get(Number(user.userId))?.inscriptionsCount ?? 0,
                certificatesCount: summaryMap.get(Number(user.userId))?.certificatesCount ?? 0
              } as User;
            })

            const usersWithTipo0 = mappedUsers.filter(u => u.tipoParticipanteId === 0);

            if(usersWithTipo0.length === 0){
              return of({ ...usuarios, data: mappedUsers });
            }

            const roleRequests = usersWithTipo0.map(u =>
              this.roleUser.getUserRole(Number(u.userId))
            );
            return forkJoin(roleRequests).pipe(
              map((roles) => {
                usersWithTipo0.forEach((u, i) => {
                  u.role = this.capitalizeFirstLetter(roles[i]?.data?.nombre ?? '');
                })
                return { ...usuarios, data: mappedUsers };
              })
              
            )
          }),
        )
    }

  createUser(request: CreateParticipanteCommand): Observable<BaseApiResponse<boolean>>{
      const requestUrl = `${env.api}${endpoint.CREATE_PARTICIPANTE}`;
  
      return this.httpClient.post<BaseApiResponse<boolean>>(requestUrl, request).pipe(
        map((response: BaseApiResponse<boolean>) => {
          return response;
        })
      )
    }

  updateUser(request: UpdateParticipanteCommand): Observable<BaseApiResponse<boolean>>{
    const requestUrl = `${env.api}${endpoint.UPDATE_PARTICIPANTE}`;

    return this.httpClient.put<BaseApiResponse<boolean>>(requestUrl, request).pipe(
      map((response: BaseApiResponse<boolean>) => {
        return response;
      })
    )
  }

  deleteUser(id: number): Observable<BaseApiResponse<boolean>>{
    const requestUrl = `${env.api}${endpoint.DELETE_PARTICIPANTE}/${id}`;

    return this.httpClient.delete<BaseApiResponse<boolean>>(requestUrl).pipe(
      map((response: BaseApiResponse<boolean>) => {
        return response;
      })
    )
  }

  private capitalizeFirstLetter(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

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

  UserSummary(): Observable<BaseApiResponse<UserSummary[]>>{
    const requestUrl = `${env.api}${endpoint.SUMMARY_USER}`;

    return this.httpClient.get<BaseApiResponse<UserSummary[]>>(requestUrl).pipe(
      map((response: BaseApiResponse<UserSummary[]>) => {
        return response;
      })
    )
  }
}
