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
  private firestore = inject(Firestore);

  ordenesPorUsuario: { email: string, facturas: any[] }[] = [];
  mostrarDialogo = false;
  facturaSeleccionada: any = null;
  usuarioSeleccionado = '';

  async ngOnInit() {
    // Traer todos los documentos de todas las subcolecciones 'historial'
    const historialSnapshot = await getDocs(collectionGroup(this.firestore, 'historial'));

    // Mapa para agrupar facturas por uid
    const facturasPorUsuario = new Map<string, any[]>();

    // Recorremos cada factura encontrada
    historialSnapshot.docs.forEach(docFactura => {
      const data = docFactura.data();
      const factura = {
        ...data,
        id: docFactura.id,
        fecha: data["fecha"]?.toDate ? formatDate(data["fecha"].toDate(), 'short', 'en-US') : ''
      };

      // Extraer UID del path: 'facturas/{uid}/historial/{facturaId}'
      const pathParts = docFactura.ref.path.split('/');
      const uidIndex = pathParts.indexOf('facturas') + 1;
      const uid = pathParts[uidIndex];

      if (!facturasPorUsuario.has(uid)) {
        facturasPorUsuario.set(uid, []);
      }
      facturasPorUsuario.get(uid)?.push(factura);
    });

    // Ahora buscamos el email de cada usuario y construimos el array final
    for (const [uid, facturas] of facturasPorUsuario.entries()) {
      const usuarioDoc = await getDoc(doc(this.firestore, 'usuarios', uid));
      const email = usuarioDoc.exists() ? usuarioDoc.data()['email'] : '(Sin email)';

      this.ordenesPorUsuario.push({ email, facturas });
    }

    console.log('Órdenes por usuario:', this.ordenesPorUsuario);
  }

  abrirDialogo(factura: any, email: string) {
    this.facturaSeleccionada = factura;
    this.usuarioSeleccionado = email;
    this.mostrarDialogo = true;
  }
}
