import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Flame, Home, MapPin, Users, Map as MapIcon, BarChart3, Settings } from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const tabs = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/ruta", label: "Ruta del día", icon: Flame },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/rutas", label: "Rutas", icon: MapPin },
  { to: "/historial", label: "Historial", icon: BarChart3 },
  { to: "/ajustes", label: "Ajustes", icon: Settings },
] as const;

function AppLayout() {
  const loc = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="px-4 pt-5 pb-2 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
          <Flame className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold leading-tight">SalsaRuta</h1>
          <p className="text-xs text-muted-foreground tracking-wider uppercase">Control de venta</p>
        </div>
      </header>

      <nav className="px-2 overflow-x-auto">
        <ul className="flex gap-1 min-w-max">
          {tabs.map((t) => {
            const active = loc.pathname === t.to || (t.to !== "/" && loc.pathname.startsWith(t.to));
            const Icon = t.icon;
            return (
              <li key={t.to}>
                <Link
                  to={t.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                    active ? "gradient-primary text-white shadow-glow" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-border/50 mt-2" />

      <main className="flex-1 p-4 pb-24">
        <Outlet />
      </main>
    </div>
  );
}
