import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {providePrimeNG} from 'primeng/config';
import { routes } from './app.routes';
import {definePreset} from '@primeng/themes';
import Theme from '@primeng/themes/material';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideHttpClient } from '@angular/common/http';


const MyPreset = definePreset(Theme);

const firebaseConfig = {
  apiKey: "AIzaSyBuKfk_PFvYHgpIifflxytv2ZUtaTN1Mao",
  authDomain: "yumbo-b4048.firebaseapp.com",
  projectId: "yumbo-b4048",
  storageBucket: "yumbo-b4048.firebasestorage.app",
  messagingSenderId: "1019721207520",
  appId: "1:1019721207520:web:25050d843cef56ff574a85",
  measurementId: "G-4GGX4FP04G"
};

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes, withComponentInputBinding()),

    provideAnimationsAsync(),

    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: '.app-dark'
        }
      }
    }),

provideHttpClient(), 
// Provee el cliente HTTP para hacer peticiones HTTP en Angular (HttpClientModule).

provideFirebaseApp(() => initializeApp(firebaseConfig)), 
// Inicializa la aplicación Firebase usando la configuración firebaseConfig.
// Esto conecta tu app Angular con tu proyecto Firebase.

provideAuth(() => getAuth()), 
// Provee el servicio de autenticación de Firebase para manejar login, registro, etc.

provideFirestore(() => getFirestore()), 
// Provee el servicio Firestore para manejar la base de datos NoSQL en tiempo real.


]
}
