import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useStorageSync } from "@/hooks/useStorageSync";
import {
  getClientes,
  getDia,
  getRutas,
  setDia,
  cerrarDia,
  syncDiaConClientes,
} from "@/lib/storage";
import type { VisitaCliente } from "@/lib/types";
import { Check, MapPin, Navigation, Route as RouteIcon, X, Save, Flame } from "lucide-react";

export const Route = createFileRoute("/_app/ruta")({
  component: RutaPage,
});

function RutaPage() {
  useStorageSync();
  const dia = getDia();
  const clientes = getClientes();
  const rutas = getRutas();
  const ruta = rutas.find((r) => r.id === dia?.rutaId);

  const [editing, setEditing] = useState<string | null>(null);

  const data = useMemo(() => {
    if (!dia) return null;
    return dia.visitas.map((v) => ({
      v,
      c: clientes.find((c) => c.id === v.clienteId),
    }));
  }, [dia, clientes]);

  if (!dia) {
    return (
      <div className="text-center py-12 space-y-3">
        <Flame className="w-16 h-16 text-primary mx-auto" />
        <p className="text-muted-foreground">No has iniciado el día de ruta.</p>
        <Link to="/" className="inline-block px-5 py-2 rounded-full gradient-primary text-white font-semibold">
          Ir a inicio
        </Link>
      </div>
    );
  }

  const fmt = (n: number) =>
    n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

  const totalE = dia.visitas.reduce((a, v) => a + v.ventaEfectivo, 0);
  const totalC = dia.visitas.reduce((a, v) => a + v.ventaCredito, 0);
  const visitadas = dia.visitas.filter((v) => v.visitado).length;

  const startMaps = () => {
    const puntos = (data ?? [])
      .map((d) => d.c)
      .filter((c) => c && (c.lat != null || c.direccion));
    if (puntos.length === 0) return alert("No hay direcciones/ubicaciones.");
    const wps = puntos
      .map((c) => (c!.lat != null ? `${c!.lat},${c!.lng}` : encodeURIComponent(c!.direccion!)))
      .join("/");
    window.open(`https://www.google.com/maps/dir/${wps}`, "_blank");
  };

  const optimizar = () => {
    if (!dia) return;
    const items = (data ?? []).filter((d) => d.c && d.c.lat != null && d.c.lng != null);
    if (items.length < 2) return alert("Se necesitan al menos 2 clientes con coordenadas.");
    const start = items[0];
    const rest = items.slice(1);
    const ordered = [start];
    const remaining = [...rest];
    let cur = start;
    while (remaining.length) {
      let bestIdx = 0;
      let bestDist = Infinity;
      remaining.forEach((p, i) => {
        const d = haversine(cur.c!.lat!, cur.c!.lng!, p.c!.lat!, p.c!.lng!);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      });
      cur = remaining[bestIdx];
      ordered.push(cur);
      remaining.splice(bestIdx, 1);
    }
    const otros = (data ?? []).filter((d) => !d.c || d.c.lat == null);
    const nuevasVisitas = [...ordered, ...otros].map((d) => d.v);
    setDia({ ...dia, visitas: nuevasVisitas });
    alert("Recorrido optimizado por distancia.");
  };

  return (
    <div className="space-y-3">
      <section className="rounded-2xl gradient-card p-4 text-white shadow-glow">
        <div className="flex items-center gap-2">
          <RouteIcon className="w-5 h-5" />
          <h2 className="font-bold text-lg flex-1">{ruta?.nombre ?? (dia.adhoc ? "Fuera de ruta" : "Ruta")}</h2>
          <span className="text-sm bg-black/30 px-2 py-1 rounded">{dia.fecha}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 bg-black/20 rounded-xl p-3">
          <S label="EFECTIVO" v={fmt(totalE)} />
          <S label="CRÉDITO" v={fmt(totalC)} />
          <S label="VISITAS" v={`${visitadas}/${dia.visitas.length}`} />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <button onClick={startMaps} className="px-3 py-2 rounded-full bg-black/40 text-sm font-semibold flex items-center gap-1">
            <Navigation className="w-4 h-4" /> Iniciar en Maps
          </button>
          <button onClick={optimizar} className="px-3 py-2 rounded-full bg-black/40 text-sm font-semibold flex items-center gap-1">
            <RouteIcon className="w-4 h-4" /> Optimizar recorrido
          </button>
          <button
            onClick={() => {
              syncDiaConClientes();
            }}
            className="px-3 py-2 rounded-full border border-white/30 text-sm"
          >
            Sincronizar
          </button>
          <button
            onClick={() => {
              if (confirm("¿Cerrar el día y guardarlo en historial?")) cerrarDia();
            }}
            className="px-3 py-2 rounded-full bg-destructive/80 text-sm font-semibold"
          >
            Cerrar día
          </button>
        </div>
      </section>

      <ul className="space-y-2">
        {(data ?? []).map(({ v, c }, i) =>
          c ? (
            <li
              key={v.clienteId}
              className={`rounded-2xl p-3 border ${
                v.visitado ? "bg-success/10 border-success/40" : "bg-card border-border/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{c.nombre}</div>
                  <div className="text-xs text-muted-foreground truncate">{c.direccion ?? "Sin dirección"}</div>
                </div>
                <button
                  onClick={() => {
                    if (c.lat != null) {
                      window.open(`https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`, "_blank");
                    } else if (c.direccion) {
                      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.direccion)}`, "_blank");
                    } else {
                      if (confirm("Este cliente no tiene ubicación. ¿Agregar?")) {
                        location.assign("/clientes");
                      }
                    }
                  }}
                  className="px-3 py-1 rounded-lg bg-muted text-xs font-semibold flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" /> Mapa
                </button>
                <button
                  onClick={() => setEditing(v.clienteId)}
                  className="px-3 py-1 rounded-lg gradient-primary text-white text-xs font-semibold"
                >
                  {v.visitado ? "Editar" : "Visitar"}
                </button>
              </div>
              {v.visitado && (
                <div className="text-xs text-muted-foreground mt-2 flex gap-3">
                  <span>Efectivo: {fmt(v.ventaEfectivo)}</span>
                  <span>Crédito: {fmt(v.ventaCredito)}</span>
                </div>
              )}
            </li>
          ) : null,
        )}
      </ul>

      {editing && (
        <VisitaEditor
          visita={dia.visitas.find((v) => v.clienteId === editing)!}
          nombre={clientes.find((c) => c.id === editing)?.nombre ?? ""}
          onCancel={() => setEditing(null)}
          onSave={(nv) => {
            setDia({ ...dia, visitas: dia.visitas.map((v) => (v.clienteId === editing ? nv : v)) });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function S({ label, v }: { label: string; v: string }) {
  return (
    <div className="text-center">
      <div className="text-[10px] tracking-widest text-white/80">{label}</div>
      <div className="text-base font-extrabold">{v}</div>
    </div>
  );
}

function VisitaEditor({
  visita,
  nombre,
  onCancel,
  onSave,
}: {
  visita: VisitaCliente;
  nombre: string;
  onCancel: () => void;
  onSave: (v: VisitaCliente) => void;
}) {
  const [v, setV] = useState<VisitaCliente>(visita);
  return (
    <div className="fixed inset-0 z-30 bg-black/70 flex items-end sm:items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-card rounded-2xl p-5 max-w-md w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center mb-3">
          <h3 className="font-bold text-lg flex-1">{nombre}</h3>
          <button onClick={onCancel} className="p-1"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <Field label="Venta en efectivo">
            <input type="number" inputMode="decimal" value={v.ventaEfectivo}
              onChange={(e) => setV({ ...v, ventaEfectivo: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-muted border border-border" />
          </Field>
          <Field label="Venta a crédito">
            <input type="number" inputMode="decimal" value={v.ventaCredito}
              onChange={(e) => setV({ ...v, ventaCredito: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-muted border border-border" />
          </Field>
          <Field label="Notas">
            <textarea value={v.notas ?? ""}
              onChange={(e) => setV({ ...v, notas: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-muted border border-border min-h-[70px]" />
          </Field>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onCancel} className="flex-1 py-2 rounded-xl border border-border">Cancelar</button>
          <button
            onClick={() => onSave({ ...v, visitado: true, ts: Date.now() })}
            className="flex-1 py-2 rounded-xl gradient-primary text-white font-semibold flex items-center justify-center gap-1"
          >
            <Save className="w-4 h-4" /> Guardar visita
          </button>
        </div>
        {v.visitado && (
          <button
            onClick={() => onSave({ ...v, visitado: false, ventaEfectivo: 0, ventaCredito: 0 })}
            className="mt-2 w-full py-2 rounded-xl text-destructive border border-destructive/40"
          >
            Marcar como no visitado
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
