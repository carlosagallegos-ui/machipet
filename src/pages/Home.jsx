import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, PawPrint, Shield, Star, ArrowRight, Heart } from "lucide-react";
import { SERVICIOS, formatearPrecio } from "@/lib/machipet-utils";
import ServiceBadge from "@/components/ServiceBadge";

export default function Home() {
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [serviciosActivos, setServiciosActivos] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const me = await base44.auth.me();
      setUsuario(me);

      const [perfiles, servicios, mismascotas] = await Promise.all([
        base44.entities.Usuario.filter({ created_by_id: me.id }),
        base44.entities.Servicio.filter({ dueno_id: me.id }, "-created_date", 3),
        base44.entities.Mascota.filter({ dueno_id: me.id }),
      ]);

      setPerfil(perfiles[0] || null);
      setServiciosActivos(servicios.filter((s) => ["solicitado", "confirmado", "activo"].includes(s.estado)));
      setMascotas(mismascotas);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="w-10 h-10 border-4 border-orange-200 border-t-[#F97316] rounded-full animate-spin" />
    </div>
  );

  const isCuidador = perfil?.rol === "cuidador";
  const nombre = usuario?.full_name?.split(" ")[0] || "amigo";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero greeting */}
      <div className="bg-gradient-to-br from-[#1A1A2E] to-[#2D2D4E] rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 text-[120px] leading-none select-none">🐾</div>
        <p className="text-orange-300 font-semibold text-sm mb-1">¡Hola, {nombre}! 👋</p>
        <h1 className="text-2xl font-black mb-2">
          {isCuidador ? "Tu panel de cuidador" : "¿Dónde estará tu mascota hoy?"}
        </h1>
        <p className="text-gray-300 text-sm mb-4">Con amor y cuidado, siempre.</p>
        {!isCuidador && (
          <Link to="/buscar" className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA6A0A] text-white font-bold rounded-2xl px-5 py-2.5 text-sm transition-all shadow-lg">
            <Search size={16} />
            Buscar cuidador
            <ArrowRight size={14} />
          </Link>
        )}
        {isCuidador && (
          <Link to="/mis-servicios" className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA6A0A] text-white font-bold rounded-2xl px-5 py-2.5 text-sm transition-all shadow-lg">
            Ver mis solicitudes
            <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-orange-50">
          <p className="text-2xl font-black text-[#F97316]">{mascotas.length}</p>
          <p className="text-xs text-gray-500 font-semibold">Mascotas</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-orange-50">
          <p className="text-2xl font-black text-[#F97316]">{serviciosActivos.length}</p>
          <p className="text-xs text-gray-500 font-semibold">Activos</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-orange-50">
          <p className="text-2xl font-black text-[#F97316]">4.9</p>
          <p className="text-xs text-gray-500 font-semibold">Tu score</p>
        </div>
      </div>

      {/* Servicios activos */}
      {serviciosActivos.length > 0 && (
        <div>
          <h2 className="font-black text-[#1A1A2E] text-lg mb-3">Servicios en curso</h2>
          <div className="space-y-3">
            {serviciosActivos.map((s) => (
              <Link
                key={s.id}
                to={`/servicio/${s.id}`}
                className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-orange-50 hover:border-orange-200 transition-all block"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ServiceBadge tipo={s.tipo_servicio} />
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      s.estado === "activo" ? "bg-green-100 text-green-700" :
                      s.estado === "confirmado" ? "bg-blue-100 text-blue-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>{s.estado === "activo" ? "En curso" : s.estado === "confirmado" ? "Confirmado" : "Solicitado"}</span>
                  </div>
                  <p className="font-bold text-[#1A1A2E] text-sm">{s.nombre_mascota || "Mascota"}</p>
                  <p className="text-xs text-gray-500">{s.nombre_cuidador || s.nombre_dueno}</p>
                </div>
                <ArrowRight size={18} className="text-gray-300" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Accesos rápidos */}
      <div>
        <h2 className="font-black text-[#1A1A2E] text-lg mb-3">¿Qué necesitas?</h2>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(SERVICIOS).map(([key, s]) => (
            <Link
              key={key}
              to={`/buscar?servicio=${key}`}
              className="bg-white rounded-2xl p-4 flex flex-col items-start gap-2 shadow-sm border border-orange-50 hover:border-orange-300 hover:shadow-md transition-all"
            >
              <span className="text-3xl">{s.icon}</span>
              <p className="font-bold text-[#1A1A2E] text-sm">{s.label}</p>
              <p className="text-xs text-gray-400">Encontrar cuidador</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Trust signals */}
      <div className="bg-orange-50 rounded-3xl p-5">
        <h3 className="font-black text-[#1A1A2E] mb-3 text-sm">¿Por qué Machipet?</h3>
        <div className="space-y-2">
          {[
            { icon: Shield, text: "Cuidadores verificados y capacitados" },
            { icon: Star, text: "Evidencia visual durante el servicio" },
            { icon: Heart, text: "Soporte ante cualquier incidencia" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                <item.icon size={14} className="text-[#F97316]" />
              </div>
              <p className="text-sm font-semibold text-gray-700">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}