import { Component, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Proyecto, ProductoAsignado } from '../../interfaces/proyecto.interface';
import { Producto } from '../../interfaces/producto.interface';
import { AsignacionService } from '../../services/asignacion.service';
import { MessageService } from 'primeng/api';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-asignacion-productos',
  standalone: true,
  imports: [
    DropdownModule,
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputNumberModule,
    CardModule
  ],
  templateUrl: './asignacion-productos.component.html',
  styleUrls: ['./asignacion-productos.component.scss'],
  providers: [MessageService, CurrencyPipe]
})
export class AsignacionProductosComponent {

  private firestore: Firestore = inject(Firestore);

  proyectos: Proyecto[] = [];
  productos: Producto[] = [];

  proyectoSeleccionado: Proyecto | null = null;
  productosSeleccionados: ProductoAsignado[] = [];
  

  productoParaAgregar: {
    producto: Producto | null;
    cantidad: number;
    precioUnitario: number;
  } = {
    producto: null,
    cantidad: 1,
    precioUnitario: 0
  };

  constructor(private asignacionService: AsignacionService, private messageService: MessageService, private currencyPipe: CurrencyPipe) {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.asignacionService.getProyectos().subscribe(data => {
      this.proyectos = data;
    });
    this.asignacionService.getProductos().subscribe(data => {
      this.productos = data;
    });
  }

  seleccionarProyecto(proyecto: Proyecto) {
    if (proyecto) {
      this.proyectoSeleccionado = proyecto;
      this.productosSeleccionados = proyecto.productosAsignados ?? [];
    }
  }

  agregarProducto() {
    const { producto, cantidad, precioUnitario } = this.productoParaAgregar;
    if (!producto) return;

    const nuevoTotal = this.calcularTotal() + cantidad * precioUnitario;
    const presupuesto = this.proyectoSeleccionado?.presupuesto || 0;

    if (nuevoTotal > presupuesto) {
      this.messageService.add({
        severity: 'error',
        summary: 'Presupuesto Excedido',
         detail: `No puedes agregar este producto porque excede el presupuesto en ${this.currencyPipe.transform(nuevoTotal - presupuesto, 'USD')}`
      });
      return;
    }

    const nuevoProducto: ProductoAsignado = {
      ...producto,
      cantidad,
      precioUnitario,
      total: cantidad * precioUnitario
    };

    this.productosSeleccionados.push(nuevoProducto);
    this.actualizarProyecto();
    this.productoParaAgregar = { producto: null, cantidad: 1, precioUnitario: 0 };
  }

  eliminarProducto(index: number) {
    if (index >= 0 && index < this.productosSeleccionados.length) {
      this.productosSeleccionados.splice(index, 1);
      this.actualizarProyecto();
    }
  }

  async actualizarProyecto(): Promise<void> {
    if (!this.proyectoSeleccionado) return;
    await this.asignacionService.actualizarProyecto(
      this.proyectoSeleccionado?.id || '',
      { productosAsignados: this.productosSeleccionados }
    );
  }

  calcularTotal(): number {
    return this.productosSeleccionados.reduce((sum, item) => sum + item.total, 0);
  }

  getEstadoPresupuesto() {
    if (!this.proyectoSeleccionado) return null;

    const presupuesto = this.proyectoSeleccionado.presupuesto || 0;
    const totalAsignado = this.calcularTotal();

    if (totalAsignado > presupuesto) {
      return {
        estado: 'excedido',
        diferencia: totalAsignado - presupuesto
      };
    } else if (totalAsignado === presupuesto) {
      return {
        estado: 'justo',
        diferencia: 0
      };
    } else {
      return {
        estado: 'sobrante',
        diferencia: presupuesto - totalAsignado
      };
    }
  }
}

