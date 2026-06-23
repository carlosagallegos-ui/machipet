import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { MapPin, Star, Shield, ArrowLeft, Calendar, X } from "lucide-react";
import { SERVICIOS, formatearPrecio, generarCodigoUnico, calcularComision } from "@/lib/machipet-utils";
import ServiceBadge from "@/components/ServiceBadge";
import StarRating from "@/components/StarRating";
import MascotaCard from "@/components/MascotaCard";

export default function PerfilCuidadorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cuidador, setCuidador] = useState(null);
  const [resenias, setResenias] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSolicitud, setShowSolicitud] = useState(false);
  const [form, setForm] = useState({ tipo_servicio: "", mascota_id: "", fecha_inicio: "", fecha_fin: "", mensaje: "" });
  const [enviando, setEnviando] = useState(false);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    const [c, me] = await Promise.all([
      base44.entities.PerfilCuidador.get(id),
      base44.auth.me(),
    ]);
    setCuidador(c);
    const [srvs, myCats] = await Promise.all([
      base44.entities.Servicio.filter({ cuidador_id: c.usuario_id, estado: "completado" }, "-created_date", 20),
      base44.entities.Mascota.filter({ dueno_id: me.id }),
    ]);
    const resenasConComent = srvs.filter((s) => s.resenia_dueño);
    setResenias(resenasConComent);
    setMascotas(myCats);
    setLoading(false);
  };

  const handleSolicitar = async () => {
    if (!form.tipo_servicio || !form.mascota_id || !form.fecha_inicio) return;
    setEnviando(true);
    const me = await base44.auth.me();
    const mascota = mascotas.find((m) => m.id === form.mascota_id);
    const tarifa = getTarifa(form.tipo_servicio);
    const comision = tarifa ? calcularComision(tarifa) : 0;
    await base44.entities.Servicio.create({
      codigo_unico: generarCodigoUnico(),
      dueno_id: me.id,
      cuidador_id: cuidador.usuario_id,
      mascota_id: form.mascota_id,
      tipo_servicio: form.tipo_servicio,
      estado: "solicitado",
      fecha_inicio: form.fecha_inicio,
      fecha_fin: form.fecha_fin || form.fecha_inicio,
      precio_acordado: tarifa || 0,
      comision_plataforma: comision,
      mensaje_dueño: form.mensaje,
      nombre_mascota: mascota?.nombre || "",
      nombre_cuidador: cuidador?.nombre || "",
      nombre_dueno: me.full_name || "",
    });
    setEnviando(false);
    setShowSolicitud(false);
    navigate("/mis-servicios");
  };

  const getTarifa = (tipo) => {
    if (!cuidador) return 0;
    const map = { paseo: cuidador.tarifa_paseo, guarderia: cuidador.tarifa_guarderia, hospedaje: cuidador.tarifa_hospedaje, bano: cuidador.tarifa_bano };
    return map[tipo] || 0;
  };

  if (loading) return <div className="flex justify-center items-center min-h-64"><div className="w-10 h-10 border-4 border-orange-200 border-t-[#F97316] rounded-full animate-spin" /></div>;
  if (!cuidador) return <div className="text-center py-20"><p className="text-gray-500">Cuidador no encontrado.</p></div>;

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 font-semibold text-sm hover:text-[#F97316] transition-colors">
        <ArrowLeft size={16} /> Volver
      </button>

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-50">
        <div className="flex gap-4 items-start">
          {cuidador.foto_url ? (
            <img src={cuidador.foto_url} alt={cuidador.nombre} className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-3xl flex-shrink-0">🤲</div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[#1A1A2E]">{cuidador.nombre}</h1>
              <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                <Shield size={10} /> Verificado
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <MapPin size={13} />
              {cuidador.ciudad}{cuidador.zona ? `, ${cuidador.zona}` : ""}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <StarRating value={cuidador.calificacion_promedio || 0} readonly size="sm" />
              <span className="text-sm font-bold text-[#1A1A2E] ml-1">
                {cuidador.calificacion_promedio > 0 ? cuidador.calificacion_promedio.toFixed(1) : "Nuevo"}
              </span>
              {cuidador.total_resenias > 0 && <span className="text-xs text-gray-400">· {cuidador.total_resenias} reseñas</span>}
            </div>
          </div>
        </div>
        {cuidador.bio && <p className="text-sm text-gray-600 mt-4 leading-relaxed">{cuidador.bio}</p>}
        {cuidador.experiencia_anios > 0 && (
          <p className="text-sm text-gray-500 mt-2">🐾 {cuidador.experiencia_anios} año{cuidador.experiencia_anios !== 1 ? "s" : ""} de experiencia</p>
        )}
      </div>

      {/* Servicios y tarifas */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-orange-50">
        <h2 className="font-black text-[#1A1A2E] mb-3">Servicios y tarifas</h2>
        <div className="space-y-2">
          {(cuidador.servicios_ofrecidos || []).map((s) => (
            <div key={s} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <ServiceBadge tipo={s} size="md" />
              <span className="font-black text-[#F97316]">{formatearPrecio(getTarifa(s))}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Acepta */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-orange-50">
        <h2 className="font-black text-[#1A1A2E] mb-3">Acepta</h2>
        <div className="flex flex-wrap gap-2">
          {cuidador.acepta_perros && <span className="bg-orange-50 text-orange-600 text-sm font-bold px-3 py-1 rounded-full">🐕 Perros</span>}
          {cuidador.acepta_gatos && <span className="bg-orange-50 text-orange-600 text-sm font-bold px-3 py-1 rounded-full">🐈 Gatos</span>}
          {cuidador.acepta_especiales && <span className="bg-orange-50 text-orange-600 text-sm font-bold px-3 py-1 rounded-full">❤️ Necesidades especiales</span>}
        </div>
      </div>

      {/* Reseñas */}
      {resenias.length > 0 && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-orange-50">
          <h2 className="font-black text-[#1A1A2E] mb-3">Reseñas</h2>
          <div className="space-y-3">
            {resenias.slice(0, 5).map((r) => (
              <div key={r.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <StarRating value={r.calificacion_dueño_a_cuidador || 5} readonly size="sm" />
                  <span className="text-xs text-gray-400">{r.nombre_dueno}</span>
                </div>
                <p className="text-sm text-gray-600">{r.resenia_dueño}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="sticky bottom-20 md:bottom-4">
        <button
          onClick={() => setShowSolicitud(true)}
          className="w-full bg-[#F97316] hover:bg-[#EA6A0A] text-white font-black rounded-2xl py-4 text-base shadow-xl transition-all"
        >
          Solicitar servicio
        </button>
      </div>

      {/* Modal solicitud */}
      {showSolicitud && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl">
              <h2 className="font-black text-[#1A1A2E] text-lg">Solicitar servicio</h2>
              <button onClick={() => setShowSolicitud(false)} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tipo de servicio *</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {(cuidador.servicios_ofrecidos || []).map((s) => (
                    <button
                      key={s}
                      onClick={() => setForm((f) => ({ ...f, tipo_servicio: s }))}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                        form.tipo_servicio === s ? "border-[#F97316] bg-orange-50 text-[#F97316]" : "border-gray-100 text-gray-600 hover:border-orange-200"
                      }`}
                    >
                      {SERVICIOS[s]?.icon} {SERVICIOS[s]?.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Mascota *</label>
                {mascotas.length === 0 ? (
                  <p className="text-sm text-gray-500 mt-2 bg-orange-50 rounded-xl p-3">Primero registra una mascota en "Mis mascotas".</p>
                ) : (
                  <div className="space-y-2 mt-2">
                    {mascotas.map((m) => (
                      <MascotaCard key={m.id} mascota={m} selected={form.mascota_id === m.id} onClick={() => setForm((f) => ({ ...f, mascota_id: m.id }))} />
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Fecha inicio *</label>
                  <input type="date" className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316]" value={form.fecha_inicio} onChange={(e) => setForm((f) => ({ ...f, fecha_inicio: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Fecha fin</label>
                  <input type="date" className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316]" value={form.fecha_fin} onChange={(e) => setForm((f) => ({ ...f, fecha_fin: e.target.value }))} />
                </div>
              </div>
              {form.tipo_servicio && getTarifa(form.tipo_servicio) > 0 && (
                <div className="bg-orange-50 rounded-2xl p-3 text-sm">
                  <p className="font-bold text-[#1A1A2E]">Tarifa: <span className="text-[#F97316]">{formatearPrecio(getTarifa(form.tipo_servicio))}</span></p>
                  <p className="text-gray-500 text-xs mt-0.5">El pago se coordina directamente con el cuidador.</p>
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Mensaje (opcional)</label>
                <textarea className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316] resize-none" rows={3} placeholder="Cuéntale algo sobre tu mascota o el servicio..." value={form.mensaje} onChange={(e) => setForm((f) => ({ ...f, mensaje: e.target.value }))} />
              </div>
              <button
                onClick={handleSolicitar}
                disabled={enviando || !form.tipo_servicio || !form.mascota_id || !form.fecha_inicio}
                className="w-full bg-[#F97316] hover:bg-[#EA6A0A] disabled:opacity-50 text-white font-black rounded-2xl py-3 transition-all shadow-md"
              >
                {enviando ? "Enviando solicitud..." : "Enviar solicitud"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}