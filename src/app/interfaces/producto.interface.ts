// Interfaz que define los géneros, con nombre y código
export interface Generos {
  name: string;  
  code: string;  
}

// Interfaz principal para representar un producto
export interface Producto {
  id?: string;  
  nombre?: string;  

  // Puede ser un arreglo de objetos Generos o un arreglo de strings, útil para representar varios géneros
  generos?: Generos[] | string[];

  precio?: number;    
  cantidad?: number;  
  imagen?: string;
  valoracion: number;  
  disponible: boolean;  // Indica si el producto está disponible o no (booleano obligatorio)
  descripcion?: string;  
  fechaLanzamiento?: Date;  // Fecha en que fue comprado el producto (opcional)
}

