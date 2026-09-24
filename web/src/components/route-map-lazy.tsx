"use client";

import dynamic from "next/dynamic";

// Leaflet ניגש ל-window כבר בטעינה, ולכן המפה נטענת רק בדפדפן (ssr: false).
// ssr: false מותר רק בתוך Client Component — זו הסיבה לקובץ הנפרד
export const RouteMapLazy = dynamic(() => import("./route-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-[22px] bg-brand-soft" aria-label="טוען מפה" />,
});
