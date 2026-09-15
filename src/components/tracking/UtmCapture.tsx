"use client";

import { useEffect } from "react";
import { captureUtmsFromUrl } from "@/lib/tracking/utms";

/** Componente sem UI — só captura UTMs da URL na primeira renderização. */
export function UtmCapture() {
  useEffect(() => {
    captureUtmsFromUrl();
  }, []);
  return null;
}
