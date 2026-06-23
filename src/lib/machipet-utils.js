export const SERVICIOS = {
  hospedaje: { label: "Hospedaje", icon: "🏠", color: "bg-blue-100 text-blue-700" },
  guarderia: { label: "Guardería", icon: "🐾", color: "bg-purple-100 text-purple-700" },
  paseo: { label: "Paseo", icon: "🦮", color: "bg-green-100 text-green-700" },
  bano: { label: "Baño", icon: "🛁", color: "bg-cyan-100 text-cyan-700" },
};

export const ESTADOS_SERVICIO = {
  solicitado: { label: "Solicitado", color: "bg-yellow-100 text-yellow-700" },
  confirmado: { label: "Confirmado", color: "bg-blue-100 text-blue-700" },
  activo: { label: "En curso", color: "bg-green-100 text-green-700" },
  completado: { label: "Completado", color: "bg-gray-100 text-gray-700" },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-700" },
};

export const AGRESIVIDAD = {
  ninguna: "Ninguna",
  baja: "Baja",
  media: "Media",
  alta: "Alta",
};

export const generarCodigoUnico = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "MP-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const formatearPrecio = (precio) => {
  if (!precio) return "—";
  return `$${Number(precio).toLocaleString("es-MX")} MXN`;
};

export const calcularComision = (precio) => {
  return Math.round(precio * 0.15 * 100) / 100;
};

export const renderStars = (rating, max = 5) => {
  return Array.from({ length: max }, (_, i) => (i < Math.round(rating) ? "★" : "☆")).join("");
};