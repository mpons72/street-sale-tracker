import { createRootRoute, Outlet, HeadContent, Scripts, Link } from "@tanstack/react-router";
import styles from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "SalsaRuta — Control de venta" },
      { name: "description", content: "App para llevar control de ruta, ventas, surtido y devoluciones." },
      { name: "theme-color", content: "#e85d23" },
    ],
    links: [{ rel: "stylesheet", href: styles }],
  }),
  shellComponent: RootDocument,
  notFoundComponent: () => (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="text-muted-foreground">Página no encontrada</p>
      <Link to="/" className="text-primary underline">Volver al inicio</Link>
    </div>
  ),
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        <div id="root">{children}</div>
        <Scripts />
      </body>
    </html>
  );
}
