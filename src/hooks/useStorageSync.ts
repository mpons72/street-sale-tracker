import { useEffect, useState } from "react";

export function useStorageSync() {
  const [v, setV] = useState(0);
  useEffect(() => {
    const h = () => setV((x) => x + 1);
    window.addEventListener("salsaruta:update", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("salsaruta:update", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return v;
}
