import { Component, inject, OnInit, signal, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User,
} from '@angular/fire/auth';

import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { PrimeIcons } from 'primeng/api';

@Component({
  selector: 'app-auth-form', 
  standalone: true, 
  imports: [CommonModule, FormsModule, ToastModule, CardModule, ButtonModule, RippleModule], 
  templateUrl: './auth-form.component.html', 
  styleUrls: ['./auth-form.component.scss'],
})

export class AuthFormComponent implements OnInit {
  auth = inject(Auth);
  firestore = inject(Firestore);
  router = inject(Router);
  messageService = inject(MessageService);
  ngZone = inject(NgZone);  //  Inyectamos NgZone
  loading = true;  

  email = '';
  password = '';
  isLogin = true;

  user = signal<User | null>(null);
  rol = signal<string | null>(null);

  userRoles = ['administrador', 'usuario'];
  selectedRol: string = '';

  ngOnInit() {
    //  Envolvemos el callback de Firebase en NgZone para evitar errores de cambio de contexto
    onAuthStateChanged(this.auth, async (user) => {
      this.ngZone.run(async () => {
        this.user.set(user);
        this.loading = false;  // <-- Aquí indica que ya terminó la carga
        if (user) {
          const rol = await this.obtenerRol(user.uid);
          this.rol.set(rol);
        } else {
          this.rol.set(null);
        }
      });
    });
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.selectedRol = '';
  }

  async onSubmit() {
    try {
      if (!this.selectedRol) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Rol requerido',
          detail: 'Por favor, selecciona un rol antes de continuar.',
        });
        return;
      }

      if (this.isLogin) {
        const cred = await signInWithEmailAndPassword(this.auth, this.email, this.password);
        
        const userDoc = await getDoc(doc(this.firestore, 'usuarios', cred.user.uid));
        const datos = userDoc.data();

        if (!datos) {
          this.messageService.add({
            severity: 'error',
            summary: 'Usuario no encontrado',
            detail: 'No se encontró información del usuario en Firestore.',
          });
          await this.auth.signOut();
          return;
        }

        if (datos["estado"] === 'bloqueado') {
          this.messageService.add({
            severity: 'error',
            summary: 'Cuenta bloqueada',
            detail: 'Tu cuenta ha sido bloqueada. No puedes ingresar.',
          });
          await this.auth.signOut();
          return;
        }

        if (datos["rol"] !== this.selectedRol) {
          this.messageService.add({
            severity: 'error',
            summary: 'Rol incorrecto',
            detail: 'El rol no coincide con el registrado.',
          });
          await this.auth.signOut();
          return;
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Bienvenido',
          detail: `Sesión iniciada como ${datos["rol"]}`,
        });

       if (datos["rol"] === 'administrador') {
  this.router.navigate(['/paginas/inicio']);  // ruta admin
} else if (datos["rol"] === 'usuario') {
  this.router.navigate(['/paginas/dashboard']);     // ruta usuario
} else {
  this.messageService.add({
    severity: 'error',
    summary: 'Rol no reconocido',
    detail: 'Tu rol no está autorizado para ingresar.',
  });
  await this.auth.signOut();
  return;
}

      } else {
        const cred = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
        await this.guardarRol(cred.user.uid, this.selectedRol);
        this.messageService.add({
          severity: 'success',
          summary: 'Registrado',
          detail: `Cuenta creada con rol ${this.selectedRol}`,
        });
        
      // ✅ Redirección después del registro según el rol
        if (this.selectedRol === 'administrador') {
          this.router.navigate(['/paginas/inicio']);
        } else if (this.selectedRol === 'usuario') {
          this.router.navigate(['/paginas/dashboard']);
        }
      }

    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Llene los campos correctamente',
      });
    }
  }

  private async guardarRol(uid: string, rol: string) {
    const docRef = doc(this.firestore, 'usuarios', uid);
    await setDoc(docRef, { rol, email: this.email, estado: 'activo' }, { merge: true }); 
  }

  private async obtenerRol(uid: string): Promise<string | null> {
    const docRef = doc(this.firestore, 'usuarios', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data()['rol'] || null;
    }
    return null;
  }
}

