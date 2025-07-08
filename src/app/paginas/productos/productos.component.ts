import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { RatingModule } from 'primeng/rating';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputMaskModule } from 'primeng/inputmask';
import { Textarea } from 'primeng/inputtextarea';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { Slider } from 'primeng/slider';
import { TooltipModule } from 'primeng/tooltip';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SelectButtonModule } from 'primeng/selectbutton';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FileUploadModule } from 'primeng/fileupload';


// Interfaces y servicios
import { Producto } from '../../interfaces/producto.interface';
import { ProductosService } from '../../services/productos.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    ToggleSwitchModule,
    SelectButtonModule,                           
    DatePicker,
    TooltipModule,
    Slider,
    FileUploadModule,
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    DropdownModule,
    MultiSelectModule,
    InputNumberModule,
    RatingModule,
    InputSwitchModule,
    InputMaskModule,
    Textarea,
    ButtonModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss']
})

// Componente que maneja la lógica de productos en Angular
export class ProductosComponent implements OnInit {

  // Arreglo que almacenará la lista de productos
  productos: Producto[] = [];

  // Variable booleana que controla la visualización del diálogo 
  displayDialog = false;

  // Objeto producto que se usará para crear o editar un producto, inicializado con un nuevo producto
  producto: Producto = this.nuevoProducto();

  // Indica si el formulario está en modo edición (true) o creación (false)
  isEdit = false;
  


// Opciones de géneros de ropa para el multiselect
  generos = [
    { name: 'Acción', code: 'ACC' },
    { name: 'Aventura', code: 'AVT' },
    { name: 'Terror / Survival Horror', code: 'TER' },
    { name: 'Rol (RPG - Role Playing Game)', code: 'RPG' },
    { name: 'Deportes', code: 'DEP' },
    { name: 'Simulación', code: 'SIM' },
    { name: 'Carreras (Racing)', code: 'RAC' },
    { name: 'Estrategia', code: 'ESTR' }
  ];

 // Inyección del servicio de productos
  constructor(private productosService: ProductosService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.getProductos();
  }

// Obtiene los productos desde Firestore y los guarda en el arreglo
  getProductos() {
    this.productosService.getProductos().subscribe((data) => {
      this.productos = data;
    });
  }

  async guardarProducto() {
  if (this.isEdit && this.producto.id) {
    await this.productosService.actualizarProducto(this.producto.id, this.producto);
    this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Producto actualizado correctamente' });
  } else {
    await this.productosService.crearProducto(this.producto);
    this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Producto creado exitosamente' });
  }
  this.displayDialog = false;
}

// Prepara el formulario con los datos del producto seleccionado para edición
  editarProducto(producto: any) {
    this.producto = { ...producto };
    this.isEdit = true;
    this.displayDialog = true;
  }

 async eliminarProducto(id: string) {
  await this.productosService.eliminarProducto(id);
  this.messageService.add({ severity: 'warn', summary: 'Eliminado', detail: 'Producto eliminado' });
  this.getProductos();
}

// Devuelve una cadena con los nombres de los géneros, separados por comas
getGenerosNames(generos: any[]): string {
  // Si el array está vacío o no existe, retorna texto por defecto
  if (!generos || generos.length === 0) {
    return 'No especificado';
  }

  // Si los géneros ya son strings, los une con coma
  if (typeof generos[0] === 'string') {
    return generos.join(', ');
  }

  // Si los géneros son objetos con propiedad 'name', extrae los nombres y los une
  if (generos[0]?.name) {
    return generos.map(g => g.name).join(', ');
  }

  // En cualquier otro caso, retorna texto por defecto
  return 'No especificado';
}

// Devuelve un objeto Producto con valores por defecto para iniciar uno nuevo
nuevoProducto(): Producto {
  return {
    cantidad: 1,        // cantidad por defecto
    valoracion: 0,      // valor inicial de la valoración
    disponible: false   // se marca como no disponible al crear
  }
}

subirImagen(event: any) {
  const archivo: File = event.files[0];
  const storage = getStorage();
  const nombreUnico = `imagenes/${Date.now()}_${archivo.name}`;
  const storageRef = ref(storage, nombreUnico);

  uploadBytes(storageRef, archivo).then(() => {
    getDownloadURL(storageRef).then((url) => {
      this.producto.imagen = url;
      this.messageService.add({ severity: 'success', summary: 'Imagen subida', detail: 'La imagen se ha subido con éxito.' });
    });
  }).catch((error) => {
    console.error('Error al subir imagen:', error);
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo subir la imagen.' });
  });
}
}