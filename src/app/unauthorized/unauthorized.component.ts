import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-no-autorizado',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss'],
})


export class UnauthorizedComponent implements OnInit {
  // Inyección del servicio Router para controlar la navegación entre páginas
  private router = inject(Router);
  // Inyección del servicio de autenticación Firebase para obtener el usuario actual
  private auth = inject(Auth);
  // Inyección del servicio Firestore para acceder a la base de datos de usuarios
  private firestore = inject(Firestore);

  // Variable que almacena el rol del usuario autenticado, inicialmente null
  rol: string | null = null;

  // Método que se ejecuta al inicializar el componente
  async ngOnInit() {
    // Obtiene el usuario actualmente autenticado
    const user = this.auth.currentUser;
    if (user) {
      // Si existe un usuario, obtiene referencia al documento Firestore correspondiente
      const docRef = doc(this.firestore, 'usuarios', user.uid);
      // Obtiene los datos del documento de forma asíncrona
      const snapshot = await getDoc(docRef);
      // Extrae los datos del usuario
      const data = snapshot.data();
      // Asigna el rol encontrado en la base de datos o null si no existe
      this.rol = data?.["rol"] || null;
    }
  }

  // Método que se llama para regresar o redirigir al usuario según su rol
  regresar() {
    if (this.rol === 'administrador') {
      // Si es administrador, navega a la página de inicio o admin
      this.router.navigate(['/paginas/inicio']);
    } else {
      // Si no es administrador, navega al dashboard del usuario final
      this.router.navigate(['/paginas/dashboard']);
    }
  }
}

