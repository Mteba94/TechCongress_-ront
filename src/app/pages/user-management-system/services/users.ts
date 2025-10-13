import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { BaseApiResponse } from '../../../shared/models/reusables/base-api-response.interface';
import { UserApi } from '../models/userResp.interface';
import { endpoint } from '../../../shared/utils/endpoints.util';
import { environment as env } from '../../../../environments/environment.development';
import { School } from '../../login-registration/services/school';
import { User } from '../models/userResp.interface';
import { NivelAcademico } from '../../login-registration/services/nivel-academico';
import { TipoParticipante } from '../../login-registration/services/tipo-participante';
import { UserRole } from '../../login-registration/services/user-role';

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
        usuarios: this.httpClient.get<BaseApiResponse<User[]>>(requestUrl),
        schools: this.school.getSelectSchool(),
        nivelAcademico: this.nivelAcademico.getSelectNivelAcademico(),
        tipoParticipante: this.tipoParticipante.getSelectTipoParticipante(),
      })
        .pipe(
          switchMap(({
            usuarios,
            schools,
            nivelAcademico,
            tipoParticipante
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

            usuarios.data.forEach(function (user: User) {

              const nameParts = [
                user.pnombre,
                user.snombre ? user.snombre : '',
                user.papellido,
                user.sapellido ? user.sapellido : ''
              ]

              const filteredParts = nameParts.filter(part => part && part.trim() !== '');

              user.name = filteredParts.join(' ');
              user.grade = nivel.get(Number(user.nivelAcademico));
              user.institution = school.get(Number(user.school));
              user.tipoParticipanteDescripcion = tipoP.get(Number(user.tipoParticipanteId));
              user.role = tipoP.get(Number(user.tipoParticipanteId)) ?? '';
            })
            const usersWithTipo0 = usuarios.data.filter(u => u.tipoParticipanteId === 0);

            if(usersWithTipo0.length === 0){
              return of(usuarios)
            }

            const roleRequests = usersWithTipo0.map(u =>
              this.roleUser.getUserRole(Number(u.userId))
            );

            return forkJoin(roleRequests).pipe(
              map((roles) => {
                usersWithTipo0.forEach((u, i) => {
                  u.role = this.capitalizeFirstLetter(roles[i]?.data?.nombre ?? '');
                })
                return usuarios;
              })
              
            )
          })
        )
    }

  createUser(request: User): Observable<BaseApiResponse<boolean>>{
      const requestUrl = `${env.api}${endpoint.CREATE_PARTICIPANTE}`;
  
      return this.httpClient.post<BaseApiResponse<boolean>>(requestUrl, request).pipe(
        map((response: BaseApiResponse<boolean>) => {
          return response;
        })
      )
    }

  private capitalizeFirstLetter(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
}
