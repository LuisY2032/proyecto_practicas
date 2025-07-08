import { Component, OnInit, inject } from '@angular/core';
import { CarritoService,Producto } from '../../../services/carrito.service';// Ajusta ruta si hace falta
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, ToastModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.scss'],
  providers: [MessageService]
})
export class CarritoComponent implements OnInit {
  private carritoService: CarritoService = inject(CarritoService);
  private messageService = inject(MessageService);

  productos: Producto[] = [];
  total = 0;

  ngOnInit() {
    this.carritoService.carrito$.subscribe((productos: Producto[]) => {
      this.productos = productos;
      this.total = this.carritoService.obtenerTotal();
    });
  }

  async comprar() {
    if (this.productos.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Carrito vacío',
        detail: 'No hay productos para comprar.'
      });
      console.log('Carrito vacío, no se puede comprar');
      return;
    }

    console.log('Iniciando realizarCompra desde componente...');
    try {
      await this.carritoService.realizarCompra();
      console.log('realizarCompra completado');
      this.messageService.add({
        severity: 'success',
        summary: 'Compra realizada',
        detail: 'Tu factura ha sido generada exitosamente'
      });
    } catch (error) {
      console.error('Error en realizarCompra:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo realizar la compra. Revisa consola.'
      });
    }
  }

  async vaciarCarrito() {
    await this.carritoService.vaciarCarrito();
    this.messageService.add({
      severity: 'info',
      summary: 'Carrito vacío',
      detail: 'El carrito ha sido vaciado'
    });
  }

  async eliminar(id: string) {
    await this.carritoService.eliminarProducto(id);
    this.messageService.add({
      severity: 'info',
      summary: 'Producto eliminado',
      detail: 'Producto eliminado del carrito'
    });
  }
}

