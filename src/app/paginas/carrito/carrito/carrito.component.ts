import { Component, OnInit, inject } from '@angular/core';
// Importamos el servicio del carrito y la interfaz Producto (ajusta ruta si es necesario)
import { CarritoService, Producto } from '../../../services/carrito.service'; 
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, ToastModule], // Importamos módulos PrimeNG y CommonModule
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.scss'],
  providers: [MessageService] // Proveedor para mostrar mensajes tipo toast
})
export class CarritoComponent implements OnInit {
  
  // Inyectamos el servicio de carrito para manejar productos y la lógica de compra
  private carritoService: CarritoService = inject(CarritoService);
  // Inyectamos MessageService para mostrar notificaciones
  private messageService = inject(MessageService);

  productos: Producto[] = [];  // Array para almacenar los productos en el carrito
  total = 0;                   // Variable para almacenar el total a pagar

  ngOnInit() {
    // Nos suscribimos al observable carrito$ para recibir cambios en el carrito en tiempo real
    this.carritoService.carrito$.subscribe((productos: Producto[]) => {
      this.productos = productos;                    // Actualizamos productos con los que vienen del servicio
      this.total = this.carritoService.obtenerTotal(); // Calculamos el total actual del carrito
    });
  }

  // Método para realizar la compra
  async comprar() {
    // Validamos que el carrito no esté vacío
    if (this.productos.length === 0) {
      // Mostramos mensaje de advertencia si no hay productos
      this.messageService.add({
        severity: 'warn',
        summary: 'Carrito vacío',
        detail: 'No hay productos para comprar.'
      });
      console.log('Carrito vacío, no se puede comprar');
      return; // Salimos para evitar continuar con la compra
    }

    console.log('Iniciando realizarCompra desde componente...');
    try {
      // Llamamos al método del servicio para procesar la compra
      await this.carritoService.realizarCompra();
      console.log('realizarCompra completado');
      // Mensaje de éxito al usuario
      this.messageService.add({
        severity: 'success',
        summary: 'Compra realizada',
        detail: 'Tu factura ha sido generada exitosamente'
      });
    } catch (error) {
      // En caso de error, mostramos mensaje y lo logueamos en consola
      console.error('Error en realizarCompra:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo realizar la compra. Revisa consola.'
      });
    }
  }

  // Método para obtener la ruta completa de la imagen del producto
  getRutaImagen(imagen: string): string {
    if (!imagen) return '';  // Si no hay imagen, regresamos cadena vacía
    // Si la imagen ya es una URL absoluta (empieza con http), la retornamos tal cual
    // Si no, asumimos que está en la carpeta assets local
    return imagen.startsWith('http') ? imagen : 'assets/' + imagen;
  }

  // Método para vaciar todo el carrito
  async vaciarCarrito() {
    await this.carritoService.vaciarCarrito();  // Llamamos al servicio para limpiar carrito
    // Mostramos mensaje informativo
    this.messageService.add({
      severity: 'info',
      summary: 'Carrito vacío',
      detail: 'El carrito ha sido vaciado'
    });
  }

  // Método para eliminar un producto específico del carrito por su id
  async eliminar(id: string) {
    await this.carritoService.eliminarProducto(id); // Eliminamos el producto usando el servicio
    // Mostramos mensaje informativo de eliminación
    this.messageService.add({
      severity: 'info',
      summary: 'Producto eliminado',
      detail: 'Producto eliminado del carrito'
    });
  }
}
