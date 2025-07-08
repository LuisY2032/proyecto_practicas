import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Proyecto } from '../interfaces/proyecto.interface';

@Injectable({ providedIn: 'root' })

// Declaramos la clase del servicio que manejará la lógica relacionada a los proyectos
export class ProyectosService {

  // Esto nos permite acceder a la base de datos en la nube de Firebase Firestore
  // La propiedad 'firestore' es privada, por lo que solo puede ser usada dentro de esta clase.
  private firestore: Firestore = inject(Firestore);


// Obtiene todos los proyectos como un Observable que se actualiza en tiempo real
getProyectos(): Observable<Proyecto[]> {

  const proyectosRef = collection(this.firestore, 'proyectos');

  // Usamos collectionData para obtener los datos de la colección como un Observable.
  // Esto significa que cada vez que haya un cambio en la colección en Firestore,
  // el Observable emitirá los nuevos datos automáticamente (actualización en tiempo real).
  return collectionData(proyectosRef, { idField: 'id' }) as Observable<Proyecto[]>;
}


// Crea un nuevo proyecto en la colección 'proyectos' de Firestore
// Recibe un objeto de tipo Proyecto y devuelve una Promesa que se resuelve cuando el documento ha sido agregado
async crearProyecto(proyecto: Proyecto): Promise<void> {
  const proyectosRef = collection(this.firestore, 'proyectos');
  // Como es una operación asíncrona, usamos 'await' para esperar a que se complete antes de continuar
  await addDoc(proyectosRef, proyecto);
}

// Actualiza un documento existente por ID con solo los campos modificados
  async actualizarProyecto(id: string, cambios: Partial<Proyecto>): Promise<void> {
    const docRef = doc(this.firestore, `proyectos/${id}`);
    await updateDoc(docRef, cambios);
  }

// Elimina un documento de la colección por su ID
  async eliminarProyecto(id: string): Promise<void> {
    const docRef = doc(this.firestore, `proyectos/${id}`);  //se crea una referencia a la coleccion proyectos en Fire
    await deleteDoc(docRef);
  }
}