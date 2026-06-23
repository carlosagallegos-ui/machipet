import React from "react";
import { SERVICIOS } from "@/lib/machipet-utils";

export default function ServiceBadge({ tipo, size = "sm" }) {
  const s = SERVICIOS[tipo] || { label: tipo, icon: "🐾", color: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${s.color} ${
      size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
    }`}>
      {s.icon} {s.label}
    </span>
  );
}