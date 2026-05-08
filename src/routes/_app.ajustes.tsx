import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useStorageSync } from "@/hooks/useStorageSync";
import { exportBackup, importBackup, getAdminPin, setAdminPin } from "@/lib/storage";
import { Download, Upload, Share2, Lock } from "lucide-react";

export const Route = createFileRoute("/_app/ajustes")({
  component: AjustesPage,
});

function AjustesPage() {
  useStorageSync();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pin, setPin] = useState(getAdminPin());

  const filename = () => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    return `backup_ventas_Salsoa_fecha_${dd}-${mm}-${yy}.json`;
  };

  const doShareOrDownload = async () => {
    const data = exportBackup();
    const json = JSON.stringify(data, null, 2);
    const name = filename();
    const blob = new Blob([json], { type: "application/json" });
    const file = new File([blob], name, { type: "application/json" });
    // Web Share API con archivos
    if (typeof navigator !== "undefined" && (navigator as any).canShare?.({ files: [file] })) {
      try {
        await (navigator as any).share({ files: [file], title: name, text: "Respaldo de ventas" });
        return;
      } catch (e) {
        // continúa al fallback
      }
    }
    // Fallback: descargar
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const onImport = async (file: File) => {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      if (!confirm("Esto reemplazará tus datos actuales. ¿Continuar?")) return;
      importBackup(json);
      alert("Respaldo restaurado.");
    } catch (e: any) {
      alert("Error al importar: " + e.message);
    }
  };

  return (
    <div className="space-y-4 max-w-md">
      <h2 className="text-xl font-bold">Ajustes</h2>

      <section className="rounded-2xl bg-card border border-border/50 p-4 space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Share2 className="w-4 h-4 text-primary" /> Respaldo
        </h3>
        <p className="text-sm text-muted-foreground">
          Comparte el respaldo por WhatsApp, Drive, etc. con el nombre <code>{filename()}</code>.
        </p>
        <button
          onClick={doShareOrDownload}
          className="w-full py-2 rounded-xl gradient-primary text-white font-semibold flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" /> Respaldar / Compartir
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full py-2 rounded-xl border border-border font-semibold flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" /> Importar respaldo
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onImport(f);
            e.target.value = "";
          }}
        />
      </section>

      <section className="rounded-2xl bg-card border border-border/50 p-4 space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" /> PIN de administrador
        </h3>
        <input
          type="text"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-muted border border-border"
        />
        <button
          onClick={() => {
            if (pin.length < 4) return alert("Mínimo 4 caracteres");
            setAdminPin(pin);
            alert("PIN actualizado");
          }}
          className="w-full py-2 rounded-xl gradient-primary text-white font-semibold"
        >
          Guardar PIN
        </button>
      </section>
    </div>
  );
}
