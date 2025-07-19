import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collectionGroup, getDocs, doc, getDoc } from '@angular/fire/firestore';
import { formatDate } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-admin-ordenes',
  standalone: true,  
  imports: [CommonModule, TableModule, DialogModule, ButtonModule],  
  templateUrl: './admin-ordenes.component.html',
  styleUrls: ['./admin-ordenes.component.scss']
})
export class AdminOrdenesComponent implements OnInit {
  //  Inyección directa de Firestore
  private firestore = inject(Firestore);

  // Lista final agrupada de órdenes por usuario
  ordenesPorUsuario: { email: string, facturas: any[] }[] = [];

  // Variables de control del diálogo
  mostrarDialogo = false;
  facturaSeleccionada: any = null;
  usuarioSeleccionado = '';

  // Método que se ejecuta al iniciar el componente
  async ngOnInit() {
    //  Consulta todos los documentos de subcolecciones llamadas 'historial'
    const historialSnapshot = await getDocs(collectionGroup(this.firestore, 'historial'));

    // Mapa temporal para agrupar facturas por UID de usuario
    const facturasPorUsuario = new Map<string, any[]>();

    //  Recorremos todas las facturas encontradas
    historialSnapshot.docs.forEach(docFactura => {
      const data = docFactura.data();

      // Formateamos la factura para mostrarla
      const factura = {
        ...data,
        id: docFactura.id,
        fecha: data["fecha"]?.toDate ? formatDate(data["fecha"].toDate(), 'short', 'en-US') : ''
      };

      //  Extraemos el UID desde la ruta: 'facturas/{uid}/historial/{facturaId}'
      const pathParts = docFactura.ref.path.split('/');
      const uidIndex = pathParts.indexOf('facturas') + 1;
      const uid = pathParts[uidIndex];

      // Agrupamos facturas por UID
      if (!facturasPorUsuario.has(uid)) {
        facturasPorUsuario.set(uid, []);
      }
      facturasPorUsuario.get(uid)?.push(factura);
    });

    //  Por cada UID, buscamos su email y armamos el array final
    for (const [uid, facturas] of facturasPorUsuario.entries()) {
      const usuarioDoc = await getDoc(doc(this.firestore, 'usuarios', uid));
      const email = usuarioDoc.exists() ? usuarioDoc.data()['email'] : '(Sin email)';

      // Agregamos al arreglo que será mostrado en el HTML
      this.ordenesPorUsuario.push({ email, facturas });
    }

    // Debug opcional
    console.log('Órdenes por usuario:', this.ordenesPorUsuario);
  }

  // Abre el diálogo y muestra detalles de la factura seleccionada
  abrirDialogo(factura: any, email: string) {
    this.facturaSeleccionada = factura;
    this.usuarioSeleccionado = email;
    this.mostrarDialogo = true;
  }
}
