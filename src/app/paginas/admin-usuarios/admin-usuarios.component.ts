import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData, docData, getDocs } from '@angular/fire/firestore';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
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
  firestore = inject(Firestore);
  messageService = inject(MessageService);

  usuarios: any[] = [];

  ngOnInit() {
    const usuariosRef = collection(this.firestore, 'usuarios');
    collectionData(usuariosRef, { idField: 'uid' }).subscribe(data => {
      this.usuarios = data;
    });
  }

  async actualizarRol(usuario: any) {
    const usuarioRef = doc(this.firestore, 'usuarios', usuario.uid);
    await updateDoc(usuarioRef, { rol: usuario.rol });
    this.messageService.add({
      severity: 'success',
      summary: 'Rol actualizado',
      detail: `Nuevo rol: ${usuario.rol}`,
    });
  }

  async cambiarEstado(usuario: any) {
    const nuevoEstado = usuario.estado === 'activo' ? 'bloqueado' : 'activo';
    const usuarioRef = doc(this.firestore, 'usuarios', usuario.uid);
    await updateDoc(usuarioRef, { estado: nuevoEstado });
    this.messageService.add({
      severity: 'success',
      summary: 'Estado actualizado',
      detail: `Usuario ${usuario.email} ahora está ${nuevoEstado}`
    });
  }

  async eliminarUsuario(uid: string) {
    const usuarioRef = doc(this.firestore, 'usuarios', uid);
    await deleteDoc(usuarioRef);
    this.messageService.add({
      severity: 'warn',
      summary: 'Usuario eliminado',
      detail: `Usuario con UID ${uid} eliminado.`
    });
  }
}

