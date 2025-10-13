import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Checkbox } from '../../../../shared/components/reusables/checkbox/checkbox';
import { ArrowDown, ArrowUp, ArrowUpDown, GraduationCap, LucideAngularModule, LucideIconData, Shield, User, Users } from 'lucide-angular';
import { Button } from '../../../../shared/components/reusables/button/button';
import { User as userModel } from '../../models/userResp.interface';
import { CommonModule } from '@angular/common';

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export type UserSortKey = keyof userModel;
type SortableUserKey = 'userId' | 'name' | 'email' | 'role' | 'estadoDescripcion' | 'institution' | 'activitiesCount' | 'registrationDate' | 'lastLogin'; 

@Component({
  selector: 'app-user-table',
  imports: [
    Checkbox,
    LucideAngularModule,
    CommonModule,
    Button
  ],
  templateUrl: './user-table.html',
  styleUrl: './user-table.css'
})
export class UserTable {
  @Input() users: userModel[] = [];
  @Input() selectedUsers: (number | string)[] = [];
  @Input() sortConfig: SortConfig = { key: '', direction: 'asc' };;
  @Input() loading: boolean = false;

  @Output() sort = new EventEmitter<UserSortKey>(); 
  @Output() selectUser = new EventEmitter<number | string>();
  @Output() selectAll = new EventEmitter<void>();
  @Output() viewUser = new EventEmitter<userModel>();
  @Output() editUser = new EventEmitter<userModel>();
  @Output() deleteUser = new EventEmitter<number | string>();

  readonly icons = {
    user: User,
    shield: Shield,
    graduationCap: GraduationCap,
    users: Users
  }

  get allSelected(): boolean {
    return this.users.length > 0 && this.users.every(u => this.selectedUsers.includes(u.userId));
  }

  get someSelected(): boolean {
    return this.users.some(u => this.selectedUsers.includes(u.userId)) && !this.allSelected;
  }

  getRoleLabel(role: string): string {
    const roles: Record<string, string> = {
      admin: 'Administrador',
      student: 'Estudiante Interno',
      external: 'Estudiante Externo'
    };
    return roles[role] ?? role;
  }

  getStatusInfo(status: string): { label: string; color: string } {
    const statuses: Record<string, { label: string; color: string }> = {
      Activo: { label: 'Activo', color: 'green' },
      Inactivo: { label: 'Inactivo', color: 'gray' },
      Pendiente: { label: 'Pendiente', color: 'yellow' },
      Bloqueado: { label: 'Bloqueado', color: 'red' }
    };
    return statuses[status] ?? { label: status, color: 'gray' };
  }

  getSortIcon(columnKey: string): LucideIconData {
    const currentConfig = this.sortConfig;
    //console.log(this.sortConfig);
    if (!currentConfig || currentConfig.key !== columnKey) {
      return ArrowUpDown;
    }
    //console.log(currentConfig.direction); // ahora sí imprime asc o desc
    return currentConfig.direction === 'asc' ? ArrowUp : ArrowDown;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  onSortClick(column: SortableUserKey) {
    this.sort.emit(column);
  }

  onSelectUserClick(id: number | string) {
    this.selectUser.emit(id);
  }

  onSelectAllClick() {
    this.selectAll.emit();
  }

  onViewUserClick(user: userModel) {
    this.viewUser.emit(user);
  }

  onEditUserClick(user: userModel) {
    this.editUser.emit(user);
  }

  onDeleteUserClick(id: number | string) {
    this.deleteUser.emit(id);
  }

  getRoleIcon(userRole: string | undefined): LucideIconData{
    if(!userRole){
      return this.icons.user;
    }

    switch(userRole.toLowerCase()){
      case 'administrador':
        return this.icons.shield;
      case 'estudiante umg':
        return this.icons.graduationCap;
      default:
        return this.icons.user;
    }
  }
}
