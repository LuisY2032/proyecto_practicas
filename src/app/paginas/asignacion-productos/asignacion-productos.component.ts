// Importaciones necesarias de Angular, Firebase, PrimeNG, servicios y modelos
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
  selector: 'app-asignacion-productos', // Selector para usar el componente
  standalone: true, // El componente es independiente (sin módulo externo)
  imports: [ // Módulos necesarios para la plantilla HTML
    DropdownModule,
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputNumberModule,
    CardModule
  ],
  templateUrl: './asignacion-productos.component.html', // Plantilla HTML
  styleUrls: ['./asignacion-productos.component.scss'], // Estilos
  providers: [MessageService, CurrencyPipe] // Proveedores necesarios
})
export class AsignacionProductosComponent {

  // Inyección directa de Firestore (opcional si no se usa directamente)
  private firestore: Firestore = inject(Firestore);

  // Listas de proyectos y productos
  proyectos: Proyecto[] = [];
  productos: Producto[] = [];

  // Proyecto actualmente seleccionado
  proyectoSeleccionado: Proyecto | null = null;

  // Productos asignados al proyecto
  productosSeleccionados: ProductoAsignado[] = [];

  // Objeto temporal para agregar un nuevo producto
  productoParaAgregar: {
    producto: Producto | null;
    cantidad: number;
    precioUnitario: number;
  } = {
    producto: null,
    cantidad: 1,
    precioUnitario: 0
  };

  // Constructor: inyecta el servicio de asignación, mensajes y formato de moneda
  constructor(
    private asignacionService: AsignacionService,
    private messageService: MessageService,
    private currencyPipe: CurrencyPipe
  ) {
    // Al crear el componente se cargan los datos
    this.cargarDatos();
  }

  // Carga los datos desde el servicio: proyectos y productos disponibles
  cargarDatos(): void {
    this.asignacionService.getProyectos().subscribe(data => {
      this.proyectos = data;
    });
    this.asignacionService.getProductos().subscribe(data => {
      this.productos = data;
    });
  }

  // Al seleccionar un proyecto, se cargan sus productos asignados
  seleccionarProyecto(proyecto: Proyecto) {
    if (proyecto) {
      this.proyectoSeleccionado = proyecto;
      // Si ya tiene productos asignados, los carga; si no, deja arreglo vacío
      this.productosSeleccionados = proyecto.productosAsignados ?? [];
    }
  }

  // Agrega un nuevo producto al proyecto
  agregarProducto() {
    const { producto, cantidad, precioUnitario } = this.productoParaAgregar;
    if (!producto) return;

    // Calculamos si el nuevo total excede el presupuesto
    const nuevoTotal = this.calcularTotal() + cantidad * precioUnitario;
    const presupuesto = this.proyectoSeleccionado?.presupuesto || 0;

    if (nuevoTotal > presupuesto) {
      // Muestra mensaje de error si se pasa del presupuesto
      this.messageService.add({
        severity: 'error',
        summary: 'Presupuesto Excedido',
        detail: `No puedes agregar este producto porque excede el presupuesto en ${this.currencyPipe.transform(nuevoTotal - presupuesto, 'USD')}`
      });
      return;
    }

    // Crea un nuevo objeto producto asignado
    const nuevoProducto: ProductoAsignado = {
      ...producto,
      cantidad,
      precioUnitario,
      total: cantidad * precioUnitario
    };

    // Lo agrega al arreglo de productos seleccionados
    this.productosSeleccionados.push(nuevoProducto);

    // Actualiza Firestore con los cambios
    this.actualizarProyecto();

    // Resetea el formulario de ingreso de producto
    this.productoParaAgregar = { producto: null, cantidad: 1, precioUnitario: 0 };
  }

  // Elimina un producto del proyecto por índice
  eliminarProducto(index: number) {
    if (index >= 0 && index < this.productosSeleccionados.length) {
      this.productosSeleccionados.splice(index, 1);
      this.actualizarProyecto();
    }
  }

  // Actualiza el documento del proyecto en Firestore
  async actualizarProyecto(): Promise<void> {
    if (!this.proyectoSeleccionado) return;

    await this.asignacionService.actualizarProyecto(
      this.proyectoSeleccionado?.id || '',
      { productosAsignados: this.productosSeleccionados }
    );
  }

  // Calcula el total de los productos asignados
  calcularTotal(): number {
    return this.productosSeleccionados.reduce((sum, item) => sum + item.total, 0);
  }

  // Determina el estado del presupuesto: excedido, justo o sobrante
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

