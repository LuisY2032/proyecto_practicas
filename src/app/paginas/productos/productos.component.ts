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
import { ImageModule } from 'primeng/image';


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
    ToastModule,
    ImageModule,
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

// Inyección del servicio de productos y del servicio de mensajes para notificaciones
constructor(private productosService: ProductosService,
            private messageService: MessageService) { }

ngOnInit() {
  // Al iniciar el componente, se obtienen los productos desde el servicio
  this.getProductos();
}

// Obtiene los productos desde Firestore y los guarda en el arreglo local 'productos'
getProductos() {
  this.productosService.getProductos().subscribe((data) => {
    this.productos = data;
  });
}

// Devuelve la ruta completa de la imagen para usar en el template
getRutaImagen(imagen: string): string {
  if (!imagen) return ''; // Evita errores si la imagen está vacía o es nula

  if (imagen.startsWith("http")) {
    return imagen; // Si es URL externa, retorna tal cual
  }

  // Si es una ruta relativa, concatena con carpeta assets para poder mostrarla
  return "assets/" + imagen;
}

// Guarda un producto: si está en modo edición, actualiza; si no, crea uno nuevo
async guardarProducto() {
  if (this.isEdit && this.producto.id) {
    // Actualiza producto existente en Firestore
    await this.productosService.actualizarProducto(this.producto.id, this.producto);
    this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Producto actualizado correctamente' });
  } else {
    // Crea un nuevo producto en Firestore
    await this.productosService.crearProducto(this.producto);
    this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Producto creado exitosamente' });
  }
  // Cierra el diálogo tras guardar
  this.displayDialog = false;
}

// Prepara el formulario para edición copiando los datos del producto seleccionado
editarProducto(producto: any) {
  this.producto = { ...producto }; // Copia para evitar referencias directas
  this.isEdit = true;
  this.displayDialog = true; // Muestra el diálogo de edición
}

// Elimina un producto por su id y actualiza la lista, mostrando notificación
async eliminarProducto(id: string) {
  await this.productosService.eliminarProducto(id);
  this.messageService.add({ severity: 'warn', summary: 'Eliminado', detail: 'Producto eliminado' });
  this.getProductos(); // Refresca la lista tras eliminación
}

// Convierte un array de géneros (strings u objetos) a una cadena separada por comas
getGenerosNames(generos: any[]): string {
  if (!generos || generos.length === 0) {
    return 'No especificado'; // Valor por defecto si no hay géneros
  }

  if (typeof generos[0] === 'string') {
    return generos.join(', '); // Si ya son strings, unir con coma
  }

  if (generos[0]?.name) {
    return generos.map(g => g.name).join(', '); // Si son objetos, extraer la propiedad 'name'
  }

  return 'No especificado'; // En caso contrario, retorna texto genérico
}

// Crea un objeto Producto con valores predeterminados para iniciar uno nuevo
nuevoProducto(): Producto {
  return {
    cantidad: 1,        // cantidad inicial 1
    valoracion: 0,      // valoración inicial 0
    disponible: false   // marca como no disponible por defecto
  }
}
}

/*

// Método para subir imagen a Firebase Storage
subirImagen(event: any) {
  const archivo: File = event.files[0]; // Primer archivo seleccionado
  const storage = getStorage(); // Referencia al Storage de Firebase
  const nombreUnico = `imagenes/${Date.now()}_${archivo.name}`; // Nombre único para evitar conflictos
  const storageRef = ref(storage, nombreUnico); // Referencia a la ruta de almacenamiento

  // Subida del archivo
  uploadBytes(storageRef, archivo).then(() => {
    // Obtiene la URL pública después de subir la imagen
    getDownloadURL(storageRef).then((url) => {
      this.producto.imagen = url; // Asigna la URL al producto
      this.messageService.add({ severity: 'success', summary: 'Imagen subida', detail: 'La imagen se ha subido con éxito.' });
    });
  }).catch((error) => {
    console.error('Error al subir imagen:', error);
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo subir la imagen.' });
  });
}
}  */