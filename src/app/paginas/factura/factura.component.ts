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
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  facturas: any[] = [];
  facturaSeleccionada: any = null;
  mostrarDialogo = false;
  usuarioEmail = '';


  async ngOnInit() {
    const user = this.auth.currentUser;
    if (!user) return;
    

    
    this.usuarioEmail = user.email ?? '';

    const ref = collection(this.firestore, 'facturas', user.uid, 'historial');
    const snapshot = await getDocs(ref);

    this.facturas = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        fecha: data["fecha"] && data["fecha"].toDate
          ? formatDate(data["fecha"].toDate(), 'short', 'en-US')
          : ''
      };
    });
  }

  abrirDialogo(factura: any) {
    this.facturaSeleccionada = factura;
    this.mostrarDialogo = true;
  }
}
