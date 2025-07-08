import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CarritoService, Producto } from '../../services/carrito.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, ToastModule, PaginatorModule],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.scss'],
  providers: [MessageService],
})
export class CatalogoComponent implements OnInit {
  firestore = inject(Firestore);
  carritoService: CarritoService = inject(CarritoService);
  messageService: MessageService = inject(MessageService);

  productos: Producto[] = [];
  productosPaginados: Producto[] = []; 

  ngOnInit() {
    const productosRef = collection(this.firestore, 'productos');
    collectionData(productosRef, { idField: 'id' }).subscribe((data) => {
      console.log('Productos desde Firestore:', data);

      this.productos = data
        .filter((item: any) => item.disponible) // Mostrar solo disponibles
        .map((item: any) => ({
          id: item.id,
          titulo: item.nombre || '',
          descripcion: item.descripcion || '',
          precio: item.precio || 0,
          imagen: item.imagen || '',
        })) as Producto[];

        this.productosPaginados = this.productos.slice(0, 4);
    });
  }

  cambiarPagina(event: any) {
  const inicio = event.first;
  const fin = inicio + event.rows;
  this.productosPaginados = this.productos.slice(inicio, fin);
}

  getRutaImagen(imagen: string): string {
    if (!imagen) return '';
    if (imagen.startsWith('http')) {
      return imagen;
    }
    return 'assets/' + imagen;
  }

  agregarAlCarrito(producto: Producto) {
    this.carritoService.agregarProducto(producto);
    this.messageService.add({
      severity: 'success',
      summary: 'Producto agregado',
      detail: `${producto.titulo} fue añadido al carrito.`,
      life: 3000,
    });
  }
}

