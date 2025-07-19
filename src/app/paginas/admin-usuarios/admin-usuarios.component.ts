import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';  
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';         // Servicio para mostrar mensajes tipo toast
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,  
  imports: [CommonModule, TableModule, ButtonModule, ToastModule, FormsModule],  
  templateUrl: './admin-usuarios.component.html',
  styleUrls: ['./admin-usuarios.component.scss'],
  providers: [MessageService]  
})
export class AdminUsuariosComponent implements OnInit {
  firestore = inject(Firestore);             //  Inyección de Firestore
  messageService = inject(MessageService);   // Inyección del servicio para mensajes

  usuarios: any[] = [];  // Arreglo para almacenar los usuarios cargados desde Firestore

  //  Método que se ejecuta al iniciar el componente
  ngOnInit() {
    const usuariosRef = collection(this.firestore, 'usuarios');  // Referencia a la colección 'usuarios'
    
    //  Obtiene los usuarios en tiempo real y agrega el 'uid' como campo
    collectionData(usuariosRef, { idField: 'uid' }).subscribe(data => {
      this.usuarios = data;
    });
  }

  //  Actualiza el rol del usuario en Firestore
  async actualizarRol(usuario: any) {
    const usuarioRef = doc(this.firestore, 'usuarios', usuario.uid);
    await updateDoc(usuarioRef, { rol: usuario.rol });

    // Muestra mensaje de éxito
    this.messageService.add({
      severity: 'success',
      summary: 'Rol actualizado',
      detail: `Nuevo rol: ${usuario.rol}`,
    });
  }

  //  Cambia el estado entre 'activo' y 'bloqueado'
  async cambiarEstado(usuario: any) {
    const nuevoEstado = usuario.estado === 'activo' ? 'bloqueado' : 'activo';
    const usuarioRef = doc(this.firestore, 'usuarios', usuario.uid);
    await updateDoc(usuarioRef, { estado: nuevoEstado });

    //  Muestra mensaje de éxito
    this.messageService.add({
      severity: 'success',
      summary: 'Estado actualizado',
      detail: `Usuario ${usuario.email} ahora está ${nuevoEstado}`
    });
  }

  // Elimina completamente al usuario de Firestore
  async eliminarUsuario(uid: string) {
    const usuarioRef = doc(this.firestore, 'usuarios', uid);
    await deleteDoc(usuarioRef);

    //  Muestra mensaje de advertencia
    this.messageService.add({
      severity: 'warn',
      summary: 'Usuario eliminado',
      detail: `Usuario con UID ${uid} eliminado.`
    });
  }
}


