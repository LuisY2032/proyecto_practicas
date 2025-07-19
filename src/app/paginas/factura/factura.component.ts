import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { formatDate } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-factura',
  templateUrl: './factura.component.html',
  styleUrls: ['./factura.component.scss'],
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DialogModule]
})
export class FacturaComponent implements OnInit {
  // Inyectar servicios Firestore y Auth de Firebase
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  facturas: any[] = [];              // Array para almacenar las facturas obtenidas
  facturaSeleccionada: any = null;   // Factura seleccionada para mostrar en diálogo
  mostrarDialogo = false;             // Controla la visibilidad del diálogo modal
  usuarioEmail = '';                 // Email del usuario actual

  async ngOnInit() {
    // Obtener usuario actual autenticado
    const user = this.auth.currentUser;
    if (!user) return; // Si no hay usuario, no hacer nada

    this.usuarioEmail = user.email ?? ''; // Guardar email del usuario para mostrar

    // Referencia a la subcolección 'historial' dentro del documento del usuario en 'facturas'
    const ref = collection(this.firestore, 'facturas', user.uid, 'historial');

    // Obtener documentos de la subcolección 'historial'
    const snapshot = await getDocs(ref);

    // Mapear los documentos para extraer datos y formatear la fecha si existe
    this.facturas = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id, // Agregar ID del documento
        fecha: data["fecha"] && data["fecha"].toDate
          ? formatDate(data["fecha"].toDate(), 'short', 'en-US') // Formatear fecha si es válida
          : ''
      };
    });
  }

  // Método para abrir el diálogo con los detalles de la factura seleccionada
  abrirDialogo(factura: any) {
    this.facturaSeleccionada = factura;
    this.mostrarDialogo = true;
  }
}
