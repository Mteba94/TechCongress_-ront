import { Routes } from '@angular/router';
import { Layout } from './pages/layout/layout/layout';
import { Homepage } from './pages/layout/homepage/homepage';
import { LoginRegistration } from './pages/layout/login-registration/login-registration';
import { NotFound } from './pages/not-found/not-found';
import { UserDashboard } from './pages/layout/user-dashboard/user-dashboard';
import { WorkshopActivityCatalog } from './pages/layout/workshop-activity-catalog/workshop-activity-catalog';
import { AdminDashboard } from './pages/layout/admin-dashboard/admin-dashboard';
import { UserManagementSystem } from './pages/layout/user-management-system/user-management-system';
import { UserSettingsProfileManagement } from './pages/layout/user-settings-profile-management/user-settings-profile-management';
import { ActivitiesWorkshopManagement } from './pages/layout/activities-workshop-management/activities-workshop-management';
import { CongressAgendaMaintenance } from './pages/layout/congress-agenda-maintenance/congress-agenda-maintenance';

export const routes: Routes = [
    {
        path: '',
        component: Homepage
    },
    {
        path: 'congress-homepage',
        component: Homepage
    },
    {
        path: 'login-registration',
        component: LoginRegistration
    },
    {
        path:'user-dashboard',
        loadComponent: () => import('./pages/layout/user-dashboard/user-dashboard').then(m => m.UserDashboard)
    },
    {
        path: 'workshop-activity-catalog',
        loadComponent: () => import('./pages/layout/workshop-activity-catalog/workshop-activity-catalog').then(m => m.WorkshopActivityCatalog)
    },
    {
        path: 'admin-dashboard',
        loadComponent: () => import('./pages/layout/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard)
    },
    {
        path: 'user-management-system',
        loadComponent: () => import('./pages/layout/user-management-system/user-management-system').then(m => m.UserManagementSystem)
    },
    {
        path: 'user-settings-profile-management',
        loadComponent: () => import('./pages/layout/user-settings-profile-management/user-settings-profile-management').then(m => m.UserSettingsProfileManagement)
    },
    {
        path: 'activities-workshop-management',
        loadComponent: () => import('./pages/layout/activities-workshop-management/activities-workshop-management').then(m => m.ActivitiesWorkshopManagement)
    },
    {
        path: 'congress-agenda-maintenance',
        loadComponent: () => import('./pages/layout/congress-agenda-maintenance/congress-agenda-maintenance').then(m => m.CongressAgendaMaintenance)
    },
    {
        path: '**',
        component: NotFound
    }
];
