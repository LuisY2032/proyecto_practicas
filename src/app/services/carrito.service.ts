import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Definición de la interfaz Producto, que representa un producto del carrito
export interface Producto {
  id: string;
  titulo: string;
  descripcion?: string;
  precio: number;
  imagen?: string;
  cantidad?: number;
}

@Injectable({
  providedIn: 'root', // El servicio estará disponible en toda la aplicación
})
export class CarritoService {
  // Array local que guarda los productos en el carrito
  private productos: Producto[] = [];

  // BehaviorSubject que permite emitir y escuchar cambios en el carrito
  private carritoSubject = new BehaviorSubject<Producto[]>([]);

  // Observable público para que los componentes se suscriban y reciban cambios
  carrito$ = this.carritoSubject.asObservable();

  // Inyección de dependencias para Firestore y Auth
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  // Variable para guardar el UID del usuario autenticado
  private uid: string | null = null;

  constructor() {
    // Detectar cambios en el estado de autenticación del usuario
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        // Si hay usuario autenticado, se guarda su UID y se carga su carrito desde Firestore
        this.uid = user.uid;
        await this.cargarCarritoDesdeFirestore();
      } else {
        // Si no hay usuario, se limpia el carrito local y el observable
        this.uid = null;
        this.productos = [];
        this.carritoSubject.next([]);
      }
    });
  }

  // Método para cargar el carrito desde Firestore para el usuario autenticado
  async cargarCarritoDesdeFirestore() {
    if (!this.uid) return; // Si no hay UID, no hacer nada

    const docRef = doc(this.firestore, 'carritos', this.uid);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      // Si existe documento, se actualiza el carrito local y se emite el cambio
      this.productos = snap.data()['productos'] || [];
      this.carritoSubject.next(this.productos);
    }
  }

  // Guarda el estado actual del carrito en Firestore
  private async guardarEnFirestore() {
    if (!this.uid) return; // Si no hay usuario, no guardar

    const docRef = doc(this.firestore, 'carritos', this.uid);
    await setDoc(docRef, { productos: this.productos }, { merge: true });
  }

  // Agrega un producto al carrito, o incrementa la cantidad si ya existe
  async agregarProducto(producto: Producto) {
    const index = this.productos.findIndex(p => p.id === producto.id);
    if (index !== -1) {
      // Si el producto ya está, suma 1 a la cantidad
      this.productos[index].cantidad = (this.productos[index].cantidad || 1) + 1;
    } else {
      // Si no está, lo agrega con cantidad inicial 1
      this.productos.push({ ...producto, cantidad: 1 });
    }
    // Emite los cambios y guarda en Firestore
    this.carritoSubject.next(this.productos);
    await this.guardarEnFirestore();
  }

  // Elimina un producto del carrito por su id
  async eliminarProducto(id: string) {
    this.productos = this.productos.filter(p => p.id !== id);
    this.carritoSubject.next(this.productos);
    await this.guardarEnFirestore();
  }

  // Vacía todo el carrito, tanto localmente como en Firestore
  async vaciarCarrito() {
    this.productos = [];
    this.carritoSubject.next([]);
    if (this.uid) {
      const docRef = doc(this.firestore, 'carritos', this.uid);
      await setDoc(docRef, { productos: [] }, { merge: true });
    }
  }

  // Procesa la compra: crea una factura en Firestore y vacía el carrito
  async realizarCompra() {
    try {
      if (!this.uid) {
        console.warn('No hay usuario autenticado.');
        return;
      }
      if (this.productos.length === 0) {
        console.warn('El carrito está vacío.');
        return;
      }

      // Construye el objeto factura con fecha, total y productos comprados
      const factura = {
        fecha: serverTimestamp(),
        total: this.obtenerTotal(),
        productos: this.productos.map(p => ({
          id: p.id,
          titulo: p.titulo,
          precio: p.precio,
          cantidad: p.cantidad,
          imagen: p.imagen,
        }))
      };

      console.log('Guardando factura en Firestore...', factura);

      // Referencia a la colección donde se almacenan las facturas del usuario
      const facturasRef = collection(this.firestore, 'facturas', this.uid, 'historial');
      await addDoc(facturasRef, factura);

      console.log('Factura guardada en Firestore');

      // Vacía el carrito después de la compra
      await this.vaciarCarrito();
    } catch (error) {
      console.error('Error al realizar compra:', error);
      throw error; // Re-lanzar el error para que el componente pueda manejarlo
    }
  }

  // Calcula el total a pagar sumando el precio por la cantidad de cada producto
  obtenerTotal(): number {
    return this.productos.reduce((acc, p) => acc + (p.precio * (p.cantidad || 1)), 0);
  }

  // Retorna la lista actual de productos en el carrito
  obtenerProductos(): Producto[] {
    return this.productos;
  }
}





