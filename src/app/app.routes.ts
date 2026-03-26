import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { MenuItems } from './components/menu-items/menu-items';
import { Orders } from './components/orders/orders';
import { Customers } from './components/customers/customers';
import { Analytics } from './components/analytics/analytics';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'menu-items', component: MenuItems },
  { path: 'orders', component: Orders },
  { path: 'customers', component: Customers },
  { path: 'analytics', component: Analytics },
  { path: '**', redirectTo: 'dashboard' },
];
