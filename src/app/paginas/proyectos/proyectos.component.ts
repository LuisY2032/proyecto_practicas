// proyectos.component.ts
import { Component, inject } from '@angular/core';
import { Firestore, doc, deleteDoc } from '@angular/fire/firestore';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProyectosService } from '../../services/proyecto.service';
import { Proyecto } from '../../interfaces/proyecto.interface';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './proyectos.component.html',
  styleUrl: './proyectos.component.scss'
})

// Componente encargado de la gestión de proyectos
export class ProyectosComponent {
  // Inyección directa del servicio Firestore para acceder a la base de datos
  private firestore: Firestore = inject(Firestore);

  // Lista que contiene todos los proyectos obtenidos de Firestore
  proyectos: Proyecto[] = [];

  // Controla la visibilidad del diálogo (formulario modal)
  displayDialog = false;

  // Modelo del proyecto actualmente en edición o creación
  proyecto: Proyecto = this.nuevoProyecto();

  // Indica si se está editando un proyecto existente o creando uno nuevo
  isEdit = false;

  // Constructor que inyecta el servicio de proyectos y el servicio de mensajes (toast)
  constructor(
    private proyectosService: ProyectosService,
    private messageService: MessageService
  ) {
    // Al crear el componente, se cargan los proyectos existentes desde Firestore
    this.getProyectos();
  }


// Método que obtiene los proyectos desde el servicio
getProyectos(): void {
  // Llama al método getProyectos() del servicio, que retorna un Observable.
  // Luego se suscribe a ese Observable para recibir los datos cuando estén disponibles.
  this.proyectosService.getProyectos().subscribe(data => {
    // Una vez que se reciben los datos (cuando el Observable emite un valor),
    // se asignan a la propiedad 'proyectos' del componente.
    this.proyectos = data;
  });
}


// Guarda un nuevo proyecto o actualiza uno existente
async guardarProyecto(): Promise<void> {
  if (this.isEdit && this.proyecto.id) {
    await this.proyectosService.actualizarProyecto(this.proyecto.id, this.proyecto);
    this.messageService.add({ severity: 'success', summary: 'Proyecto actualizado', detail: 'Se actualizó correctamente.' });
  } else {
    await this.proyectosService.crearProyecto(this.proyecto);
    this.messageService.add({ severity: 'success', summary: 'Proyecto creado', detail: 'Nuevo proyecto registrado.' });
  }
  this.displayDialog = false;
}
// Carga un proyecto en el formulario para editar
  editarProyecto(p: Proyecto): void {
    this.proyecto = { ...p };
    this.isEdit = true;
    this.displayDialog = true;
  }

// Elimina un proyecto directamente desde Firestore
async eliminarProyecto(id: string): Promise<void> {
  await this.proyectosService.eliminarProyecto(id);
  this.messageService.add({ severity: 'warn', summary: 'Proyecto eliminado', detail: 'El proyecto ha sido eliminado.' });
}

// Devuelve un objeto base para un nuevo proyecto
  nuevoProyecto(): Proyecto {
    return {
      nombre: '',
      descripcion: '',
      presupuesto: 0
    };
  }
}
