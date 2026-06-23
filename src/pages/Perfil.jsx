import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { LogOut, User, Star, PawPrint, Settings } from "lucide-react";
import { SERVICIOS, formatearPrecio } from "@/lib/machipet-utils";
import ServiceBadge from "@/components/ServiceBadge";

const CIUDADES = ["Ensenada", "Tijuana", "Mexicali", "Rosarito", "Tecate", "CDMX", "Guadalajara", "Monterrey", "Otra"];

export default function Perfil() {
  const [me, setMe] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [perfilCuidador, setPerfilCuidador] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [cuidadorForm, setCuidadorForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const meData = await base44.auth.me();
    setMe(meData);
    const perfiles = await base44.entities.Usuario.filter({ created_by_id: meData.id });
    const p = perfiles[0] || null;
    setPerfil(p);
    setForm(p || { rol: "dueno" });
    if (p?.rol === "cuidador") {
      const pc = await base44.entities.PerfilCuidador.filter({ usuario_id: meData.id });
      const pcd = pc[0] || { usuario_id: meData.id, nombre: meData.full_name || "" };
      setPerfilCuidador(pcd);
      setCuidadorForm(pcd);
    }
    setLoading(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingFoto(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm((f) => ({ ...f, foto_url: file_url }));
    setUploadingFoto(false);
  };

  const handleSave = async () => {
    setSaving(true);
    if (perfil) {
      await base44.entities.Usuario.update(perfil.id, form);
    } else {
      const meData = await base44.auth.me();
      await base44.entities.Usuario.create({ ...form, created_by_id: meData.id });
    }
    if (perfil?.rol === "cuidador") {
      const meData = await base44.auth.me();
      const pcData = { ...cuidadorForm, usuario_id: meData.id };
      if (perfilCuidador?.id) {
        await base44.entities.PerfilCuidador.update(perfilCuidador.id, pcData);
      } else {
        await base44.entities.PerfilCuidador.create(pcData);
      }
    }
    await loadData();
    setEditMode(false);
    setSaving(false);
  };

  const handleLogout = async () => {
    await base44.auth.logout("/");
  };

  const toggleServicio = (s) => {
    const curr = cuidadorForm.servicios_ofrecidos || [];
    if (curr.includes(s)) {
      setCuidadorForm((f) => ({ ...f, servicios_ofrecidos: curr.filter((x) => x !== s) }));
    } else {
      setCuidadorForm((f) => ({ ...f, servicios_ofrecidos: [...curr, s] }));
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-64"><div className="w-10 h-10 border-4 border-orange-200 border-t-[#F97316] rounded-full animate-spin" /></div>;

  const isCuidador = perfil?.rol === "cuidador";

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#1A1A2E]">Mi perfil</h1>
        <div className="flex gap-2">
          <button onClick={() => setEditMode(!editMode)} className="flex items-center gap-2 bg-orange-50 text-[#F97316] border-2 border-[#F97316] font-bold rounded-xl px-3 py-2 text-sm hover:bg-orange-100 transition-all">
            <Settings size={14} /> {editMode ? "Cancelar" : "Editar"}
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl px-3 py-2 text-sm transition-all">
            <LogOut size={14} /> Salir
          </button>
        </div>
      </div>

      {/* Perfil card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-orange-50">
        <div className="flex gap-4 items-center mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-orange-100 flex items-center justify-center flex-shrink-0">
              {(editMode ? form.foto_url : perfil?.foto_url) ? (
                <img src={editMode ? form.foto_url : perfil?.foto_url} className="w-full h-full object-cover" alt="perfil" />
              ) : (
                <User size={32} className="text-[#F97316]" />
              )}
            </div>
            {editMode && (
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#F97316] rounded-lg flex items-center justify-center cursor-pointer shadow-md">
                <span className="text-white text-xs font-bold">+</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            )}
          </div>
          <div>
            <p className="font-black text-[#1A1A2E] text-lg">{me?.full_name || "Usuario"}</p>
            <p className="text-sm text-gray-500">{me?.email}</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${isCuidador ? "bg-orange-100 text-[#F97316]" : "bg-blue-100 text-blue-700"}`}>
              {isCuidador ? "🤲 Cuidador" : "🐾 Dueño de mascota"}
            </span>
          </div>
        </div>

        {editMode ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nombre</label>
                <input className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316]" value={form.nombre || ""} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Apellido</label>
                <input className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316]" value={form.apellido || ""} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Teléfono</label>
              <input className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316]" value={form.telefono || ""} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Ciudad</label>
                <select className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316] bg-white" value={form.ciudad || ""} onChange={(e) => setForm({ ...form, ciudad: e.target.value })}>
                  <option value="">Selecciona</option>
                  {CIUDADES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Zona</label>
                <input className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316]" value={form.zona || ""} onChange={(e) => setForm({ ...form, zona: e.target.value })} />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-sm">
            {perfil?.telefono && <div><span className="text-gray-400">Tel: </span><span className="font-semibold text-[#1A1A2E]">{perfil.telefono}</span></div>}
            {perfil?.ciudad && <div><span className="text-gray-400">Ciudad: </span><span className="font-semibold text-[#1A1A2E]">{perfil.ciudad}{perfil.zona ? `, ${perfil.zona}` : ""}</span></div>}
          </div>
        )}
      </div>

      {/* Perfil de cuidador */}
      {isCuidador && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-orange-50">
          <h2 className="font-black text-[#1A1A2E] mb-3">Perfil de cuidador</h2>
          {editMode ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nombre público</label>
                <input className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316]" value={cuidadorForm.nombre || ""} onChange={(e) => setCuidadorForm({ ...cuidadorForm, nombre: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Bio / Presentación</label>
                <textarea className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316] resize-none" rows={3} value={cuidadorForm.bio || ""} onChange={(e) => setCuidadorForm({ ...cuidadorForm, bio: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Años de experiencia</label>
                <input type="number" min="0" className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316]" value={cuidadorForm.experiencia_anios || ""} onChange={(e) => setCuidadorForm({ ...cuidadorForm, experiencia_anios: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Servicios que ofreces</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(SERVICIOS).map(([key, s]) => {
                    const active = (cuidadorForm.servicios_ofrecidos || []).includes(key);
                    return (
                      <button key={key} type="button" onClick={() => toggleServicio(key)} className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${active ? "border-[#F97316] bg-orange-50 text-[#F97316]" : "border-gray-100 text-gray-500"}`}>
                        {s.icon} {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[["tarifa_paseo", "Tarifa paseo (MXN)"], ["tarifa_guarderia", "Guardería/día (MXN)"], ["tarifa_hospedaje", "Hospedaje/noche (MXN)"], ["tarifa_bano", "Tarifa baño (MXN)"]].map(([k, lbl]) => (
                  <div key={k}>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{lbl}</label>
                    <input type="number" min="0" className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316]" value={cuidadorForm[k] || ""} onChange={(e) => setCuidadorForm({ ...cuidadorForm, [k]: Number(e.target.value) })} />
                  </div>
                ))}
              </div>
              <div className="flex gap-4 flex-wrap">
                {[["acepta_perros", "Acepta perros"], ["acepta_gatos", "Acepta gatos"], ["acepta_especiales", "Necesidades especiales"], ["disponible", "Disponible"]].map(([k, lbl]) => (
                  <label key={k} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-[#F97316]" checked={cuidadorForm[k] ?? false} onChange={(e) => setCuidadorForm({ ...cuidadorForm, [k]: e.target.checked })} />
                    <span className="text-sm font-semibold text-gray-700">{lbl}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {perfilCuidador?.bio && <p className="text-sm text-gray-600">{perfilCuidador.bio}</p>}
              <div>
                <p className="text-xs text-gray-400 font-semibold mb-2">SERVICIOS</p>
                <div className="flex flex-wrap gap-2">
                  {(perfilCuidador?.servicios_ofrecidos || []).map((s) => <ServiceBadge key={s} tipo={s} size="md" />)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Star size={14} className="text-[#F97316]" />
                <span className="font-bold text-[#1A1A2E]">{perfilCuidador?.calificacion_promedio || 0} · {perfilCuidador?.total_resenias || 0} reseñas</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-2">
                <p className="text-xs font-bold text-gray-400 mb-1">ESTADO VERIFICACIÓN</p>
                <span className={`text-sm font-bold ${
                  perfilCuidador?.estado_verificacion === "aprobado" ? "text-green-600" :
                  perfilCuidador?.estado_verificacion === "rechazado" ? "text-red-500" : "text-yellow-600"
                }`}>
                  {perfilCuidador?.estado_verificacion === "aprobado" ? "✓ Aprobado" :
                   perfilCuidador?.estado_verificacion === "rechazado" ? "✗ Rechazado" : "⏳ Pendiente de verificación"}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {editMode && (
        <button onClick={handleSave} disabled={saving} className="w-full bg-[#F97316] hover:bg-[#EA6A0A] text-white font-black rounded-2xl py-3 transition-all shadow-md disabled:opacity-50">
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      )}
    </div>
  );
}