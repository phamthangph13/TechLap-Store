import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'order-placement',
        loadChildren: () => import('./features/order-placement/order-placement.module').then(m => m.OrderPlacementModule)
      },
      {
        path: 'contact-management',
        loadChildren: () => import('./features/contact-management/contact-management.module').then(m => m.ContactManagementModule)
      },
      {
        path: 'category-management',
        loadChildren: () => import('./features/category-management/category-management.module').then(m => m.CategoryManagementModule)
      },
      {
        path: 'product-management',
        loadChildren: () => import('./features/product-management/product-management.module').then(m => m.ProductManagementModule)
      },
      {
        path: 'revenue-report',
        loadChildren: () => import('./features/revenue-report/revenue-report.module').then(m => m.RevenueReportModule)
      },
      {
        path: 'product-report',
        loadChildren: () => import('./features/product-report/product-report.module').then(m => m.ProductReportModule)
      },
      { path: '', redirectTo: 'order-placement', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
