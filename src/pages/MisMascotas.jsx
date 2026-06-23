import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, PawPrint, Pencil, Trash2, X, Check } from "lucide-react";

const EMPTY_FORM = {
  nombre: "", especie: "perro", raza: "", edad_anios: "", peso_kg: "", sexo: "macho",
  foto_url: "", enfermedades: "", medicamentos: "", vacunas_al_dia: false,
  alergias: "", agresividad: "ninguna", ansiedad: "ninguna",
  rutina_diaria: "", convivencia_animales: true, convivencia_ninos: true, notas_especiales: "",
};

export default function MisMascotas() {
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => { loadMascotas(); }, []);

  const loadMascotas = async () => {
    const me = await base44.auth.me();
    const data = await base44.entities.Mascota.filter({ dueno_id: me.id });
    setMascotas(data);
    setLoading(false);
  };

  const openNew = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };
  const openEdit = (m) => {
    setForm({ ...EMPTY_FORM, ...m });
    setEditId(m.id);
    setShowForm(true);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm((f) => ({ ...f, foto_url: file_url }));
    setUploadingPhoto(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const me = await base44.auth.me();
    const data = { ...form, dueno_id: me.id, edad_anios: Number(form.edad_anios) || 0, peso_kg: Number(form.peso_kg) || 0 };
    if (editId) {
      await base44.entities.Mascota.update(editId, data);
    } else {
      await base44.entities.Mascota.create(data);
    }
    await loadMascotas();
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta mascota?")) return;
    await base44.entities.Mascota.delete(id);
    setMascotas((prev) => prev.filter((m) => m.id !== id));
  };

  if (loading) return <div className="flex justify-center items-center min-h-64"><div className="w-10 h-10 border-4 border-orange-200 border-t-[#F97316] rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1A1A2E]">Mis mascotas</h1>
          <p className="text-gray-500 text-sm">Registra a tus compañeros</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-[#F97316] text-white font-bold rounded-2xl px-4 py-2.5 text-sm shadow-md hover:bg-[#EA6A0A] transition-all">
          <Plus size={16} /> Agregar
        </button>
      </div>

      {mascotas.length === 0 && !showForm && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🐾</div>
          <h3 className="font-black text-[#1A1A2E] text-lg mb-2">Aún no tienes mascotas registradas</h3>
          <p className="text-gray-500 text-sm mb-5">Agrega a tus compañeros para poder solicitar servicios.</p>
          <button onClick={openNew} className="bg-[#F97316] text-white font-bold rounded-2xl px-6 py-3 shadow-md hover:bg-[#EA6A0A] transition-all">
            + Agregar mi primera mascota
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {mascotas.map((m) => (
          <div key={m.id} className="bg-white rounded-2xl p-4 shadow-sm border border-orange-50 flex items-center gap-4">
            {m.foto_url ? (
              <img src={m.foto_url} alt={m.nombre} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center flex-shrink-0 text-3xl">
                {m.especie === "perro" ? "🐕" : m.especie === "gato" ? "🐈" : "🐾"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-black text-[#1A1A2E] truncate">{m.nombre}</p>
              <p className="text-sm text-gray-500 capitalize">{m.especie}{m.raza ? ` · ${m.raza}` : ""}</p>
              <div className="flex gap-2 mt-1 flex-wrap">
                {m.edad_anios > 0 && <span className="text-xs bg-orange-50 text-orange-600 rounded-full px-2 py-0.5 font-semibold">{m.edad_anios} años</span>}
                {m.peso_kg > 0 && <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 font-semibold">{m.peso_kg} kg</span>}
                {m.vacunas_al_dia && <span className="text-xs bg-green-100 text-green-600 rounded-full px-2 py-0.5 font-semibold">✓ Vacunas</span>}
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => openEdit(m)} className="w-8 h-8 rounded-xl hover:bg-orange-50 flex items-center justify-center text-gray-400 hover:text-[#F97316] transition-all">
                <Pencil size={14} />
              </button>
              <button onClick={() => handleDelete(m.id)} className="w-8 h-8 rounded-xl hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl">
              <h2 className="font-black text-[#1A1A2E] text-lg">{editId ? "Editar mascota" : "Nueva mascota"}</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Foto */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-orange-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {form.foto_url ? <img src={form.foto_url} className="w-full h-full object-cover" alt="mascota" /> : <PawPrint className="text-[#F97316]" size={28} />}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Foto</label>
                  <label className="cursor-pointer text-sm font-bold text-[#F97316] border-2 border-[#F97316] rounded-xl px-3 py-1.5 hover:bg-orange-50 transition-all">
                    {uploadingPhoto ? "Subiendo..." : "Subir foto"}
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nombre *</label>
                  <input className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316]" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Especie *</label>
                  <select className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316] bg-white" value={form.especie} onChange={(e) => setForm({ ...form, especie: e.target.value })}>
                    <option value="perro">Perro 🐕</option>
                    <option value="gato">Gato 🐈</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Raza</label>
                  <input className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316]" value={form.raza} onChange={(e) => setForm({ ...form, raza: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Sexo</label>
                  <select className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316] bg-white" value={form.sexo} onChange={(e) => setForm({ ...form, sexo: e.target.value })}>
                    <option value="macho">Macho</option>
                    <option value="hembra">Hembra</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Edad (años)</label>
                  <input type="number" min="0" className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316]" value={form.edad_anios} onChange={(e) => setForm({ ...form, edad_anios: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Peso (kg)</label>
                  <input type="number" min="0" step="0.1" className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316]" value={form.peso_kg} onChange={(e) => setForm({ ...form, peso_kg: e.target.value })} />
                </div>
              </div>

              <div className="space-y-3 border-t border-gray-100 pt-3">
                <p className="font-bold text-[#1A1A2E] text-sm">Salud y comportamiento</p>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Enfermedades</label>
                  <textarea className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316] resize-none" rows={2} placeholder="Ninguna o describe..." value={form.enfermedades} onChange={(e) => setForm({ ...form, enfermedades: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Medicamentos</label>
                  <textarea className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316] resize-none" rows={2} placeholder="Ninguno o nombre, dosis y horario..." value={form.medicamentos} onChange={(e) => setForm({ ...form, medicamentos: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Alergias</label>
                  <input className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316]" placeholder="Alimentos, productos..." value={form.alergias} onChange={(e) => setForm({ ...form, alergias: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Agresividad</label>
                    <select className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316] bg-white" value={form.agresividad} onChange={(e) => setForm({ ...form, agresividad: e.target.value })}>
                      <option value="ninguna">Ninguna</option>
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Ansiedad</label>
                    <select className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316] bg-white" value={form.ansiedad} onChange={(e) => setForm({ ...form, ansiedad: e.target.value })}>
                      <option value="ninguna">Ninguna</option>
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Rutina diaria</label>
                  <textarea className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316] resize-none" rows={2} placeholder="Horario de comida, paseos..." value={form.rutina_diaria} onChange={(e) => setForm({ ...form, rutina_diaria: e.target.value })} />
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-[#F97316]" checked={form.vacunas_al_dia} onChange={(e) => setForm({ ...form, vacunas_al_dia: e.target.checked })} />
                    <span className="text-sm font-semibold text-gray-700">Vacunas al día</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-[#F97316]" checked={form.convivencia_animales} onChange={(e) => setForm({ ...form, convivencia_animales: e.target.checked })} />
                    <span className="text-sm font-semibold text-gray-700">Convive con animales</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-[#F97316]" checked={form.convivencia_ninos} onChange={(e) => setForm({ ...form, convivencia_ninos: e.target.checked })} />
                    <span className="text-sm font-semibold text-gray-700">Con niños</span>
                  </label>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Notas especiales</label>
                  <textarea className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316] resize-none" rows={2} placeholder="Cualquier cosa importante..." value={form.notas_especiales} onChange={(e) => setForm({ ...form, notas_especiales: e.target.value })} />
                </div>
              </div>

              <button onClick={handleSave} disabled={saving || !form.nombre} className="w-full bg-[#F97316] hover:bg-[#EA6A0A] disabled:opacity-50 text-white font-black rounded-2xl py-3 transition-all shadow-md">
                {saving ? "Guardando..." : editId ? "Guardar cambios" : "Agregar mascota"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}