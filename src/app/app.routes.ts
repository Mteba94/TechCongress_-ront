import { Routes } from '@angular/router';
import { Layout } from './pages/layout/layout/layout';
import { Homepage } from './pages/layout/homepage/homepage';
import { LoginRegistration } from './pages/layout/login-registration/login-registration';
import { NotFound } from './pages/not-found/not-found';
import { UserDashboard } from './pages/layout/user-dashboard/user-dashboard';
import { WorkshopActivityCatalog } from './pages/layout/workshop-activity-catalog/workshop-activity-catalog';

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
        path: '**',
        component: NotFound
    }
];
