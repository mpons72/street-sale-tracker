import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStorageSync } from "@/hooks/useStorageSync";
import { getClientes, getRutas, setRutas, genId } from "@/lib/storage";
import type { Ruta } from "@/lib/types";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_app/rutas")({
  component: RutasPage,
});

function RutasPage() {
  useStorageSync();
  const rutas = getRutas();
  const clientes = getClientes();
  const [editing, setEditing] = useState<Ruta | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold flex-1">Rutas</h2>
        <button
          onClick={() => setEditing({ id: genId(), nombre: "" })}
          className="px-4 py-2 rounded-full gradient-primary text-white font-semibold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nueva
        </button>
      </div>

      <ul className="space-y-2">
        {rutas.map((r) => {
          const n = clientes.filter((c) => c.activo && c.rutaId === r.id).length;
          return (
            <li
              key={r.id}
              className="rounded-2xl bg-card border border-border/50 p-3 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
                {r.nombre.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{r.nombre}</div>
                <div className="text-xs text-muted-foreground">{n} clientes</div>
              </div>
              <button onClick={() => setEditing(r)} className="p-2 rounded-lg hover:bg-muted">
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (n > 0) return alert("Esta ruta tiene clientes asignados.");
                  if (confirm(`¿Eliminar ${r.nombre}?`))
                    setRutas(rutas.filter((x) => x.id !== r.id));
                }}
                className="p-2 rounded-lg hover:bg-destructive/20 text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          );
        })}
        {rutas.length === 0 && (
          <li className="text-center text-muted-foreground py-8">Sin rutas.</li>
        )}
      </ul>

      {editing && (
        <Editor
          ruta={editing}
          onCancel={() => setEditing(null)}
          onSave={(r) => {
            const exists = rutas.some((x) => x.id === r.id);
            setRutas(exists ? rutas.map((x) => (x.id === r.id ? r : x)) : [...rutas, r]);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function Editor({ ruta, onCancel, onSave }: { ruta: Ruta; onCancel: () => void; onSave: (r: Ruta) => void }) {
  const [r, setR] = useState<Ruta>(ruta);
  const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  return (
    <div className="fixed inset-0 z-30 bg-black/70 flex items-end sm:items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-card rounded-2xl p-5 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-lg mb-3">{ruta.nombre ? "Editar ruta" : "Nueva ruta"}</h3>
        <div className="space-y-3">
          <input
            placeholder="Nombre"
            value={r.nombre}
            onChange={(e) => setR({ ...r, nombre: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-muted border border-border"
          />
          <select
            value={r.diaSemana ?? ""}
            onChange={(e) => setR({ ...r, diaSemana: e.target.value === "" ? undefined : Number(e.target.value) })}
            className="w-full px-3 py-2 rounded-xl bg-muted border border-border"
          >
            <option value="">Sin día fijo</option>
            {dias.map((d, i) => (
              <option key={i} value={i}>{d}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onCancel} className="flex-1 py-2 rounded-xl border border-border">Cancelar</button>
          <button
            onClick={() => {
              if (!r.nombre.trim()) return alert("Nombre requerido");
              onSave(r);
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
