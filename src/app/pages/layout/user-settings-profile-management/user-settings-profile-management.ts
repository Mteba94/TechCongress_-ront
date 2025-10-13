import { Component, computed, signal } from '@angular/core';
import { User } from '../../user-management-system/models/userResp.interface';
import { Header } from '../../../shared/components/layout/header/header';
import { Breadcrumbs } from '../../../shared/components/reusables/breadcrumbs/breadcrumbs';
import { AlertTriangle, Crown, LucideAngularModule } from 'lucide-angular';
import { Button } from '../../../shared/components/reusables/button/button';

@Component({
  selector: 'app-user-settings-profile-management',
  imports: [
    Header,
    Breadcrumbs,
    LucideAngularModule,
    Button
  ],
  templateUrl: './user-settings-profile-management.html',
  styleUrl: './user-settings-profile-management.css'
})
export class UserSettingsProfileManagement {
  user = signal<User | null>(null);
  activeTab = signal<string>('profile');
  hasUnsavedChanges = signal<boolean>(false);
  isLoading = signal<boolean>(true);
  isLoadingSave = signal<boolean>(false);
  showSidebar = signal<boolean>(false);
  //confirmModal = signal<ConfirmModalState>({ open: false, nextTabId: null });

  readonly icons = {
    crown: Crown,
    alertTriangle: AlertTriangle
  }

  // --- Propiedades Derivadas (Computed) ---
  // settingsTabs: SettingTab[] = [
  //   { id: 'profile', label: 'Gestión de Perfil', icon: 'User', description: 'Información personal, foto, datos institucionales' },
  //   { id: 'preferences', label: 'Preferencias', icon: 'Settings', description: 'Idioma, zona horaria, frecuencia de emails' },
  //   { id: 'security', label: 'Configuración de Seguridad', icon: 'Shield', description: 'Contraseña, autenticación de doble factor' },
  //   { id: 'notifications', label: 'Notificaciones', icon: 'Bell', description: 'Alertas por email, notificaciones push' }
  // ];

  // Computed for dynamic header
  activeTabInfo = computed(() => {
    //return this.settingsTabs.find(tab => tab.id === this.activeTab()) || this.settingsTabs[0];
  });

  //activeTabLabel = computed(() => this.activeTabInfo().label);
  //activeTabDescription = computed(() => this.activeTabInfo().description);

  // Expose the SVG utility function to the template
  //getIconSvg = getIconSvg;

  // --- Ciclo de Vida y Inicialización ---
  ngOnInit(): void {
    // Simulación de useEffect para cargar datos y autenticación
    setTimeout(() => {
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          this.user.set(JSON.parse(userData));
        } catch (e) {
          console.error("Error parsing user data from localStorage:", e);
          // Redirect simulation
          // window.location.href = '/login-registration';
        }
      } else {
        // Simular redirección si no hay datos de usuario
        // window.location.href = '/login-registration';
        this.user.set(null); // Set to null to show fallback message
      }
      this.isLoading.set(false);
    }, 500); // Simular una pequeña latencia de carga
  }

  // --- Métodos de Control ---

  toggleSidebar(): void {
    this.showSidebar.update(current => !current);
  }

  setUnsavedChanges(value: boolean): void {
    this.hasUnsavedChanges.set(value);
  }

  handleTabChange(tabId: string): void {
    if (this.hasUnsavedChanges()) {
      // Abrir el modal de confirmación en lugar de usar window.confirm()
      //this.confirmModal.set({ open: true, nextTabId: tabId });
    } else {
      this.setActiveTab(tabId);
    }
  }

  setActiveTab(tabId: string): void {
    this.activeTab.set(tabId);
    this.showSidebar.set(false);
    this.hasUnsavedChanges.set(false);
  }

  // Métodos del Modal de Confirmación
  confirmTabChange(): void {
    //const nextTabId = this.confirmModal().nextTabId;
    // if (nextTabId) {
    //   this.setActiveTab(nextTabId);
    // }
    // this.confirmModal.set({ open: false, nextTabId: null });
  }

  cancelTabChange(): void {
    // this.confirmModal.set({ open: false, nextTabId: null });
  }

  handleSaveChanges(): void {
    if (!this.hasUnsavedChanges()) return;

    this.isLoadingSave.set(true);
    // Simular llamada a API
    new Promise(resolve => setTimeout(resolve, 1500))
      .then(() => {
        this.hasUnsavedChanges.set(false);
        // Aquí se mostraría un toast o mensaje de éxito
        console.log('Cambios guardados con éxito!');
      })
      .catch(error => {
        console.error('Error saving changes:', error);
        // Aquí se mostraría un mensaje de error
      })
      .finally(() => {
        this.isLoadingSave.set(false);
      });
  }
}
