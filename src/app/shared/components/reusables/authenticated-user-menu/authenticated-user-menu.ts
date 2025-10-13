import { CommonModule, NgClass } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ChevronDown, LogOut, LucideAngularModule, Settings, User } from 'lucide-angular';

interface UserData {
  name: string;
  email: string;
  role?: string;
}

interface MenuItem {
  label: string;
  path: string;
  icon: any;
}

@Component({
  selector: 'app-authenticated-user-menu',
  imports: [
    LucideAngularModule,
    NgClass,
    CommonModule
  ],
  templateUrl: './authenticated-user-menu.html',
  styleUrl: './authenticated-user-menu.css'
})
export class AuthenticatedUserMenu {
  @Input() user: UserData | null = null;

  // Output to emit the logout event
  @Output() logout = new EventEmitter<void>();

  public isOpen: boolean = false;

  // Lucide icons
  public icons = {
    user: User,
    logOut: LogOut,
    chevronDown: ChevronDown,
    settings: Settings
  };

  // Menu items list
  public menuItems: MenuItem[] = [
    {
      label: 'Mi Panel',
      path: '/user-dashboard',
      icon: User
    },
    {
      label: 'Configuración',
      path: '/user-settings-profile-management',
      icon: Settings
    }
  ];

  constructor(private router: Router) {  }

  // Closes the menu when a click occurs outside the component
  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.isInside(event)) {
      this.isOpen = false;
    }
  }

  /**
   * Toggles the menu visibility.
   */
  toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  /**
   * Handles navigation and closes the menu.
   * @param path The path to navigate to.
   */
  handleNavigation(path: string): void {
    this.router.navigate([path]);
    this.isOpen = false;
  }

  /**
   * Emits the logout event and closes the menu.
   */
  handleLogout(): void {
    this.logout.emit();
    this.isOpen = false;
  }

  /**
   * Checks if the click event occurred inside the component.
   * @param event The click event.
   * @returns A boolean indicating if the click was inside.
   */
  private isInside(event: Event): boolean {
    const componentElement = document.getElementById('user-menu-button')?.parentElement;
    return componentElement ? componentElement.contains(event.target as Node) : false;
  }

  ngOnDestroy(): void {
    // No manual cleanup needed for @HostListener
  }
}
