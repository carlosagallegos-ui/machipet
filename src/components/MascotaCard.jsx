import React from "react";
import { PawPrint } from "lucide-react";

export default function MascotaCard({ mascota, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-2xl border-2 p-4 flex items-center gap-3 transition-all ${
        selected
          ? "border-[#F97316] bg-orange-50"
          : "border-gray-100 bg-white hover:border-orange-200"
      }`}
    >
      {mascota.foto_url ? (
        <img src={mascota.foto_url} alt={mascota.nombre} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
          <PawPrint className="text-[#F97316]" size={20} />
        </div>
      )}
      <div>
        <p className="font-bold text-[#1A1A2E]">{mascota.nombre}</p>
        <p className="text-sm text-gray-500 capitalize">{mascota.especie} · {mascota.raza || "Sin raza"}</p>
      </div>
    </div>
  );
}