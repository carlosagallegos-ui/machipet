import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Camera, Send, CheckCircle, X, AlertTriangle } from "lucide-react";
import { SERVICIOS, ESTADOS_SERVICIO, formatearPrecio } from "@/lib/machipet-utils";
import ServiceBadge from "@/components/ServiceBadge";
import EstadoBadge from "@/components/EstadoBadge";
import StarRating from "@/components/StarRating";

export default function DetalleServicio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [servicio, setServicio] = useState(null);
  const [evidencias, setEvidencias] = useState([]);
  const [mascota, setMascota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [descFoto, setDescFoto] = useState("");
  const [tipoFoto, setTipoFoto] = useState("actualizacion");
  const [showCalificar, setShowCalificar] = useState(false);
  const [calificacion, setCalificacion] = useState(5);
  const [resenia, setResenia] = useState("");
  const [saving, setSaving] = useState(false);
  const [showIncidencia, setShowIncidencia] = useState(false);
  const [incForm, setIncForm] = useState({ tipo: "otro", descripcion: "" });
  const [guardandoInc, setGuardandoInc] = useState(false);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    const meData = await base44.auth.me();
    setMe(meData);
    const perfiles = await base44.entities.Usuario.filter({ created_by_id: meData.id });
    setPerfil(perfiles[0] || null);
    const [srv, evs] = await Promise.all([
      base44.entities.Servicio.get(id),
      base44.entities.Evidencia.filter({ servicio_id: id }, "-created_date"),
    ]);
    setServicio(srv);
    setEvidencias(evs);
    if (srv?.mascota_id) {
      const m = await base44.entities.Mascota.get(srv.mascota_id);
      setMascota(m);
    }
    setLoading(false);
  };

  const isCuidador = me?.id === servicio?.cuidador_id || perfil?.rol === "cuidador";

  const handleAccion = async (accion) => {
    setSaving(true);
    const updates = {};
    if (accion === "confirmar") updates.estado = "confirmado";
    if (accion === "iniciar") updates.estado = "activo";
    if (accion === "completar") updates.estado = "completado";
    if (accion === "cancelar") updates.estado = "cancelado";
    const updated = await base44.entities.Servicio.update(id, updates);
    setServicio(updated);
    setSaving(false);
    if (accion === "completar") setShowCalificar(true);
  };

  const handleSubirFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingFoto(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.Evidencia.create({
      servicio_id: id,
      cuidador_id: me.id,
      tipo: tipoFoto,
      foto_url: file_url,
      descripcion: descFoto,
    });
    setDescFoto("");
    await loadData();
    setUploadingFoto(false);
  };

  const handleCalificar = async () => {
    setSaving(true);
    if (isCuidador) {
      await base44.entities.Servicio.update(id, { calificacion_cuidador_a_dueno: calificacion, resenia_cuidador: resenia });
    } else {
      await base44.entities.Servicio.update(id, { calificacion_dueño_a_cuidador: calificacion, resenia_dueño: resenia });
      // Update caregiver rating
      const perfiles = await base44.entities.PerfilCuidador.filter({ usuario_id: servicio.cuidador_id });
      if (perfiles.length > 0) {
        const p = perfiles[0];
        const totalR = (p.total_resenias || 0) + 1;
        const newAvg = ((p.calificacion_promedio || 0) * (totalR - 1) + calificacion) / totalR;
        await base44.entities.PerfilCuidador.update(p.id, { calificacion_promedio: Math.round(newAvg * 10) / 10, total_resenias: totalR });
      }
    }
    setShowCalificar(false);
    await loadData();
    setSaving(false);
  };

  const handleReportarIncidencia = async () => {
    setGuardandoInc(true);
    await base44.entities.Incidencia.create({ servicio_id: id, reportado_por: me.id, ...incForm });
    setShowIncidencia(false);
    setGuardandoInc(false);
    alert("Incidencia reportada. El equipo de Machipet se comunicará contigo.");
  };

  if (loading) return <div className="flex justify-center items-center min-h-64"><div className="w-10 h-10 border-4 border-orange-200 border-t-[#F97316] rounded-full animate-spin" /></div>;
  if (!servicio) return <div className="text-center py-20"><p className="text-gray-500">Servicio no encontrado.</p></div>;

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 font-semibold text-sm hover:text-[#F97316] transition-colors">
        <ArrowLeft size={16} /> Mis servicios
      </button>

      {/* Header */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-orange-50">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ServiceBadge tipo={servicio.tipo_servicio} size="md" />
              <EstadoBadge estado={servicio.estado} />
            </div>
            <h1 className="text-xl font-black text-[#1A1A2E]">{servicio.nombre_mascota}</h1>
          </div>
          {servicio.codigo_unico && (
            <div className="bg-gray-50 rounded-xl px-3 py-1.5 text-right">
              <p className="text-xs text-gray-400 font-semibold">Código</p>
              <p className="font-black text-[#1A1A2E] text-sm">{servicio.codigo_unico}</p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-400 font-semibold">DUEÑO</p>
            <p className="font-bold text-[#1A1A2E]">{servicio.nombre_dueno}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold">CUIDADOR</p>
            <p className="font-bold text-[#1A1A2E]">{servicio.nombre_cuidador}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold">FECHA</p>
            <p className="font-bold text-[#1A1A2E]">{servicio.fecha_inicio}{servicio.fecha_fin !== servicio.fecha_inicio ? ` → ${servicio.fecha_fin}` : ""}</p>
          </div>
          {servicio.precio_acordado > 0 && (
            <div>
              <p className="text-xs text-gray-400 font-semibold">PRECIO</p>
              <p className="font-bold text-[#F97316]">{formatearPrecio(servicio.precio_acordado)}</p>
            </div>
          )}
        </div>
        {servicio.mensaje_dueño && (
          <div className="mt-3 bg-orange-50 rounded-xl p-3">
            <p className="text-xs font-bold text-orange-400 mb-1">Mensaje del dueño</p>
            <p className="text-sm text-gray-700">{servicio.mensaje_dueño}</p>
          </div>
        )}
      </div>

      {/* Ficha mascota */}
      {mascota && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-orange-50">
          <h2 className="font-black text-[#1A1A2E] mb-3">Ficha de {mascota.nombre}</h2>
          <div className="flex gap-4 items-start mb-3">
            {mascota.foto_url ? (
              <img src={mascota.foto_url} alt={mascota.nombre} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center text-2xl flex-shrink-0">
                {mascota.especie === "perro" ? "🐕" : "🐈"}
              </div>
            )}
            <div className="text-sm space-y-0.5">
              <p className="font-bold text-[#1A1A2E] capitalize">{mascota.especie}{mascota.raza ? ` · ${mascota.raza}` : ""}</p>
              {mascota.edad_anios > 0 && <p className="text-gray-500">{mascota.edad_anios} años · {mascota.peso_kg} kg</p>}
              {mascota.vacunas_al_dia && <p className="text-green-600 font-semibold">✓ Vacunas al día</p>}
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {[
              { label: "Agresividad", v: mascota.agresividad },
              { label: "Ansiedad", v: mascota.ansiedad },
              { label: "Enfermedades", v: mascota.enfermedades },
              { label: "Medicamentos", v: mascota.medicamentos },
              { label: "Alergias", v: mascota.alergias },
              { label: "Rutina", v: mascota.rutina_diaria },
              { label: "Notas", v: mascota.notas_especiales },
            ].filter((i) => i.v && i.v !== "ninguna").map((item) => (
              <div key={item.label} className="flex gap-2">
                <span className="text-gray-400 font-semibold w-28 flex-shrink-0">{item.label}:</span>
                <span className="text-gray-700 capitalize">{item.v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acciones del cuidador */}
      {isCuidador && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-orange-50">
          <h2 className="font-black text-[#1A1A2E] mb-3">Acciones del cuidador</h2>
          <div className="flex flex-wrap gap-2">
            {servicio.estado === "solicitado" && (
              <>
                <button onClick={() => handleAccion("confirmar")} disabled={saving} className="flex items-center gap-2 bg-[#F97316] text-white font-bold rounded-xl px-4 py-2 text-sm hover:bg-[#EA6A0A] transition-all disabled:opacity-50">
                  <CheckCircle size={14} /> Aceptar solicitud
                </button>
                <button onClick={() => handleAccion("cancelar")} disabled={saving} className="flex items-center gap-2 bg-red-50 text-red-500 font-bold rounded-xl px-4 py-2 text-sm hover:bg-red-100 transition-all disabled:opacity-50">
                  <X size={14} /> Rechazar
                </button>
              </>
            )}
            {servicio.estado === "confirmado" && (
              <button onClick={() => handleAccion("iniciar")} disabled={saving} className="flex items-center gap-2 bg-green-500 text-white font-bold rounded-xl px-4 py-2 text-sm hover:bg-green-600 transition-all disabled:opacity-50">
                <CheckCircle size={14} /> Iniciar servicio
              </button>
            )}
            {servicio.estado === "activo" && (
              <button onClick={() => handleAccion("completar")} disabled={saving} className="flex items-center gap-2 bg-[#1A1A2E] text-white font-bold rounded-xl px-4 py-2 text-sm hover:bg-gray-800 transition-all disabled:opacity-50">
                <CheckCircle size={14} /> Marcar completado
              </button>
            )}
          </div>

          {/* Subir evidencia */}
          {["confirmado", "activo"].includes(servicio.estado) && (
            <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
              <p className="font-bold text-[#1A1A2E] text-sm">Subir evidencia</p>
              <select className="w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316] bg-white" value={tipoFoto} onChange={(e) => setTipoFoto(e.target.value)}>
                <option value="recepcion">Recepción de mascota</option>
                <option value="actualizacion">Actualización durante servicio</option>
                <option value="entrega">Entrega final</option>
              </select>
              <input className="w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316]" placeholder="Descripción (opcional)" value={descFoto} onChange={(e) => setDescFoto(e.target.value)} />
              <label className="cursor-pointer flex items-center gap-2 bg-orange-50 text-[#F97316] border-2 border-[#F97316] rounded-xl px-4 py-2 font-bold text-sm hover:bg-orange-100 transition-all w-fit">
                <Camera size={14} />
                {uploadingFoto ? "Subiendo..." : "Subir foto"}
                <input type="file" accept="image/*" className="hidden" onChange={handleSubirFoto} disabled={uploadingFoto} />
              </label>
            </div>
          )}
        </div>
      )}

      {/* Evidencias */}
      {evidencias.length > 0 && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-orange-50">
          <h2 className="font-black text-[#1A1A2E] mb-3">Evidencia del servicio</h2>
          <div className="grid grid-cols-2 gap-3">
            {evidencias.map((e) => (
              <div key={e.id} className="space-y-1">
                {e.foto_url && <img src={e.foto_url} alt="evidencia" className="w-full aspect-square object-cover rounded-xl" />}
                <div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    e.tipo === "recepcion" ? "bg-blue-100 text-blue-700" :
                    e.tipo === "entrega" ? "bg-green-100 text-green-700" :
                    "bg-orange-100 text-orange-700"
                  }`}>{e.tipo}</span>
                  {e.descripcion && <p className="text-xs text-gray-500 mt-1">{e.descripcion}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reporte final */}
      {isCuidador && servicio.estado === "activo" && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-orange-50">
          <h2 className="font-black text-[#1A1A2E] mb-3">Reporte final</h2>
          <textarea
            className="w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316] resize-none"
            rows={4}
            placeholder="Describe cómo estuvo el servicio, comportamiento de la mascota..."
            value={servicio.reporte_final || ""}
            onChange={(e) => setServicio((s) => ({ ...s, reporte_final: e.target.value }))}
          />
          <button
            onClick={async () => { await base44.entities.Servicio.update(id, { reporte_final: servicio.reporte_final }); alert("Reporte guardado"); }}
            className="mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl px-4 py-2 text-sm transition-all"
          >
            Guardar reporte
          </button>
        </div>
      )}

      {servicio.reporte_final && !isCuidador && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-orange-50">
          <h2 className="font-black text-[#1A1A2E] mb-2">Reporte del cuidador</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{servicio.reporte_final}</p>
        </div>
      )}

      {/* Acciones del dueño */}
      {!isCuidador && servicio.estado === "activo" && (
        <button onClick={() => handleAccion("completar")} disabled={saving} className="w-full bg-[#F97316] hover:bg-[#EA6A0A] text-white font-black rounded-2xl py-3 transition-all shadow-md disabled:opacity-50">
          Confirmar entrega y completar servicio
        </button>
      )}

      {/* Reportar incidencia */}
      {["confirmado", "activo"].includes(servicio.estado) && (
        <button onClick={() => setShowIncidencia(true)} className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-500 font-bold rounded-2xl py-2.5 text-sm transition-all border-2 border-red-100">
          <AlertTriangle size={14} /> Reportar incidencia
        </button>
      )}

      {/* Calificación */}
      {(showCalificar || (servicio.estado === "completado" && !servicio.calificacion_dueño_a_cuidador && !isCuidador) || (servicio.estado === "completado" && !servicio.calificacion_cuidador_a_dueno && isCuidador)) && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-orange-50">
          <h2 className="font-black text-[#1A1A2E] mb-3">
            {isCuidador ? "Califica al dueño" : "Califica al cuidador"}
          </h2>
          <div className="space-y-4">
            <div className="flex justify-center">
              <StarRating value={calificacion} onChange={setCalificacion} size="lg" />
            </div>
            <textarea
              className="w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316] resize-none"
              rows={3}
              placeholder="Escribe tu reseña..."
              value={resenia}
              onChange={(e) => setResenia(e.target.value)}
            />
            <button onClick={handleCalificar} disabled={saving} className="w-full bg-[#F97316] hover:bg-[#EA6A0A] text-white font-black rounded-2xl py-3 transition-all shadow-md disabled:opacity-50">
              {saving ? "Guardando..." : "Enviar calificación"}
            </button>
          </div>
        </div>
      )}

      {/* Modal incidencia */}
      {showIncidencia && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-[#1A1A2E]">Reportar incidencia</h2>
              <button onClick={() => setShowIncidencia(false)} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tipo</label>
                <select className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316] bg-white" value={incForm.tipo} onChange={(e) => setIncForm((f) => ({ ...f, tipo: e.target.value }))}>
                  <option value="salud">Problema de salud</option>
                  <option value="extravío">Extravío</option>
                  <option value="accidente">Accidente</option>
                  <option value="conducta">Problema de conducta</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Descripción *</label>
                <textarea className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316] resize-none" rows={4} value={incForm.descripcion} onChange={(e) => setIncForm((f) => ({ ...f, descripcion: e.target.value }))} />
              </div>
              <button onClick={handleReportarIncidencia} disabled={guardandoInc || !incForm.descripcion} className="w-full bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl py-3 transition-all disabled:opacity-50">
                {guardandoInc ? "Enviando..." : "Reportar incidencia"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}