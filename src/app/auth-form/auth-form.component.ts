import { Component, inject, OnInit, signal } from '@angular/core';
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

  email = '';
  password = '';
  isLogin = true;

  user = signal<User | null>(null);
  rol = signal<string | null>(null);

  userRoles = ['administrador', 'usuario'];
  selectedRol: string = '';

  ngOnInit() {
    onAuthStateChanged(this.auth, async (user) => {
      this.user.set(user);
      if (user) {
        const rol = await this.obtenerRol(user.uid);
        this.rol.set(rol);
        
      } else {
        this.rol.set(null);
      }
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
        
        // Obtener datos del usuario en Firestore
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

        // Validar estado activo
        if (datos["estado"] === 'bloqueado') {
          this.messageService.add({
            severity: 'error',
            summary: 'Cuenta bloqueada',
            detail: 'Tu cuenta ha sido bloqueada. No puedes ingresar.',
          });
          await this.auth.signOut();
          return;
        }

        // Validar rol
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
        this.router.navigate(['/paginas/inicio']);
      } else {
        const cred = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
        await this.guardarRol(cred.user.uid, this.selectedRol);
        this.messageService.add({
          severity: 'success',
          summary: 'Registrado',
          detail: `Cuenta creada con rol ${this.selectedRol}`,
        });
      }

      this.router.navigate(['../paginas/inicio']);
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
    // Guardamos también estado 'activo' al crear usuario
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

