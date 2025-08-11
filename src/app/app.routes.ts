import { Routes } from '@angular/router';
import { Layout } from './pages/layout/layout/layout';
import { Homepage } from './pages/layout/homepage/homepage';

export const routes: Routes = [
    {
        path: '',
        component: Homepage
    }
];
