import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowRight, Calendar } from "lucide-react";
import ServiceBadge from "@/components/ServiceBadge";
import EstadoBadge from "@/components/EstadoBadge";

const TABS = [
  { key: "activos", label: "Activos", estados: ["solicitado", "confirmado", "activo"] },
  { key: "completados", label: "Completados", estados: ["completado"] },
  { key: "cancelados", label: "Cancelados", estados: ["cancelado"] },
];

export default function MisServicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("activos");
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const me = await base44.auth.me();
    setUsuario(me);
    const perfiles = await base44.entities.Usuario.filter({ created_by_id: me.id });
    const p = perfiles[0] || null;
    setPerfil(p);
    let data = [];
    if (p?.rol === "cuidador") {
      data = await base44.entities.Servicio.filter({ cuidador_id: me.id }, "-created_date", 50);
    } else {
      data = await base44.entities.Servicio.filter({ dueno_id: me.id }, "-created_date", 50);
    }
    setServicios(data);
    setLoading(false);
  };

  const tabActual = TABS.find((t) => t.key === tab);
  const filtrados = servicios.filter((s) => tabActual.estados.includes(s.estado));

  if (loading) return <div className="flex justify-center items-center min-h-64"><div className="w-10 h-10 border-4 border-orange-200 border-t-[#F97316] rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-[#1A1A2E]">Mis servicios</h1>
        <p className="text-gray-500 text-sm">{perfil?.rol === "cuidador" ? "Solicitudes y servicios recibidos" : "Tus solicitudes y servicios"}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-2xl p-1 shadow-sm border border-orange-50">
        {TABS.map((t) => {
          const count = servicios.filter((s) => t.estados.includes(s.estado)).length;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1 ${
                tab === t.key ? "bg-[#F97316] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
              {count > 0 && (
                <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center ${tab === t.key ? "bg-white/30 text-white" : "bg-orange-100 text-[#F97316]"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filtrados.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="font-black text-[#1A1A2E] mb-2">Sin servicios aquí</h3>
          <p className="text-gray-500 text-sm">
            {tab === "activos" ? "No tienes servicios activos o pendientes." : `No hay servicios ${tab}.`}
          </p>
          {tab === "activos" && perfil?.rol !== "cuidador" && (
            <Link to="/buscar" className="mt-4 inline-block bg-[#F97316] text-white font-bold rounded-2xl px-5 py-2.5 text-sm shadow-md hover:bg-[#EA6A0A] transition-all">
              Buscar cuidador
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map((s) => (
            <Link
              key={s.id}
              to={`/servicio/${s.id}`}
              className="bg-white rounded-2xl p-4 shadow-sm border border-orange-50 hover:border-orange-200 hover:shadow-md transition-all block"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <ServiceBadge tipo={s.tipo_servicio} />
                  <EstadoBadge estado={s.estado} />
                </div>
                <ArrowRight size={16} className="text-gray-300 flex-shrink-0" />
              </div>
              <p className="font-black text-[#1A1A2E]">{s.nombre_mascota || "Mascota"}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                {perfil?.rol === "cuidador" ? `Dueño: ${s.nombre_dueno}` : `Cuidador: ${s.nombre_cuidador}`}
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                <Calendar size={11} />
                {s.fecha_inicio}{s.fecha_fin && s.fecha_fin !== s.fecha_inicio ? ` → ${s.fecha_fin}` : ""}
              </div>
              {s.codigo_unico && (
                <p className="text-xs font-bold text-gray-400 mt-1">Código: {s.codigo_unico}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}