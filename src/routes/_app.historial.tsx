import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStorageSync } from "@/hooks/useStorageSync";
import { getHistorial, getClientes, getRutas, getAdminPin, setHistorial } from "@/lib/storage";
import { Lock, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_app/historial")({
  component: HistorialPage,
});

function HistorialPage() {
  useStorageSync();
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  if (!unlocked) {
    return (
      <div className="max-w-sm mx-auto mt-12 text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-bold text-lg">Acceso de administrador</h2>
        <p className="text-sm text-muted-foreground">Ingresa el PIN para ver el historial.</p>
        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-card border border-border text-center"
        />
        <button
          onClick={() => {
            if (pin === getAdminPin()) setUnlocked(true);
            else alert("PIN incorrecto");
          }}
          className="w-full py-2 rounded-xl gradient-primary text-white font-semibold"
        >
          Entrar
        </button>
        <p className="text-xs text-muted-foreground">PIN por defecto: 1234 (cámbialo en Ajustes)</p>
      </div>
    );
  }

  const hist = getHistorial();
  const clientes = getClientes();
  const rutas = getRutas();
  const fmt = (n: number) => n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">Historial</h2>
      {hist.length === 0 && <p className="text-muted-foreground">Sin registros.</p>}
      <ul className="space-y-2">
        {hist.map((d, idx) => {
          const ruta = rutas.find((r) => r.id === d.rutaId);
          const tot = d.visitas.reduce((a, v) => a + v.ventaEfectivo + v.ventaCredito, 0);
          const isOpen = open === d.fecha + idx;
          return (
            <li key={idx} className="rounded-2xl bg-card border border-border/50 p-3">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setOpen(isOpen ? null : d.fecha + idx)}
              >
                <div className="flex-1">
                  <div className="font-semibold">{d.fecha} · {ruta?.nombre ?? (d.adhoc ? "Fuera de ruta" : "—")}</div>
                  <div className="text-xs text-muted-foreground">
                    {d.visitas.filter((v) => v.visitado).length}/{d.visitas.length} visitas · Total {fmt(tot)}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("¿Eliminar registro?")) {
                      const next = hist.filter((_, i) => i !== idx);
                      setHistorial(next);
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-destructive/20 text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {isOpen && (
                <ul className="mt-3 space-y-1 border-t border-border pt-3">
                  {d.visitas.map((v) => {
                    const c = clientes.find((c) => c.id === v.clienteId);
                    return (
                      <li key={v.clienteId} className="text-sm flex justify-between">
                        <span className={v.visitado ? "" : "text-muted-foreground line-through"}>
                          {c?.nombre ?? "—"}
                        </span>
                        <span>{fmt(v.ventaEfectivo + v.ventaCredito)}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
