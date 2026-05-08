import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStorageSync } from "@/hooks/useStorageSync";
import { getClientes, getRutas, setClientes, genId } from "@/lib/storage";
import type { Cliente } from "@/lib/types";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";

export const Route = createFileRoute("/_app/clientes")({
  component: ClientesPage,
});

function ClientesPage() {
  useStorageSync();
  const nav = useNavigate();
  const clientes = getClientes();
  const rutas = getRutas();
  const [filtro, setFiltro] = useState("");
  const [rutaId, setRutaId] = useState<string>("");
  const [editing, setEditing] = useState<Cliente | null>(null);

  const lista = clientes
    .filter((c) => (rutaId ? c.rutaId === rutaId : true))
    .filter((c) => c.nombre.toLowerCase().includes(filtro.toLowerCase()))
    .sort((a, b) => a.orden - b.orden);

  const blank = (): Cliente => ({
    id: genId(),
    nombre: "",
    rutaId: rutas[0]?.id ?? "",
    orden: clientes.length + 1,
    activo: true,
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold flex-1">Clientes</h2>
        <button
          onClick={() => setEditing(blank())}
          disabled={rutas.length === 0}
          className="px-4 py-2 rounded-full gradient-primary text-white font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Nuevo
        </button>
      </div>
      {rutas.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Primero crea una ruta en{" "}
          <button onClick={() => nav({ to: "/rutas" })} className="text-primary underline">
            Rutas
          </button>
          .
        </p>
      )}

      <div className="flex gap-2">
        <input
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Buscar..."
          className="flex-1 px-3 py-2 rounded-xl bg-card border border-border"
        />
        <select
          value={rutaId}
          onChange={(e) => setRutaId(e.target.value)}
          className="px-3 py-2 rounded-xl bg-card border border-border"
        >
          <option value="">Todas</option>
          {rutas.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}
            </option>
          ))}
        </select>
      </div>

      <ul className="space-y-2">
        {lista.map((c) => {
          const ruta = rutas.find((r) => r.id === c.rutaId);
          return (
            <li
              key={c.id}
              className="rounded-2xl bg-card border border-border/50 p-3 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold">
                {c.orden}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{c.nombre}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {ruta?.nombre ?? "—"}
                  {c.direccion ? ` · ${c.direccion}` : ""}
                </div>
              </div>
              {(c.lat != null || c.direccion) && <MapPin className="w-4 h-4 text-success" />}
              <button
                onClick={() => setEditing(c)}
                className="p-2 rounded-lg hover:bg-muted"
                aria-label="Editar"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`¿Eliminar ${c.nombre}?`)) {
                    setClientes(clientes.filter((x) => x.id !== c.id));
                  }
                }}
                className="p-2 rounded-lg hover:bg-destructive/20 text-destructive"
                aria-label="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          );
        })}
        {lista.length === 0 && (
          <li className="text-center text-muted-foreground py-8">Sin clientes.</li>
        )}
      </ul>

      {editing && (
        <ClienteEditor
          cliente={editing}
          rutas={rutas}
          onCancel={() => setEditing(null)}
          onSave={(c) => {
            const exists = clientes.some((x) => x.id === c.id);
            const next = exists ? clientes.map((x) => (x.id === c.id ? c : x)) : [...clientes, c];
            setClientes(next);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function ClienteEditor({
  cliente,
  rutas,
  onCancel,
  onSave,
}: {
  cliente: Cliente;
  rutas: { id: string; nombre: string }[];
  onCancel: () => void;
  onSave: (c: Cliente) => void;
}) {
  const [c, setC] = useState<Cliente>(cliente);
  return (
    <div className="fixed inset-0 z-30 bg-black/70 flex items-end sm:items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-card rounded-2xl p-5 max-w-md w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-lg mb-3">{cliente.nombre ? "Editar cliente" : "Nuevo cliente"}</h3>
        <div className="space-y-3">
          <Field label="Nombre">
            <input
              value={c.nombre}
              onChange={(e) => setC({ ...c, nombre: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-muted border border-border"
            />
          </Field>
          <Field label="Ruta">
            <select
              value={c.rutaId}
              onChange={(e) => setC({ ...c, rutaId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-muted border border-border"
            >
              {rutas.map((r) => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Orden">
              <input
                type="number"
                value={c.orden}
                onChange={(e) => setC({ ...c, orden: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-muted border border-border"
              />
            </Field>
            <Field label="Teléfono">
              <input
                value={c.telefono ?? ""}
                onChange={(e) => setC({ ...c, telefono: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-muted border border-border"
              />
            </Field>
          </div>
          <Field label="Dirección">
            <input
              value={c.direccion ?? ""}
              onChange={(e) => setC({ ...c, direccion: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-muted border border-border"
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Latitud">
              <input
                type="number"
                step="any"
                value={c.lat ?? ""}
                onChange={(e) => setC({ ...c, lat: e.target.value === "" ? undefined : Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-muted border border-border"
              />
            </Field>
            <Field label="Longitud">
              <input
                type="number"
                step="any"
                value={c.lng ?? ""}
                onChange={(e) => setC({ ...c, lng: e.target.value === "" ? undefined : Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-muted border border-border"
              />
            </Field>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!navigator.geolocation) return alert("Geolocalización no disponible");
              navigator.geolocation.getCurrentPosition(
                (p) => setC({ ...c, lat: p.coords.latitude, lng: p.coords.longitude }),
                (err) => alert("No se pudo obtener ubicación: " + err.message),
                { enableHighAccuracy: true },
              );
            }}
            className="w-full py-2 rounded-xl bg-primary/15 text-primary font-semibold"
          >
            Usar ubicación actual
          </button>
          <Field label="Notas">
            <textarea
              value={c.notas ?? ""}
              onChange={(e) => setC({ ...c, notas: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-muted border border-border min-h-[60px]"
            />
          </Field>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={c.activo} onChange={(e) => setC({ ...c, activo: e.target.checked })} />
            <span>Activo</span>
          </label>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onCancel} className="flex-1 py-2 rounded-xl border border-border">Cancelar</button>
          <button
            onClick={() => {
              if (!c.nombre.trim()) return alert("Nombre requerido");
              if (!c.rutaId) return alert("Selecciona una ruta");
              onSave(c);
            }}
            className="flex-1 py-2 rounded-xl gradient-primary text-white font-semibold"
          >
            Guardar
          </button>
        </div>
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
