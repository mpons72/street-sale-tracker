import type { Cliente, Ruta, DayRoute, VisitaCliente } from "./types";

const K = {
  clientes: "salsaruta.clientes",
  rutas: "salsaruta.rutas",
  dia: "salsaruta.dia",
  historial: "salsaruta.historial",
  adminPin: "salsaruta.adminPin",
};

const isBrowser = () => typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("salsaruta:update"));
}

export function getRutas(): Ruta[] {
  return read<Ruta[]>(K.rutas, []);
}
export function setRutas(rutas: Ruta[]) {
  write(K.rutas, rutas);
}

export function getClientes(): Cliente[] {
  return read<Cliente[]>(K.clientes, []);
}
export function setClientes(clientes: Cliente[]) {
  write(K.clientes, clientes);
}

export function getDia(): DayRoute | null {
  return read<DayRoute | null>(K.dia, null);
}
export function setDia(d: DayRoute | null) {
  write(K.dia, d);
}

export function getHistorial(): DayRoute[] {
  return read<DayRoute[]>(K.historial, []);
}
export function setHistorial(h: DayRoute[]) {
  write(K.historial, h);
}

export function getAdminPin(): string {
  return read<string>(K.adminPin, "1234");
}
export function setAdminPin(pin: string) {
  write(K.adminPin, pin);
}

export function genId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function iniciarDia(rutaId: string, opts?: { adhoc?: boolean; clienteIds?: string[] }): DayRoute {
  const fecha = todayStr();
  const clientes = getClientes();
  let lista = clientes
    .filter((c) => c.activo && (opts?.adhoc ? opts.clienteIds?.includes(c.id) : c.rutaId === rutaId))
    .sort((a, b) => a.orden - b.orden);
  const visitas: VisitaCliente[] = lista.map((c) => ({
    clienteId: c.id,
    visitado: false,
    ventaEfectivo: 0,
    ventaCredito: 0,
  }));
  const dia: DayRoute = {
    fecha,
    rutaId,
    visitas,
    iniciado: true,
    cerrado: false,
    adhoc: opts?.adhoc,
  };
  setDia(dia);
  return dia;
}

export function cerrarDia() {
  const d = getDia();
  if (!d) return;
  d.cerrado = true;
  const hist = getHistorial();
  hist.unshift(d);
  setHistorial(hist);
  setDia(null);
}

export function syncDiaConClientes() {
  const d = getDia();
  if (!d || d.adhoc) return;
  const clientes = getClientes()
    .filter((c) => c.activo && c.rutaId === d.rutaId)
    .sort((a, b) => a.orden - b.orden);
  const existentes = new Map(d.visitas.map((v) => [v.clienteId, v]));
  d.visitas = clientes.map(
    (c) =>
      existentes.get(c.id) ?? {
        clienteId: c.id,
        visitado: false,
        ventaEfectivo: 0,
        ventaCredito: 0,
      },
  );
  setDia(d);
}

export function exportBackup() {
  const data = {
    version: 1,
    fechaExport: new Date().toISOString(),
    clientes: getClientes(),
    rutas: getRutas(),
    dia: getDia(),
    historial: getHistorial(),
  };
  return data;
}

export function importBackup(json: any) {
  if (!json || typeof json !== "object") throw new Error("Archivo inválido");
  if (Array.isArray(json.clientes)) setClientes(json.clientes);
  if (Array.isArray(json.rutas)) setRutas(json.rutas);
  if (Array.isArray(json.historial)) setHistorial(json.historial);
  if (json.dia === null || (json.dia && typeof json.dia === "object")) setDia(json.dia);
}

export function useStorageVersion(): number {
  // helper not used; components subscribe via window event
  return 0;
}
