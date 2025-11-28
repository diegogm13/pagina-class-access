import React, { useEffect, useState } from "react";
import MenuMaestro from "./menuMaestro";
import "../styles/maestro.css";

// 🍪 Función para leer cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(";").shift());
  }
  return null;
};

const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

const HorarioMaestro = () => {
  const [horario, setHorario] = useState([]);

  useEffect(() => {
    const userDataCookie = getCookie("userData");
    if (!userDataCookie) {
      window.location.href = "/"; // Redirige al login si no hay cookie
      return;
    }

    try {
      JSON.parse(userDataCookie); // solo para validar que sea JSON válido
    } catch {
      window.location.href = "/";
      return;
    }

    // --- Inicializar horario desde localStorage ---
    const saved = localStorage.getItem("horario");
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        setHorario(parsed);
      } else {
        throw new Error("Formato inválido");
      }
    } catch {
      const inicial = Array.from({ length: 8 }).map((_, idx) => ({
        hora: `${7 + idx}:00 - ${8 + idx}:00`,
        ...Object.fromEntries(dias.map((d) => [d, ""])),
      }));
      setHorario(inicial);
      localStorage.setItem("horario", JSON.stringify(inicial));
    }
  }, []);

  const actualizarValor = (index, campo, valor) => {
    const nuevoHorario = [...horario];
    nuevoHorario[index][campo] = valor;
    setHorario(nuevoHorario);
    localStorage.setItem("horario", JSON.stringify(nuevoHorario));
  };

  const agregarFila = () => {
    const nuevaFila = {
      hora: "Nueva hora",
      ...Object.fromEntries(dias.map((d) => [d, ""])),
    };
    const nuevoHorario = [...horario, nuevaFila];
    setHorario(nuevoHorario);
    localStorage.setItem("horario", JSON.stringify(nuevoHorario));
  };

  const eliminarFila = (index) => {
    const nuevoHorario = horario.filter((_, i) => i !== index);
    setHorario(nuevoHorario);
    localStorage.setItem("horario", JSON.stringify(nuevoHorario));
  };

  return (
    <div className="dashboard-maestro">
      <MenuMaestro />
      <div className="contenido-maestro">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Horario de clases</h2>
          <table className="w-full table-fixed bg-white border border-gray-300 shadow rounded overflow-x-auto">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-4 border-b">Hora</th>
                {dias.map((dia) => (
                  <th key={dia} className="py-2 px-4 border-b">{dia}</th>
                ))}
                <th className="py-2 px-4 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {horario.map((fila, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border-b">
                    <input
                      type="text"
                      value={fila.hora}
                      onChange={(e) => actualizarValor(index, "hora", e.target.value)}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </td>
                  {dias.map((dia) => (
                    <td key={dia} className="py-2 px-4 border-b">
                      <input
                        type="text"
                        value={fila[dia]}
                        onChange={(e) => actualizarValor(index, dia, e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                  ))}
                  <td className="py-2 px-4 border-b text-center">
                    <button
                      onClick={() => eliminarFila(index)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4">
            <button
              onClick={agregarFila}
              className="px-8 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Agregar fila
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorarioMaestro;
