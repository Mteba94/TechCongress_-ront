import { Routes } from '@angular/router';
import { Layout } from './pages/layout/layout/layout';
import { Homepage } from './pages/layout/homepage/homepage';
import { LoginRegistration } from './pages/layout/login-registration/login-registration';

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
    }
];
