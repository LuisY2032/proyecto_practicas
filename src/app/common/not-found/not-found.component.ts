import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  private router = inject(Router);
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private messageService = inject(MessageService);

  async linkHome() {
  const currentUser = this.auth.currentUser;

  if (!currentUser) {
    // 🔁 Redirigir directamente al login
    this.router.navigateByUrl('/login');
    return;
  }

  const userDoc = await getDoc(doc(this.firestore, 'usuarios', currentUser.uid));
  const datos = userDoc.data();

  if (!datos) {
    this.messageService.add({
      severity: 'error',
      summary: 'Usuario no encontrado',
      detail: 'No se encontró el usuario en Firestore',
    });
    return;
  }

  const rol = datos['rol'];

  if (rol === 'administrador') {
    this.router.navigateByUrl('/paginas/inicio');
  } else if (rol === 'usuario') {
    this.router.navigateByUrl('/paginas/dashboard');
  } else {
    this.messageService.add({
      severity: 'warn',
      summary: 'Rol desconocido',
      detail: 'No se pudo redirigir por rol desconocido',
    });
  }
}
}