import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { PawPrint, Heart } from "lucide-react";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [rol, setRol] = useState("");
  const [form, setForm] = useState({ nombre: "", apellido: "", telefono: "", ciudad: "", zona: "" });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleSave = async () => {
    setSaving(true);
    const me = await base44.auth.me();
    const existente = await base44.entities.Usuario.filter({ created_by_id: me.id });
    const data = { ...form, rol, perfil_completo: true };
    if (existente.length > 0) {
      await base44.entities.Usuario.update(existente[0].id, data);
    } else {
      await base44.entities.Usuario.create(data);
    }
    navigate("/");
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#F9F7F4] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#F97316] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <PawPrint className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-[#1A1A2E]">Machipet</h1>
          <p className="text-gray-500 text-sm font-semibold">Con amor y cuidado</p>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100 animate-fade-in">
            <h2 className="font-black text-[#1A1A2E] text-xl mb-1">¿Cómo usarás Machipet?</h2>
            <p className="text-gray-500 text-sm mb-5">Elige tu rol para personalizar tu experiencia.</p>
            <div className="space-y-3">
              <button
                onClick={() => { setRol("dueno"); setStep(2); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-[#F97316] hover:bg-orange-50 transition-all text-left"
              >
                <span className="text-3xl">🐕</span>
                <div>
                  <p className="font-bold text-[#1A1A2E]">Soy dueño de mascota</p>
                  <p className="text-sm text-gray-500">Busco cuidadores confiables</p>
                </div>
              </button>
              <button
                onClick={() => { setRol("cuidador"); setStep(2); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-[#F97316] hover:bg-orange-50 transition-all text-left"
              >
                <span className="text-3xl">🤲</span>
                <div>
                  <p className="font-bold text-[#1A1A2E]">Soy cuidador de mascotas</p>
                  <p className="text-sm text-gray-500">Quiero ofrecer mis servicios</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100 animate-fade-in">
            <h2 className="font-black text-[#1A1A2E] text-xl mb-1">Tu información básica</h2>
            <p className="text-gray-500 text-sm mb-5">Para personalizar tu experiencia.</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nombre</label>
                  <input
                    className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#F97316] transition-colors"
                    placeholder="Nombre"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Apellido</label>
                  <input
                    className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#F97316] transition-colors"
                    placeholder="Apellido"
                    value={form.apellido}
                    onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Teléfono</label>
                <input
                  className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#F97316] transition-colors"
                  placeholder="+52 664 000 0000"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Ciudad</label>
                <select
                  className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#F97316] transition-colors bg-white"
                  value={form.ciudad}
                  onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                >
                  <option value="">Selecciona tu ciudad</option>
                  <option value="Ensenada">Ensenada</option>
                  <option value="Tijuana">Tijuana</option>
                  <option value="Mexicali">Mexicali</option>
                  <option value="Rosarito">Rosarito</option>
                  <option value="Tecate">Tecate</option>
                  <option value="CDMX">CDMX</option>
                  <option value="Guadalajara">Guadalajara</option>
                  <option value="Monterrey">Monterrey</option>
                  <option value="Otra">Otra</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Colonia / Zona</label>
                <input
                  className="mt-1 w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#F97316] transition-colors"
                  placeholder="Tu colonia o zona"
                  value={form.zona}
                  onChange={(e) => setForm({ ...form, zona: e.target.value })}
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving || !form.nombre || !form.ciudad}
                className="w-full mt-2 bg-[#F97316] hover:bg-[#EA6A0A] disabled:opacity-50 text-white font-black rounded-2xl py-3 transition-all shadow-md"
              >
                {saving ? "Guardando..." : "Empezar →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}