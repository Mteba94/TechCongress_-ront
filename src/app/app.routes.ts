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
        component: UserDashboard
    },
    {
        path: 'workshop-activity-catalog',
        component: WorkshopActivityCatalog
    },
    {
        path: 'admin-dashboard',
        component: AdminDashboard
    },
    {
        path: 'user-management-system',
        component: UserManagementSystem
    },
    {
        path: 'user-settings-profile-management',
        component: UserSettingsProfileManagement
    },
    {
        path: 'activities-workshop-management',
        component: ActivitiesWorkshopManagement
    },
    {
        path: '**',
        component: NotFound
    }
];
