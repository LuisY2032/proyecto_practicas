import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc, updateDoc} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Producto } from '../interfaces/producto.interface'; 

@Injectable({
  providedIn: 'root', 
})

export class ProductosService {
  private firestore: Firestore = inject(Firestore);

  // Obtener todos los productos (Observable)
  getProductos(): Observable<Producto[]> {
    const productosRef = collection(this.firestore, 'productos');
    return collectionData(productosRef, { idField: 'id' }) as Observable<Producto[]>;
  }

  // Crear un producto (Promise)
  async crearProducto(producto: Producto): Promise<void> {
    const productosRef = collection(this.firestore, 'productos');
    await addDoc(productosRef, producto);
  }

  // Actualizar un producto (Promise)
  async actualizarProducto(id: string, cambios: Partial<Producto>): Promise<void> {
    const docRef = doc(this.firestore, `productos/${id}`);
    await updateDoc(docRef, cambios);
  }

  // Eliminar un producto (Promise)
  async eliminarProducto(id: string): Promise<void> {
    const docRef = doc(this.firestore, `productos/${id}`); //se crea una referencia a la coleccion productos en Fire
    await deleteDoc(docRef);
  }
}