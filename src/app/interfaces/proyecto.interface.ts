// Importamos la interfaz 'Producto' desde el archivo 'producto.interface.ts'
// Esta interfaz nos permite definir la estructura que deben tener los objetos de tipo Producto.
import { Producto } from './producto.interface';


// Interface para ProductoAsignado (extiende Producto con campos adicionales)
// Esta interfaz hereda todos los campos de 'Producto' y agrega propiedades específicas

export interface ProductoAsignado extends Producto {
  cantidad: number;       // Cantidad de este producto asignado al proyecto
  precioUnitario: number; // Precio por unidad de este producto dentro del contexto del proyecto
  total: number;          // Total calculado (cantidad * precioUnitario)
}

// Interface principal para Proyecto
export interface Proyecto {
  id?: string;                           
  nombre: string;                       
  descripcion: string;                   
  presupuesto: number;                   
  productosAsignados?: ProductoAsignado[]; // Lista opcional de productos vinculados a este proyecto
}
