export type Cliente = {
  id: string;
  nombre: string;
  rutaId: string;
  orden: number;
  direccion?: string;
  telefono?: string;
  lat?: number;
  lng?: number;
  notas?: string;
  activo: boolean;
};

export type Ruta = {
  id: string;
  nombre: string;
  diaSemana?: number; // 0-6 (domingo=0)
};

export type ItemVenta = {
  producto: string;
  cantidad: number;
  precio: number;
};

export type VisitaCliente = {
  clienteId: string;
  visitado: boolean;
  ventaEfectivo: number;
  ventaCredito: number;
  surtido?: ItemVenta[];
  devolucion?: ItemVenta[];
  notas?: string;
  ts?: number;
};

export type DayRoute = {
  fecha: string; // YYYY-MM-DD
  rutaId: string;
  visitas: VisitaCliente[];
  iniciado: boolean;
  cerrado: boolean;
  adhoc?: boolean; // venta fuera de ruta
};
