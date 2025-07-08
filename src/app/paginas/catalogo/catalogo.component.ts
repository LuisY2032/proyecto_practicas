import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CarritoService, Producto } from '../../services/carrito.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule,ToastModule],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.scss'],
  providers: [MessageService] 
})
export class CatalogoComponent implements OnInit {
  firestore = inject(Firestore);
  carritoService: CarritoService = inject(CarritoService); // ✅ correcto
  messageService: MessageService = inject(MessageService);

  


  productos: Producto[] = [];

  ngOnInit() {
  const productosRef = collection(this.firestore, 'productos');
  collectionData(productosRef, { idField: 'id' }).subscribe((data) => {
    this.productos = data.map((item: any) => ({
      id: item.id,
      titulo: item.nombre || '',
      descripcion: item.descripcion || '',
      precio: item.precio || 0,
      imagen: item.imagen || '',
    })) as Producto[];
  });
}


  agregarAlCarrito(producto: Producto) {
    this.carritoService.agregarProducto(producto);
  this.messageService.add({
    severity: 'success',
    summary: 'Producto agregado',
    detail: `${producto.titulo} fue añadido al carrito.`,
    life: 3000
  });
}
}

