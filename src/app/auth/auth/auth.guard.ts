import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firstValueFrom, from } from 'rxjs';

// --- GUARD 1: Verifica si hay un usuario autenticado ---
export const authGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);

  const user = await firstValueFrom(from(
    new Promise(resolve => onAuthStateChanged(auth, resolve))
  ));

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};

// --- GUARD 2: Verifica si el usuario tiene el rol requerido ---
export const roleGuard = (requiredRole: string): CanActivateFn => {
  return async () => {
    const auth = inject(Auth);
    const firestore = inject(Firestore);
    const router = inject(Router);

    const user = auth.currentUser;
    
    if (!user) {
      router.navigate(['/login']);
      return false;
    }

    const userDoc = await getDoc(doc(firestore, 'usuarios', user.uid));
    if (!userDoc.exists()) {
      router.navigate(['/login']);
      return false;
    }

    const rol = userDoc.data()['rol'];
    if (rol === requiredRole) {
      return true;
    } else {
      router.navigate(['/no-autorizado']); // crea esta ruta para mostrar acceso denegado
      return false;
    }
  };
};

