"use client";

import { useEffect } from "react";

/** Oculta chatbot y modales del sitio público dentro del portal /facturas */
export function FacturasPortalChrome() {
  useEffect(() => {
    document.body.classList.add("facturas-portal");
    return () => document.body.classList.remove("facturas-portal");
  }, []);
  return null;
}