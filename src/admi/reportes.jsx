import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import MenuAdmin from "./menuAdmi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/reportes.css";

const Reportes = () => {
  const [asistencias, setAsistencias] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroGrupo, setFiltroGrupo] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 🔹 Cargar datos sin validar cookies
  useEffect(() => {
    obtenerGrupos();
    obtenerAsistencias();
  }, [filtroFecha, filtroGrupo]);

  const obtenerAsistencias = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filtroFecha) params.append("fecha", filtroFecha);
      if (filtroGrupo) params.append("grupo", filtroGrupo);

      const response = await fetch(
        `https://servidor-class-access.vercel.app/api/asistencias/reportes?${params.toString()}`
      );

      const data = await response.json();
      setAsistencias(data);
    } catch (error) {
      console.error("Error al obtener asistencias:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const obtenerGrupos = async () => {
    try {
      const response = await fetch(
        "https://servidor-class-access.vercel.app/api/grupos"
      );
      const data = await response.json();
      setGrupos(data);
    } catch (error) {
      console.error("Error al obtener grupos:", error);
    }
  };

  // -------------------------------
  //   ALUMNOS EN RIESGO (Faltas)
  // -------------------------------

  // Solo alumnos
  const alumnos = asistencias.filter((a) => a.priv_usu === 1);

  // Agrupar por alumno
  const faltasPorAlumno = {};

  alumnos.forEach((a) => {
    const id = a.id_usu;

    if (!faltasPorAlumno[id]) {
      faltasPorAlumno[id] = {
        id_usu: id,
        nombre: `${a.nombre_usu} ${a.ap_usu} ${a.am_usu}`,
        matricula: a.matricula,
        asistencias: 0,
        faltas: 0,
      };
    }

    if (!a.hora_entrada) {
      faltasPorAlumno[id].faltas += 1;
    } else {
      faltasPorAlumno[id].asistencias += 1;
    }
  });

  // Convertimos a array para gráfica
  const listaRiesgo = Object.values(faltasPorAlumno)
    .map((a) => ({
      ...a,
      total: a.asistencias + a.faltas,
      porcentajeFaltas:
        a.asistencias + a.faltas === 0
          ? 0
          : Math.round((a.faltas / (a.asistencias + a.faltas)) * 100),
    }))
    .sort((a, b) => b.faltas - a.faltas) // ordenar mayor riesgo
    .slice(0, 10); // top 10

  // -------------------------------
  //   PDF de alumnos en riesgo
  // -------------------------------

  const descargarPDFRiesgo = () => {
    if (listaRiesgo.length === 0) {
      alert("No hay alumnos para generar el PDF.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Alumnos en Riesgo de Reprobar", 20, 20);

    doc.setFontSize(12);
    if (filtroFecha) doc.text(`Fecha: ${filtroFecha}`, 20, 30);
    if (filtroGrupo) doc.text(`Grupo: ${filtroGrupo}`, 20, 40);

    autoTable(doc, {
      startY: 50,
      head: [["Nombre", "Matrícula", "Faltas", "% Faltas"]],
      body: listaRiesgo.map((a) => [
        a.nombre,
        a.matricula,
        a.faltas,
        `${a.porcentajeFaltas}%`,
      ]),
    });

    doc.save(`riesgo_${filtroGrupo}_${filtroFecha}.pdf`);
  };

  return (
    <div className="dashboard-administrador">
      <MenuAdmin />

      <main className="contenido-administrador reportes-container">
        <div className="reportes-header">
          <h1>Alumnos en Riesgo de Reprobar</h1>
          <p>Basado en faltas por alumno</p>
        </div>

        {/* FILTROS */}
        <div className="filtros-container">
          <div className="filtros">
            <div className="filtro-group">
              <label htmlFor="fecha">Fecha:</label>
              <input
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
              />
            </div>

            <div className="filtro-group">
              <label htmlFor="grupo">Grupo:</label>
              <input
                list="listaGrupos"
                placeholder="Selecciona un grupo"
                value={filtroGrupo}
                onChange={(e) => setFiltroGrupo(e.target.value)}
              />
              <datalist id="listaGrupos">
                {grupos.map((g, i) => (
                  <option key={i} value={g} />
                ))}
              </datalist>
            </div>

            <div className="filtro-actions">
              <button className="btn-descargar" onClick={descargarPDFRiesgo}>
                Descargar PDF Riesgo
              </button>

              <button className="btn-imprimir" onClick={() => window.print()}>
                Imprimir Lista
              </button>
            </div>
          </div>
        </div>

        {/* GRÁFICA DE ALUMNOS EN RIESGO */}
        <div className="graficas-container">
          <div className="grafica-card">
            <h3 className="grafica-title">Top 10 Alumnos con Más Faltas</h3>
            <div className="grafica-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={listaRiesgo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="faltas" fill="#d9534f" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* TABLA RESUMEN */}
        <div className="resumen-container">
          <h3 className="resumen-title">Alumnos en Riesgo</h3>
          <div className="resumen-grid">
            {listaRiesgo.map((a, i) => (
              <div key={i} className="resumen-item">
                <div className="resumen-value">{a.faltas}</div>
                <div className="resumen-label">
                  {a.nombre} — {a.porcentajeFaltas}% faltas
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reportes;
