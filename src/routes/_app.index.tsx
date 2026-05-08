import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Flame, MapPin, Users, Sparkles, ListChecks } from "lucide-react";
import { useStorageSync } from "@/hooks/useStorageSync";
import { getClientes, getDia, getRutas, iniciarDia } from "@/lib/storage";
import { useState } from "react";

export const Route = createFileRoute("/_app/")({
  component: Inicio,
});

function Inicio() {
  useStorageSync();
  const nav = useNavigate();
  const dia = getDia();
  const clientes = getClientes();
  const rutas = getRutas();
  const [pickRuta, setPickRuta] = useState(false);

  const totalVisitas = dia?.visitas.length ?? 0;
  const visitadas = dia?.visitas.filter((v) => v.visitado).length ?? 0;
  const efectivo = dia?.visitas.reduce((a, v) => a + (v.ventaEfectivo || 0), 0) ?? 0;
  const credito = dia?.visitas.reduce((a, v) => a + (v.ventaCredito || 0), 0) ?? 0;

  const fmt = (n: number) =>
    n.toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2 });

  return (
    <div className="space-y-4">
      <section className="rounded-3xl p-6 gradient-card shadow-glow text-white relative overflow-hidden">
        <Flame className="w-20 h-20 absolute -left-2 top-6 text-white/10" />
        <div className="relative">
          <h2 className="text-3xl font-extrabold leading-tight">
            Hoy es día de ruta <span>🔥</span>
          </h2>
          <p className="text-white/90 mt-1">
            Lleva tu venta, surtido y devoluciones bajo control en cada parada.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2 bg-black/20 rounded-2xl p-4">
            <Stat label="EFECTIVO" value={fmt(efectivo)} />
            <Stat label="CRÉDITO" value={fmt(credito)} />
            <Stat label="VISITAS" value={`${visitadas}/${totalVisitas}`} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {dia ? (
              <Link
                to="/ruta"
                className="px-5 py-3 rounded-full bg-black/40 hover:bg-black/60 font-semibold flex items-center gap-2"
              >
                <ListChecks className="w-5 h-5" /> Continuar ruta
              </Link>
            ) : (
              <button
                onClick={() => setPickRuta(true)}
                disabled={rutas.length === 0}
                className="px-5 py-3 rounded-full bg-black/40 hover:bg-black/60 font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                <Flame className="w-5 h-5" /> Iniciar día de ruta
              </button>
            )}
            <Link
              to="/fuera-de-ruta"
              className="px-5 py-3 rounded-full bg-black/40 hover:bg-black/60 font-semibold flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" /> Venta fuera de ruta
            </Link>
            <Link
              to="/historial"
              className="px-5 py-3 rounded-full border border-white/40 hover:bg-white/10 font-semibold"
            >
              Ver historial
            </Link>
          </div>
        </div>
      </section>

      {pickRuta && (
        <div className="fixed inset-0 z-30 bg-black/70 flex items-end sm:items-center justify-center p-4" onClick={() => setPickRuta(false)}>
          <div className="bg-card rounded-2xl p-5 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-3">Elige la ruta de hoy</h3>
            <div className="space-y-2 max-h-72 overflow-auto">
              {rutas.map((r) => {
                const n = clientes.filter((c) => c.activo && c.rutaId === r.id).length;
                return (
                  <button
                    key={r.id}
                    className="w-full p-3 rounded-xl bg-muted hover:bg-muted/70 flex items-center justify-between"
                    onClick={() => {
                      iniciarDia(r.id);
                      setPickRuta(false);
                      nav({ to: "/ruta" });
                    }}
                  >
                    <span className="font-semibold">{r.nombre}</span>
                    <span className="text-sm text-muted-foreground">{n} clientes</span>
                  </button>
                );
              })}
            </div>
            <button onClick={() => setPickRuta(false)} className="mt-3 w-full py-2 rounded-xl border border-border">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <CardLink to="/rutas" icon={MapPin} title="Rutas" subtitle={`${rutas.length} configuradas`} />
      <CardLink to="/clientes" icon={Users} title="Clientes" subtitle={`${clientes.filter((c) => c.activo).length} activos`} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-[10px] tracking-widest text-white/80">{label}</div>
      <div className="text-lg font-extrabold">{value}</div>
    </div>
  );
}

function CardLink({
  to,
  icon: Icon,
  title,
  subtitle,
}: {
  to: string;
  icon: any;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      to={to}
      className="block rounded-2xl bg-card border border-border/50 p-4 hover:border-primary/50 transition"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <div className="font-bold text-lg">{title}</div>
          <div className="text-sm text-muted-foreground">{subtitle}</div>
        </div>
      </div>
    </Link>
  );
}
