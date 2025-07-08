import { Component, inject, OnInit, signal } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Auth, signOut, User, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MenubarModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent implements OnInit {
  items: MenuItem[] = [];
  auth = inject(Auth);
  firestore = inject(Firestore);
  router = inject(Router);
  user = signal<User | null>(null);
  rol = signal<string | null>(null);

  async ngOnInit() {
    onAuthStateChanged(this.auth, async (usuario) => {
      this.user.set(usuario);

      if (usuario) {
        const ref = doc(this.firestore, 'usuarios', usuario.uid);
        const docSnap = await getDoc(ref);

        if (docSnap.exists()) {
          const rolUsuario = docSnap.data()['rol'];
          this.rol.set(rolUsuario);

          // 🧩 Menú según rol
          if (rolUsuario === 'administrador') {
            this.items = [
              { label: 'Inicio', icon: 'pi pi-home', routerLink: '/paginas/inicio' },
              { label: 'Productos', icon: 'pi pi-shopping-bag', routerLink: '/paginas/productos' },
              { label: 'Ordenes', icon: 'pi pi-shopping-bag', routerLink: '/paginas/admin-ordenes' },
              { label: 'Proyectos', icon: 'pi pi-pen-to-square', routerLink: '/paginas/proyectos' },
              { label: 'Destinatario', icon: 'pi pi-folder-open', routerLink: '/paginas/asignacion' },
              { label: 'Gestion Usuarios', icon: 'pi pi-users', routerLink: '/paginas/admin-usuarios' },
            ];
          } else if (rolUsuario === 'usuario') {
            this.items = [
              { label: 'Inicio', icon: 'pi pi-home', routerLink: '/paginas/inicio' },
              { label: 'Catálogo', icon: 'pi pi-th-large', routerLink: '/paginas/catalogo' },
              { label: 'Carrito', icon: 'pi pi-shopping-cart', routerLink: '/paginas/carrito' },
              { label: 'Factura', icon: 'pi pi-file', routerLink: '/paginas/factura' },
            ];
          }
        }
      }
    });
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  isAuthenticated() {
    return this.user() !== null;
  }
}
