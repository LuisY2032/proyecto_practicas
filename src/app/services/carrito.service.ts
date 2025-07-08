import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { collection,addDoc, serverTimestamp } from 'firebase/firestore';

export interface Producto {
  id: string;
  titulo: string;
  descripcion?: string;
  precio: number;
  imagen?: string;
  cantidad?: number;
}

@Injectable({
  providedIn: 'root',
})
export class CarritoService {
  private productos: Producto[] = [];
  private carritoSubject = new BehaviorSubject<Producto[]>([]);

  carrito$ = this.carritoSubject.asObservable();
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private uid: string | null = null;

  constructor() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.uid = user.uid;
        await this.cargarCarritoDesdeFirestore();
      } else {
        this.uid = null;
        this.productos = [];
        this.carritoSubject.next([]);
      }
    });
  }

  async cargarCarritoDesdeFirestore() {
    if (!this.uid) return;
    const docRef = doc(this.firestore, 'carritos', this.uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      this.productos = snap.data()['productos'] || [];
      this.carritoSubject.next(this.productos);
    }
  }

  private async guardarEnFirestore() {
    if (!this.uid) return;
    const docRef = doc(this.firestore, 'carritos', this.uid);
    await setDoc(docRef, { productos: this.productos }, { merge: true });
  }

  async agregarProducto(producto: Producto) {
    const index = this.productos.findIndex(p => p.id === producto.id);
    if (index !== -1) {
      this.productos[index].cantidad = (this.productos[index].cantidad || 1) + 1;
    } else {
      this.productos.push({ ...producto, cantidad: 1 });
    }
    this.carritoSubject.next(this.productos);
    await this.guardarEnFirestore();
  }

  async eliminarProducto(id: string) {
    this.productos = this.productos.filter(p => p.id !== id);
    this.carritoSubject.next(this.productos);
    await this.guardarEnFirestore();
  }

  async vaciarCarrito() {
  this.productos = [];
  this.carritoSubject.next([]);
  if (this.uid) {
    const docRef = doc(this.firestore, 'carritos', this.uid);
    await setDoc(docRef, { productos: [] }, { merge: true });
  }
}

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

    const facturasRef = collection(this.firestore, 'facturas', this.uid, 'historial');
    await addDoc(facturasRef, factura);

    console.log('Factura guardada en Firestore');

    await this.vaciarCarrito();
  } catch (error) {
    console.error('Error al realizar compra:', error);
    throw error; // Re-lanzar para que componente también capture el error
  }
}


  obtenerTotal(): number {
    return this.productos.reduce((acc, p) => acc + (p.precio * (p.cantidad || 1)), 0);
  }


  obtenerProductos(): Producto[] {
    return this.productos;
  }
}





