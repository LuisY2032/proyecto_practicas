import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Proyecto } from '../interfaces/proyecto.interface'; // Asume interfaces
import { Producto } from '../interfaces/producto.interface';

// Decorador que convierte esta clase en un servicio inyectable en todo el proyecto Angular
@Injectable({ providedIn: 'root' })
export class AsignacionService {
  
  // Se inyecta una instancia de Firestore para interactuar con la base de datos de Firebase
  private firestore: Firestore = inject(Firestore);

  // Método para obtener la colección de proyectos desde Firestore
  getProyectos(): Observable<Proyecto[]> {
    const proyectosRef = collection(this.firestore, 'proyectos');

    // Devuelve un observable con los datos de la colección, incluyendo el ID de cada documento
    return collectionData(proyectosRef, { idField: 'id' }) as Observable<Proyecto[]>;
  }
  // Método para obtener la colección de productos desde Firestore
  getProductos(): Observable<Producto[]> {
    const productosRef = collection(this.firestore, 'productos');
    // Devuelve un observable con los datos de la colección, incluyendo el ID de cada documento
    return collectionData(productosRef, { idField: 'id' }) as Observable<Producto[]>;
  }
  // Método asíncrono para actualizar un proyecto específico en Firestore
  async actualizarProyecto(id: string, cambios: Partial<Proyecto>): Promise<void> {
    const docRef = doc(this.firestore, `proyectos/${id}`);
    await updateDoc(docRef, cambios);
  }
}
