import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStorageSync } from "@/hooks/useStorageSync";
import { getClientes, getRutas, iniciarDia } from "@/lib/storage";
import { Sparkles, Search, Check } from "lucide-react";

export const Route = createFileRoute("/_app/fuera-de-ruta")({
  component: FueraDeRuta,
});

function FueraDeRuta() {
  useStorageSync();
  const nav = useNavigate();
  const clientes = getClientes().filter((c) => c.activo);
  const rutas = getRutas();
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");

  const lista = clientes
    .filter((c) => c.nombre.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  const toggle = (id: string) => {
    const n = new Set(sel);
    n.has(id) ? n.delete(id) : n.add(id);
    setSel(n);
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl gradient-card p-4 text-white shadow-glow">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <h2 className="font-bold text-lg">Venta fuera de ruta</h2>
        </div>
        <p className="text-sm text-white/90 mt-1">
          Selecciona clientes específicos para crear una ruta temporal. Las ventas cuentan en su historial.
        </p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar cliente..."
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-card border border-border"
        />
      </div>

      <ul className="space-y-2">
        {lista.map((c) => {
          const ruta = rutas.find((r) => r.id === c.rutaId);
          const checked = sel.has(c.id);
          return (
            <li
              key={c.id}
              onClick={() => toggle(c.id)}
              className={`rounded-2xl p-3 border flex items-center gap-3 cursor-pointer ${
                checked ? "bg-primary/15 border-primary/50" : "bg-card border-border/50"
              }`}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${checked ? "bg-primary text-white" : "bg-muted"}`}>
                {checked && <Check className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{c.nombre}</div>
                <div className="text-xs text-muted-foreground truncate">{ruta?.nombre ?? "Sin ruta"}</div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="sticky bottom-2 pt-2">
        <button
          disabled={sel.size === 0}
          onClick={() => {
            iniciarDia("__adhoc__", { adhoc: true, clienteIds: [...sel] });
            nav({ to: "/ruta" });
          }}
          className="w-full py-3 rounded-2xl gradient-primary text-white font-bold disabled:opacity-50 shadow-glow"
        >
          Iniciar ruta temporal ({sel.size})
        </button>
      </div>
    </div>
  );
}
