import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, ExternalLink, Search } from "lucide-react";
import { SERVICIOS } from "@/lib/machipet-utils";

const ALIADOS_DATA = {
  veterinaria: [
    { nombre: "Clínica Veterinaria PetLife", ciudad: "Ensenada", zona: "Chapultepec", telefono: "646-123-4567", descripcion: "Consultas, vacunas, cirugías y urgencias las 24 hrs.", calificacion: 4.9 },
    { nombre: "Animal House Vet", ciudad: "Tijuana", zona: "Zona Río", telefono: "664-987-6543", descripcion: "Especialistas en dermatología y oftalmología animal.", calificacion: 4.8 },
    { nombre: "VetCare Ensenada", ciudad: "Ensenada", zona: "Centro", telefono: "646-555-2222", descripcion: "Atención preventiva, laboratorio y radiografías digitales.", calificacion: 4.7 },
    { nombre: "Hospital Veterinario del Norte", ciudad: "Mexicali", zona: "Residencial", telefono: "686-444-1111", descripcion: "UCI veterinaria y cirugía de alta especialidad.", calificacion: 4.9 },
    { nombre: "Clínica San Francisco de Asís", ciudad: "Tijuana", zona: "Playas", telefono: "664-321-7890", descripcion: "Medicina general, esterilizaciones y vacunación anual.", calificacion: 4.6 },
    { nombre: "VetExpress Rosarito", ciudad: "Rosarito", zona: "Centro", telefono: "661-200-3300", descripcion: "Consultas exprés sin cita y servicios de urgencia.", calificacion: 4.5 },
  ],
  crematorio: [
    { nombre: "Jardín de las Estrellitas", ciudad: "Ensenada", zona: "Las Flores", telefono: "646-700-8888", descripcion: "Cremación individual con certificado y urna de recuerdo. Servicio a domicilio.", calificacion: 5.0 },
    { nombre: "Alas al Cielo", ciudad: "Tijuana", zona: "Otay", telefono: "664-800-9999", descripcion: "Cremación privada o colectiva. Entrega de cenizas en 24 horas.", calificacion: 4.9 },
    { nombre: "Memorias Pet", ciudad: "Mexicali", zona: "Centro", telefono: "686-600-7777", descripcion: "Servicio integral: traslado, cremación y jardín conmemorativo.", calificacion: 4.8 },
    { nombre: "Siempre Contigo", ciudad: "Ensenada", zona: "Chapultepec", telefono: "646-900-6666", descripcion: "Urnas artesanales personalizadas y huella en cerámica.", calificacion: 4.9 },
  ],
};

export default function ServiciosAliados() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tipo = searchParams.get("tipo") || "veterinaria";
  const [busqueda, setBusqueda] = useState("");
  const [filtroCiudad, setFiltroCiudad] = useState("");

  const servicio = SERVICIOS[tipo] || SERVICIOS.veterinaria;
  const aliados = ALIADOS_DATA[tipo] || [];

  const filtrados = aliados.filter((a) => {
    const matchBusqueda = !busqueda || a.nombre.toLowerCase().includes(busqueda.toLowerCase()) || a.zona.toLowerCase().includes(busqueda.toLowerCase());
    const matchCiudad = !filtroCiudad || a.ciudad === filtroCiudad;
    return matchBusqueda && matchCiudad;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 font-semibold text-sm hover:text-[#F97316] transition-colors">
        <ArrowLeft size={16} /> Volver
      </button>

      {/* Header */}
      <div className={`rounded-3xl p-5 ${tipo === "crematorio" ? "bg-gradient-to-br from-slate-800 to-slate-900" : "bg-gradient-to-br from-rose-500 to-rose-600"}`}>
        <p className="text-4xl mb-2">{servicio.icon}</p>
        <h1 className="text-2xl font-black text-white">{servicio.label}</h1>
        <p className="text-sm mt-1 text-white/70">
          {tipo === "veterinaria"
            ? "Clínicas y hospitales veterinarios aliados de Machipet"
            : "Servicios de cremación y despedida con dignidad y amor"}
        </p>
      </div>

      {/* Nota especial crematorio */}
      {tipo === "crematorio" && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3">
          <span className="text-2xl flex-shrink-0">💙</span>
          <div>
            <p className="font-bold text-slate-700 text-sm">Acompañamiento en momentos difíciles</p>
            <p className="text-xs text-slate-500 mt-0.5">Todos nuestros aliados de crematorio ofrecen atención empática y servicio personalizado para despedirte con amor de tu mascota.</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-50 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-100 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#F97316] transition-colors"
            placeholder={`Buscar ${servicio.label.toLowerCase()}...`}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <select
          className="w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#F97316] bg-white"
          value={filtroCiudad}
          onChange={(e) => setFiltroCiudad(e.target.value)}
        >
          <option value="">Todas las ciudades</option>
          {["Ensenada", "Tijuana", "Mexicali", "Rosarito", "Tecate"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Resultados */}
      <div>
        <p className="text-sm text-gray-500 font-semibold mb-3">{filtrados.length} aliado{filtrados.length !== 1 ? "s" : ""} disponible{filtrados.length !== 1 ? "s" : ""}</p>
        {filtrados.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-black text-[#1A1A2E] mb-2">Sin resultados</h3>
            <p className="text-gray-500 text-sm">Intenta cambiar los filtros o la ciudad.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtrados.map((a, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-orange-50 hover:border-orange-200 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-black text-[#1A1A2E]">{a.nombre}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <MapPin size={11} />
                      {a.ciudad}{a.zona ? `, ${a.zona}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-[#F97316]">★</span>
                    <span className="text-sm font-bold text-[#1A1A2E]">{a.calificacion.toFixed(1)}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{a.descripcion}</p>
                <a
                  href={`tel:${a.telefono}`}
                  className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA6A0A] text-white font-bold rounded-xl px-4 py-2 text-sm transition-all shadow-sm"
                >
                  <Phone size={13} />
                  {a.telefono}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA unirse */}
      <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 text-center">
        <p className="font-bold text-[#1A1A2E] text-sm mb-1">¿Eres {tipo === "veterinaria" ? "una clínica veterinaria" : "un servicio de cremación"}?</p>
        <p className="text-xs text-gray-500 mb-3">Únete a la red de aliados Machipet y llega a más familias.</p>
        <a
          href="mailto:aliados@machipet.mx"
          className="inline-flex items-center gap-2 bg-[#1A1A2E] text-white font-bold rounded-xl px-4 py-2 text-sm hover:bg-gray-800 transition-all"
        >
          <ExternalLink size={13} />
          Quiero ser aliado
        </a>
      </div>
    </div>
  );
}