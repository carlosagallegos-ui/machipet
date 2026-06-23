import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, Filter, MapPin, Star, ChevronRight } from "lucide-react";
import { SERVICIOS, formatearPrecio } from "@/lib/machipet-utils";
import ServiceBadge from "@/components/ServiceBadge";
import StarRating from "@/components/StarRating";

export default function BuscarCuidadores() {
  const [cuidadores, setCuidadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroServicio, setFiltroServicio] = useState("");
  const [filtroCiudad, setFiltroCiudad] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("servicio");
    if (s) setFiltroServicio(s);
    loadCuidadores();
  }, []);

  const loadCuidadores = async () => {
    const data = await base44.entities.PerfilCuidador.filter({ estado_verificacion: "aprobado", disponible: true });
    setCuidadores(data);
    setLoading(false);
  };

  const filtrados = cuidadores.filter((c) => {
    const matchServicio = !filtroServicio || (c.servicios_ofrecidos || []).includes(filtroServicio);
    const matchCiudad = !filtroCiudad || c.ciudad === filtroCiudad;
    const matchBusqueda = !busqueda || c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || c.zona?.toLowerCase().includes(busqueda.toLowerCase());
    return matchServicio && matchCiudad && matchBusqueda;
  });

  const getTarifa = (c) => {
    if (filtroServicio === "paseo") return c.tarifa_paseo;
    if (filtroServicio === "guarderia") return c.tarifa_guarderia;
    if (filtroServicio === "hospedaje") return c.tarifa_hospedaje;
    if (filtroServicio === "bano") return c.tarifa_bano;
    return c.tarifa_paseo || c.tarifa_guarderia || c.tarifa_hospedaje;
  };

  if (loading) return <div className="flex justify-center items-center min-h-64"><div className="w-10 h-10 border-4 border-orange-200 border-t-[#F97316] rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-[#1A1A2E]">Buscar cuidador</h1>
        <p className="text-gray-500 text-sm">Cuidadores verificados cerca de ti</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-50 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-100 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#F97316] transition-colors"
            placeholder="Buscar por nombre o zona..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select
            className="border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316] bg-white"
            value={filtroServicio}
            onChange={(e) => setFiltroServicio(e.target.value)}
          >
            <option value="">Todos los servicios</option>
            {Object.entries(SERVICIOS).map(([k, v]) => (
              <option key={k} value={k}>{v.icon} {v.label}</option>
            ))}
          </select>
          <select
            className="border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316] bg-white"
            value={filtroCiudad}
            onChange={(e) => setFiltroCiudad(e.target.value)}
          >
            <option value="">Todas las ciudades</option>
            {["Ensenada", "Tijuana", "Mexicali", "Rosarito", "Tecate", "CDMX"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <div>
        <p className="text-sm text-gray-500 font-semibold mb-3">{filtrados.length} cuidador{filtrados.length !== 1 ? "es" : ""} disponible{filtrados.length !== 1 ? "s" : ""}</p>
        {filtrados.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-black text-[#1A1A2E] mb-2">Sin resultados</h3>
            <p className="text-gray-500 text-sm">Intenta cambiar los filtros o busca en otra ciudad.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtrados.map((c) => (
              <Link
                key={c.id}
                to={`/cuidador/${c.id}`}
                className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm border border-orange-50 hover:border-orange-200 hover:shadow-md transition-all block"
              >
                {c.foto_url ? (
                  <img src={c.foto_url} alt={c.nombre} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center flex-shrink-0 text-2xl">
                    🤲
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <p className="font-black text-[#1A1A2E]">{c.nombre}</p>
                    <ChevronRight size={16} className="text-gray-300 flex-shrink-0 mt-0.5" />
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={12} className="text-[#F97316] fill-[#F97316]" />
                    <span className="text-sm font-bold text-[#1A1A2E]">{c.calificacion_promedio > 0 ? c.calificacion_promedio.toFixed(1) : "Nuevo"}</span>
                    {c.total_resenias > 0 && <span className="text-xs text-gray-400">({c.total_resenias})</span>}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <MapPin size={11} />
                    {c.ciudad}{c.zona ? `, ${c.zona}` : ""}
                  </div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {(c.servicios_ofrecidos || []).map((s) => (
                      <ServiceBadge key={s} tipo={s} />
                    ))}
                  </div>
                </div>
                {getTarifa(c) && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">desde</p>
                    <p className="font-black text-[#F97316] text-sm">{formatearPrecio(getTarifa(c))}</p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}