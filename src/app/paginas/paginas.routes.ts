import { AdminUsuariosComponent } from "./admin-usuarios/admin-usuarios.component";
import { AsignacionProductosComponent } from "./asignacion-productos/asignacion-productos.component";
import { InicioComponent } from "./inicio/inicio.component";
import { ProductosComponent } from "./productos/productos.component";
import { ProyectosComponent } from "./proyectos/proyectos.component";
import { MainComponent } from "../layout/main/main.component";
import { Routes } from "@angular/router";
import { roleGuard } from "../auth/auth/auth.guard"; // asegúrate de importar el guard
import { CatalogoComponent } from "./catalogo/catalogo.component";
import { CarritoComponent } from "./carrito/carrito/carrito.component";
import { FacturaComponent } from "./factura/factura.component";
import { AdminOrdenesComponent } from "./admin-ordenes/admin-ordenes.component";
import { DashboardComponent } from "./dashboard/dashboard.component";

export default [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: 'inicio',
        component: InicioComponent,
        title: 'Inicio',
        canActivate: [roleGuard('administrador')]
        // Todos pueden acceder (admin )
      },
      {
        path: 'admin-usuarios',
        component: AdminUsuariosComponent,
        title: 'Admin de Usuarios',
        canActivate: [roleGuard('administrador')]
      }
      ,
      {
        path: 'productos',
        component: ProductosComponent,
        title: 'Productos',
        canActivate: [roleGuard('administrador')]
      },
      {
        path: 'admin-ordenes',
        component: AdminOrdenesComponent ,
        canActivate: [roleGuard('administrador')]  // restringe el acceso
      },
      {
        path: 'proyectos',
        component: ProyectosComponent,
        title: 'Proyectos',
        canActivate: [roleGuard('administrador')]
      },
      {
        path: 'asignacion',
        component: AsignacionProductosComponent,
        title: 'Asignación',
        canActivate: [roleGuard('administrador')]
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        title: 'Dashboard',
        canActivate: [roleGuard('usuario')]
      },
      {
        path: 'catalogo',
        component: CatalogoComponent,
        title: 'Catalogo',
        canActivate: [roleGuard('usuario')]
      },
      {
        path: 'carrito',
        component: CarritoComponent,
        title: 'Carrito de Compras',
        canActivate: [roleGuard('usuario')]
      },
      {
        path: 'factura',
        component: FacturaComponent,
        title: 'Factura',
        canActivate: [roleGuard('usuario')]
      },
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
      }
    ]
  }
] satisfies Routes;



