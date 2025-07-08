import { Routes } from '@angular/router';
import { AuthFormComponent } from './auth-form/auth-form.component';
import { authGuard,roleGuard } from './auth/auth/auth.guard';
import { NotFoundComponent } from './common/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',   
    pathMatch: 'full'      // Coincidencia completa para evitar redirecciones parciales
  },
  {
    path: 'login',
    component: AuthFormComponent  
  },
  {
    path:'not-found',
    component: NotFoundComponent   // Componente para mostrar página 404 cuando la ruta no existe
  },
  {
    path: 'paginas',
    canActivate: [authGuard],     // Guard que protege esta ruta
    // El guard 'authGuard' verifica si el usuario está autenticado
    // Si no está autenticado, bloquea el acceso 
    // Si está autenticado, permite acceder a esta ruta y sus hijos (lazy loading)
    loadChildren: () => import('./paginas/paginas.routes').then(m => m.default) 
  },
  {
  path: 'no-autorizado',
  loadComponent: () =>
    import('./unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '**',
    redirectTo: 'not-found'     
  }
];

