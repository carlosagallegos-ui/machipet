import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, Users, CheckCircle, X, ClipboardList, AlertTriangle, TrendingUp } from "lucide-react";
import ServiceBadge from "@/components/ServiceBadge";
import EstadoBadge from "@/components/EstadoBadge";

const TABS = ["Resumen", "Cuidadores", "Servicios", "Incidencias"];

export default function AdminPanel() {
  const [tab, setTab] = useState("Resumen");
  const [cuidadores, setCuidadores] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [incidencias, setIncidencias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const [c, s, i, u] = await Promise.all([
      base44.entities.PerfilCuidador.list("-created_date", 100),
      base44.entities.Servicio.list("-created_date", 100),
      base44.entities.Incidencia.list("-created_date", 50),
      base44.entities.Usuario.list("-created_date", 100),
    ]);
    setCuidadores(c);
    setServicios(s);
    setIncidencias(i);
    setUsuarios(u);
    setLoading(false);
  };

  const handleVerificar = async (id, estado) => {
    await base44.entities.PerfilCuidador.update(id, { estado_verificacion: estado });
    setCuidadores((prev) => prev.map((c) => c.id === id ? { ...c, estado_verificacion: estado } : c));
  };

  const handleIncidencia = async (id, estado) => {
    await base44.entities.Incidencia.update(id, { estado });
    setIncidencias((prev) => prev.map((i) => i.id === id ? { ...i, estado } : i));
  };

  const completados = servicios.filter((s) => s.estado === "completado");
  const activos = servicios.filter((s) => ["confirmado", "activo"].includes(s.estado));
  const ingresoTotal = completados.reduce((sum, s) => sum + (s.comision_plataforma || 0), 0);
  const avgRating = cuidadores.filter((c) => c.calificacion_promedio > 0).reduce((sum, c, _, arr) => sum + c.calificacion_promedio / arr.length, 0);

  if (loading) return <div className="flex justify-center items-center min-h-64"><div className="w-10 h-10 border-4 border-orange-200 border-t-[#F97316] rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#1A1A2E] rounded-2xl flex items-center justify-center">
          <Shield className="text-white" size={18} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-[#1A1A2E]">Panel Admin</h1>
          <p className="text-gray-500 text-sm">Machipet Operations</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === t ? "bg-[#1A1A2E] text-white" : "bg-white text-gray-500 border border-gray-100 hover:border-gray-200"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Resumen" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Usuarios", value: usuarios.length, icon: Users, color: "text-blue-600 bg-blue-50" },
              { label: "Cuidadores", value: cuidadores.filter((c) => c.estado_verificacion === "aprobado").length, icon: Shield, color: "text-green-600 bg-green-50" },
              { label: "Servicios activos", value: activos.length, icon: ClipboardList, color: "text-orange-600 bg-orange-50" },
              { label: "Completados", value: completados.length, icon: CheckCircle, color: "text-purple-600 bg-purple-50" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${stat.color}`}>
                  <stat.icon size={16} />
                </div>
                <p className="text-2xl font-black text-[#1A1A2E]">{stat.value}</p>
                <p className="text-xs text-gray-500 font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-[#F97316]" />
              <p className="font-black text-[#1A1A2E]">Métricas financieras</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ingresos por comisiones</span>
                <span className="font-black text-[#F97316]">${ingresoTotal.toLocaleString("es-MX")} MXN</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ticket promedio</span>
                <span className="font-bold text-[#1A1A2E]">{completados.length > 0 ? `$${Math.round(completados.reduce((s, x) => s + (x.precio_acordado || 0), 0) / completados.length).toLocaleString("es-MX")} MXN` : "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Calificación promedio</span>
                <span className="font-bold text-[#1A1A2E]">{avgRating > 0 ? `⭐ ${avgRating.toFixed(1)}` : "Sin datos"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Incidencias abiertas</span>
                <span className={`font-bold ${incidencias.filter((i) => i.estado === "abierta").length > 0 ? "text-red-500" : "text-green-600"}`}>
                  {incidencias.filter((i) => i.estado === "abierta").length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Cuidadores pendientes</span>
                <span className={`font-bold ${cuidadores.filter((c) => c.estado_verificacion === "pendiente").length > 0 ? "text-yellow-600" : "text-green-600"}`}>
                  {cuidadores.filter((c) => c.estado_verificacion === "pendiente").length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "Cuidadores" && (
        <div className="space-y-3">
          {cuidadores.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No hay cuidadores registrados.</div>
          ) : cuidadores.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {c.foto_url ? <img src={c.foto_url} alt={c.nombre} className="w-10 h-10 rounded-xl object-cover" /> : <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-lg">🤲</div>}
                  <div>
                    <p className="font-bold text-[#1A1A2E]">{c.nombre}</p>
                    <p className="text-xs text-gray-500">{c.ciudad}{c.zona ? `, ${c.zona}` : ""}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  c.estado_verificacion === "aprobado" ? "bg-green-100 text-green-700" :
                  c.estado_verificacion === "rechazado" ? "bg-red-100 text-red-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>{c.estado_verificacion}</span>
              </div>
              {c.bio && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{c.bio}</p>}
              <div className="flex gap-1 mb-2 flex-wrap">
                {(c.servicios_ofrecidos || []).map((s) => <ServiceBadge key={s} tipo={s} />)}
              </div>
              {c.estado_verificacion === "pendiente" && (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleVerificar(c.id, "aprobado")} className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 font-bold rounded-xl px-3 py-1.5 text-xs hover:bg-green-100 transition-all">
                    <CheckCircle size={12} /> Aprobar
                  </button>
                  <button onClick={() => handleVerificar(c.id, "rechazado")} className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 font-bold rounded-xl px-3 py-1.5 text-xs hover:bg-red-100 transition-all">
                    <X size={12} /> Rechazar
                  </button>
                </div>
              )}
              {c.estado_verificacion === "aprobado" && (
                <button onClick={() => handleVerificar(c.id, "pendiente")} className="text-xs text-gray-400 hover:text-red-500 font-semibold mt-1">
                  Revocar aprobación
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "Servicios" && (
        <div className="space-y-3">
          {servicios.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No hay servicios registrados.</div>
          ) : servicios.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <ServiceBadge tipo={s.tipo_servicio} />
                  <EstadoBadge estado={s.estado} />
                </div>
                {s.codigo_unico && <span className="text-xs font-bold text-gray-400">{s.codigo_unico}</span>}
              </div>
              <p className="font-bold text-[#1A1A2E] text-sm">{s.nombre_mascota}</p>
              <p className="text-xs text-gray-500">Dueño: {s.nombre_dueno} · Cuidador: {s.nombre_cuidador}</p>
              <p className="text-xs text-gray-400 mt-1">{s.fecha_inicio}{s.fecha_fin !== s.fecha_inicio ? ` → ${s.fecha_fin}` : ""}</p>
              {s.precio_acordado > 0 && (
                <p className="text-xs font-bold text-[#F97316] mt-1">
                  ${s.precio_acordado} MXN · Comisión: ${s.comision_plataforma} MXN
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "Incidencias" && (
        <div className="space-y-3">
          {incidencias.length === 0 ? (
            <div className="text-center py-12 text-gray-400">Sin incidencias registradas. 🎉</div>
          ) : incidencias.map((inc) => (
            <div key={inc.id} className={`bg-white rounded-2xl p-4 shadow-sm border ${inc.estado === "abierta" ? "border-red-200" : "border-gray-100"}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className={inc.estado === "abierta" ? "text-red-500" : "text-gray-400"} />
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${
                    inc.estado === "abierta" ? "bg-red-100 text-red-700" :
                    inc.estado === "en_proceso" ? "bg-yellow-100 text-yellow-700" :
                    "bg-green-100 text-green-700"
                  }`}>{inc.estado.replace("_", " ")}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold capitalize">{inc.tipo}</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-1">{inc.descripcion}</p>
              <div className="flex gap-2 mt-2">
                {inc.estado !== "en_proceso" && <button onClick={() => handleIncidencia(inc.id, "en_proceso")} className="text-xs font-bold text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-1 hover:bg-yellow-100 transition-all">En proceso</button>}
                {inc.estado !== "resuelta" && <button onClick={() => handleIncidencia(inc.id, "resuelta")} className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 rounded-xl px-3 py-1 hover:bg-green-100 transition-all">Marcar resuelta</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}