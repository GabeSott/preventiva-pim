import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'app/dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) 
  },
  { 
    path: 'app/planos', 
    loadComponent: () => import('./pages/planos-list/planos-list.component').then(m => m.PlanosListComponent) 
  },
  { 
    path: 'app/planos/editar/:id', 
    loadComponent: () => import('./pages/planos-form/planos-form.component').then(m => m.PlanosFormComponent) 
  },
  { 
    path: 'app/planos/novo', 
    loadComponent: () => import('./pages/planos-form/planos-form.component').then(m => m.PlanosFormComponent) 
  },
  { 
    path: 'app/planos/:id', 
    loadComponent: () => import('./pages/planos-detail/planos-detail.component').then(m => m.PlanosDetailComponent) 
  },
  { 
    path: 'app/planos/execucoes/nova', 
    loadComponent: () => import('./pages/execucao-form/execucao-form.component').then(m => m.ExecucaoFormComponent) 
  },
  { 
    path: 'app/calendario', 
    loadComponent: () => import('./pages/calendario/calendario.component').then(m => m.CalendarioComponent) 
  },
  { 
    path: 'app/equipamentos', 
    loadComponent: () => import('./pages/equipamentos-list/equipamentos-list.component').then(m => m.EquipamentosListComponent) 
  },
  { 
    path: 'app/equipamentos/novo', 
    loadComponent: () => import('./pages/equipamentos-form/equipamentos-form.component').then(m => m.EquipamentosFormComponent) 
  },
  { 
    path: 'app/equipamentos/editar/:id', 
    loadComponent: () => import('./pages/equipamentos-form/equipamentos-form.component').then(m => m.EquipamentosFormComponent) 
  },
  { 
    path: 'app/usuarios', 
    loadComponent: () => import('./pages/usuarios-list/usuarios-list.component').then(m => m.UsuariosListComponent) 
  },
  { 
    path: 'app/usuarios/novo', 
    loadComponent: () => import('./pages/usuarios-form/usuarios-form.component').then(m => m.UsuariosFormComponent) 
  },
  { 
    path: 'app/usuarios/editar/:id', 
    loadComponent: () => import('./pages/usuarios-form/usuarios-form.component').then(m => m.UsuariosFormComponent) 
  },
  { path: '**', redirectTo: 'app/dashboard' } 
];