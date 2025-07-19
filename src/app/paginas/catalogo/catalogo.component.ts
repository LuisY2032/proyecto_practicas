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
  // Inyecta Firestore para leer datos
  firestore = inject(Firestore);

  // Servicio carrito para agregar productos
  carritoService: CarritoService = inject(CarritoService);

  // Servicio para mostrar mensajes toast
  messageService: MessageService = inject(MessageService);

  // Arreglo con todos los productos obtenidos de Firestore
  productos: Producto[] = [];

  // Arreglo con los productos que se muestran en la página actual (paginación)
  productosPaginados: Producto[] = [];

  // Se ejecuta al iniciar el componente
  ngOnInit() {
    // Referencia a la colección 'productos' en Firestore
    const productosRef = collection(this.firestore, 'productos');

    // Suscripción para obtener los datos en tiempo real
    collectionData(productosRef, { idField: 'id' }).subscribe((data) => {
      console.log('Productos desde Firestore:', data);

      // Filtra solo productos disponibles y mapea para ajustarlos al interfaz Producto
      this.productos = data
        .filter((item: any) => item.disponible) // solo disponibles
        .map((item: any) => ({
          id: item.id,
          titulo: item.nombre || '',
          descripcion: item.descripcion || '',
          precio: item.precio || 0,
          imagen: item.imagen || '',
        })) as Producto[];

      // Inicializa productos paginados con los primeros 4 productos
      this.productosPaginados = this.productos.slice(0, 4);
    });
  }

  // Método para manejar el cambio de página en el paginador
  cambiarPagina(event: any) {
    const inicio = event.first;          // índice del primer producto de la página
    const fin = inicio + event.rows;     // índice final basado en cantidad por página
    // Actualiza los productos que se mostrarán en esta página
    this.productosPaginados = this.productos.slice(inicio, fin);
  }

  // Método para obtener la ruta completa de la imagen
  getRutaImagen(imagen: string): string {
    if (!imagen) return '';               // Si no hay imagen, retorna vacío
    if (imagen.startsWith('http')) {     // Si la URL es externa, la retorna tal cual
      return imagen;
    }
    // Si es una imagen local, le agrega la carpeta assets/
    return 'assets/' + imagen;
  }

  // Método para agregar un producto al carrito usando el servicio
  agregarAlCarrito(producto: Producto) {
    this.carritoService.agregarProducto(producto); // agrega producto al carrito

    // Muestra mensaje tipo toast confirmando la acción
    this.messageService.add({
      severity: 'success',
      summary: 'Producto agregado',
      detail: `${producto.titulo} fue añadido al carrito.`,
      life: 3000,    // Duración del mensaje en ms
    });
  }
}


