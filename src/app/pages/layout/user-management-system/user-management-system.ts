import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Auth } from '../../login-registration/services/auth';
import { UserLog } from '../../../shared/models/commons/user.interface';
import { CommonModule } from '@angular/common';
import { CheckCircle, Loader, LucideAngularModule, Search, Users } from 'lucide-angular';
import { Header } from '../../../shared/components/layout/header/header';
import { Breadcrumbs } from '../../../shared/components/reusables/breadcrumbs/breadcrumbs';
import { Button } from '../../../shared/components/reusables/button/button';
import { InputComponent } from '../../../shared/components/reusables/input/input';
import { UserFilters } from '../../user-management-system/components/user-filters/user-filters';
import { UserTable } from '../../user-management-system/components/user-table/user-table';
import { User } from '../../user-management-system/models/userResp.interface';
import { Users as UsersService } from '../../user-management-system/services/users';
import { CreateParticipanteCommand, UpdateParticipanteCommand } from '../../user-management-system/models/participante.commands';
import { NotificacionService } from '../../../shared/services/notificacion-service';
import { UserModal } from '../../user-management-system/components/user-modal/user-modal';
import { NotificationsAlert } from '../../../shared/components/reusables/notifications-alert/notifications-alert';

interface FilterConfig {
  role: string;
  status: string;
  institution: string;
  activityParticipation: string;
}

interface SortConfig {
  key: keyof User;
  direction: 'asc' | 'desc';
}

type UserSortKey = keyof User;

@Component({
  selector: 'app-user-management-system',
  imports: [
    CommonModule,
    LucideAngularModule,
    Header,
    Breadcrumbs,
    Button,
    InputComponent,
    UserFilters,
    UserTable,
    UserModal,
    NotificationsAlert
  ],
  templateUrl: './user-management-system.html',
  styleUrl: './user-management-system.css'
})
export class UserManagementSystem {
  readonly icons = {
    loader: Loader,
    users: Users,
    checkCircle: CheckCircle,
    search: Search
  }

  public readonly notificacionService = inject(NotificacionService)

  isSaving = signal<boolean>(false);
  user = signal<User | null>(null);
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  selectedUsers = signal<number[]>([]);
  searchTerm = signal<string>('');
  loading = signal(false);
  filters = signal<FilterConfig>({
    role: '',
    status: '',
    institution: '',
    activityParticipation: ''
  });
  sortConfig = signal<SortConfig>({
    key: 'registrationDate',
    direction: 'desc'
  });

  userLog = signal<UserLog | null>(null);

  showUserModal = signal<boolean>(false);
  editingUser = signal<User | null>(null);
  currentPage = signal<number>(1);
  totalRecordsInDB = signal<number>(0);
  usersPerPage = 10;
  isLoading = false;

  private readonly authService = inject(Auth)
  private readonly userService = inject(UsersService)

  public Math = Math;


  constructor(private router: Router) { }

  async ngOnInit() {
    await this.checkAdminAccess();
    // const userData = localStorage.getItem('userData');
    // if (!userData) {
    //   this.router.navigate(['/login-registration']);
    //   return;
    // }

    // const parsedUser = JSON.parse(userData);
    // if (parsedUser.role !== 'admin') {
    //   this.router.navigate(['/user-dashboard']);
    //   return;
    // }

    // this.user.set(parsedUser);
    // this.loadUsers();
    
    this.loadUsers();
  }

  private async checkAdminAccess() {
    try {
      // Obtener el usuario actual desde AuthService
      const currentUser = await firstValueFrom(this.authService.currentUser$);

      if (!currentUser) {
        // No autenticado → redirigir a login
        this.router.navigate(['/login-registration']);
        return;
      }

      // Verificar si el usuario es administrador
      // if (currentUser.role?.toLowerCase() !== 'administrador') {
      //   // Redirigir a panel normal o mostrar mensaje de acceso denegado
      //   console.warn('Acceso denegado: el usuario no es administrador');
      //   this.router.navigate(['/user-dashboard']);
      //   return;
      // }

      // Usuario admin válido → asignar datos
      this.userLog.set({
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        lastAccess: new Date().toLocaleDateString('es-ES')
      })
    } catch (error) {
      console.error('Error verificando usuario admin:', error);
      this.router.navigate(['/login-registration']);
    } finally {
      this.isLoading = false;
    }
  }

  get paginationPages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage();
    const pages: number[] = [];

    for (let i = 0; i < Math.min(5, total); i++) {
      const pageNumber = current <= 3 ? i + 1 : current - 2 + i;
      if (pageNumber <= total) {
        pages.push(pageNumber);
      }
    }

    return pages;
  }

  loadUsers(){
    this.loading.set(true);
    //this.paginatorOptions.currentPage = 0;
    let str = '';

    const pageIndex = this.currentPage() - 1;
    const pageSize = this.usersPerPage;
    const sortKey = this.sortConfig().key;
    const sortDir = this.sortConfig().direction;
    const searchTerm = this.searchTerm();

    const filters = this.filters();

    if(filters.status != null){
      str += `&stateFilter=${filters.status}`;
    }

    this.isLoading = true;
    this.userService
      .getAll(pageSize, sortKey, sortDir, pageIndex, str)
      .subscribe(resp => {
        this.users.set(resp.data);
        this.filteredUsers.set(resp.data); 
        this.totalRecordsInDB.set(resp.totalRecords);
        this.isLoading = false;
        //console.log(resp.data)
      });
  }

  setSearchTerm(value: string) {
    this.searchTerm.set(value);
    this.currentPage.set(1);
    this.loadUsers();
  }

  applyFiltersAndSorting(): void {
    let filtered = this.users().filter(u => {
      const matchesSearch =
        u.name.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        u.email.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        u.institution?.toLowerCase().includes(this.searchTerm().toLowerCase());

      const matchesRole = !this.filters().role || u.role === this.filters().role;
      const matchesStatus = !this.filters().status || u.estadoDescripcion === this.filters().status;
      const matchesInstitution = !this.filters().institution || u.institution?.includes(this.filters().institution);

      return matchesSearch && matchesRole && matchesStatus && matchesInstitution;
    });

    const key = this.sortConfig().key;
    filtered.sort((a, b) => {
      let aValue: any = a[key];
      let bValue: any = b[key];

      if (key === 'registrationDate' || key === 'lastLogin') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      if (aValue < bValue) return this.sortConfig().direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortConfig().direction === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredUsers.set(filtered);
    this.currentPage.set(1);
  }

  currentSortConfig: SortConfig = { key: 'name', direction: 'asc' };
  

  handleSort(columnKey: UserSortKey) {
    const currentConfig = this.sortConfig();
    let direction: 'asc' | 'desc' = 'asc';

    if (currentConfig.key === columnKey) {
      direction = currentConfig.direction === 'asc' ? 'desc' : 'asc';
    }

    this.sortConfig.set({ key: columnKey, direction });
    this.applyFiltersAndSorting();
  }

  handleSelectUser(userId: string | number) {
    const id = Number(userId);
    const selected = this.selectedUsers();
    if (selected.includes(id)) {
      this.selectedUsers.set(selected.filter(id => id !== userId));
    } else {
      this.selectedUsers.set([...selected, id]);
    }
  }

  handleSelectAll() {
    const currentUsers = this.getCurrentPageUsers();
    const allSelected = currentUsers.every(u => this.selectedUsers().includes(Number(u.userId)));
    if (allSelected) {
      this.selectedUsers.set(
        this.selectedUsers().filter(id => !currentUsers.some(u => u.userId === id))
      );
    } else {
      this.selectedUsers.set([...new Set([...this.selectedUsers(), ...currentUsers.map(u => Number(u.userId))])]);
    }
  }

  handleCreateUser() {
    this.editingUser.set(null);
    this.showUserModal.set(true);
  }

  handleViewUser(user: User) {
    this.editingUser.set(user);
    this.showUserModal.set(true);
    // podrías setear una bandera “readonly” para mostrar el modal sin permitir edición
  }

  handleEditUser(user: User) {
    //console.log(user)
    this.editingUser.set(user);
    this.showUserModal.set(true);
    //console.log('Modal abierto:', this.showUserModal());
  }

  async handleDeleteUser(userId: number | string) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;

    try {
      const response = await firstValueFrom(this.userService.deleteUser(Number(userId)));

      if(response.isSuccess){
        this.notificacionService.show('Usuario eliminado exitosamente.', 'success');
        this.loadUsers();
      }else{        
        this.notificacionService.show(response.message, 'error');
      }
    } catch (error) {
      this.notificacionService.show('Error al eliminar el usuario.', 'error');
    }
  }

  handleBulkAction(action: string) {
    //console.log(`Executing ${action} on users`, this.selectedUsers());
    this.selectedUsers.set([]);
  }

  getCurrentPageUsers(): User[] {
    //const start = (this.currentPage() - 1) * this.usersPerPage;
    //return this.filteredUsers().slice(start, start + this.usersPerPage);
    return this.filteredUsers();
  }

  get totalPages(): number {
    //return Math.ceil(this.filteredUsers().length / this.usersPerPage);
    return Math.ceil(this.totalRecordsInDB() / this.usersPerPage);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage.set(page);
    this.loadUsers();
  }

  setFilters(newFilters: FilterConfig) {
    this.filters.set(newFilters);
    //this.loadUsers();
    this.loadUsers();
  }

  handleCloseModal(): void {
    this.showUserModal.set(false);
    this.editingUser.set(null);
  }

  // handleSaveUser(newUserData: Omit<User, 'id'>): void {
  //   const userToEdit = this.editingUser();

  //   if (userToEdit) {
  //     // Lógica de Edición: map
  //     this.users.update(prevUsers => 
  //       prevUsers.map(u => 
  //         u.userId === userToEdit.userId ? { ...u, ...newUserData } : u
  //       )
  //     );
  //     console.log('edit', this.users)
  //   } else {
  //     setTimeout(() => {}, 10000)
  //     // Lógica de Creación: spread
  //     // const newUser: User = { 
  //     //   ...newUserData, 
  //     //   //id: Date.now() // Generamos un ID simple
  //     // };
  //     //this.users.update(prevUsers => [...prevUsers, newUser]);
  //     console.log(newUserData)
      
  //   }
    

  //   // Limpieza de estado final
  //   this.showUserModal.set(false);
  //   this.editingUser.set(null);
  // }

  async handleSaveUser(newUserData: Omit<User, 'id'>): Promise<void> {
    this.isSaving.set(true);
    const userToEdit = this.editingUser();

    console.log(newUserData)
    
    try {
      if (userToEdit) {
        const command: UpdateParticipanteCommand = {
          participanteId: Number(userToEdit.userId),
          pnombre: newUserData.pnombre,
          snombre: newUserData.snombre,
          papellido: newUserData.papellido,
          sapellido: newUserData.sapellido,
          tipoParticipanteId: newUserData.tipoParticipanteId,
          email: newUserData.email,
          telefono: newUserData.telefono,
          fechaNacimiento: newUserData.registrationDate, // Assuming registrationDate is used for fechaNacimiento
          tipoIdentificacionId: 1, // Assuming a default value
          numeroIdentificacion: 'N/A', // Assuming a default value
          schoolId: Number(newUserData.schoolId),
          schoolName: newUserData.institution,
          nivelAcademicoId: newUserData.nivelAcademicoId,
          semestre: 1 // Assuming a default value
        };

        const response = await firstValueFrom(
          this.userService.updateUser(command)
        );

        if(response.isSuccess){
          this.notificacionService.show('Usuario actualizado exitosamente.', 'success');
        }else{
          this.notificacionService.show(response.message, 'error');
        }
      } else {
        const command: CreateParticipanteCommand = {
          pnombre: newUserData.pnombre,
          snombre: newUserData.snombre,
          papellido: newUserData.papellido,
          sapellido: newUserData.sapellido,
          tipoParticipanteId: newUserData.tipoParticipanteId,
          email: newUserData.email,
          telefono: newUserData.telefono,
          fechaNacimiento: newUserData.registrationDate, // Assuming registrationDate is used for fechaNacimiento
          tipoIdentificacionId: 1, // Assuming a default value
          numeroIdentificacion: 'N/A', // Assuming a default value
          schoolId: Number(newUserData.schoolId),
          schoolName: newUserData.institution,
          nivelAcademicoId: newUserData.nivelAcademico,
          semestre: 1, // Assuming a default value
          password: '' // Assuming autogen is used for password
        };
        
        this.loading.set(true);
        const response = await firstValueFrom(
          this.userService.createUser(command)
        );

        if(response.isSuccess){
          this.notificacionService.show('Usuario creado exitosamente.', 'success');
        }else{
          this.notificacionService.show(response.message, 'error');
        }
      }
      
      this.loadUsers();
      
      this.handleCloseModal(); 

    } catch (error) {
      //console.error('Error al guardar el usuario:', error);
      this.notificacionService.show(`Error al guardar el usuario: ${error}`, 'error'); 

    } finally {
      this.isSaving.set(false); 
    }
  }
}