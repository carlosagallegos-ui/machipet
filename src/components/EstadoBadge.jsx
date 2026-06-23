import React from "react";
import { ESTADOS_SERVICIO } from "@/lib/machipet-utils";

export default function EstadoBadge({ estado }) {
  const e = ESTADOS_SERVICIO[estado] || { label: estado, color: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center rounded-full text-xs font-bold px-2 py-0.5 ${e.color}`}>
      {e.label}
    </span>
  );
}