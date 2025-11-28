import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import MenuAdmin from "./menuAdmi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/reportes.css";
import { useNavigate } from "react-router-dom";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

// 🍪 Utilidad para obtener cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(";").shift());
  }
  return null;
};

const Reportes = () => {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const [asistencias, setAsistencias] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroGrupo, setFiltroGrupo] = useState("");
  const [totalClases, setTotalClases] = useState(0);
  const [inicioCuatri, setInicioCuatri] = useState("");
  const [finCuatri, setFinCuatri] = useState("");
  const [clasesEfectivas, setClasesEfectivas] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Validación de cookie en lugar de localStorage
  useEffect(() => {
    const userDataCookie = getCookie("userData");

    if (!userDataCookie) {
      navigate("/");
      return;
    }

    try {
      const usuarioCookie = JSON.parse(userDataCookie);
      setUsuario(usuarioCookie);
    } catch (error) {
      console.error("Error al parsear cookie:", error);
      navigate("/");
      return;
    } finally {
      setCargando(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!cargando) {
      obtenerGrupos();
      obtenerAsistencias();
    }
  }, [filtroFecha, filtroGrupo, cargando]);

  const obtenerAsistencias = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filtroFecha) params.append("fecha", filtroFecha);
      if (filtroGrupo) params.append("grupo", filtroGrupo);

      const response = await fetch(`https://servidor-class-access.vercel.app/api/asistencias/reportes?${params.toString()}`, {
        credentials: "include" // 🍪 Incluir cookies en la solicitud
      });
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
      const response = await fetch("https://servidor-class-access.vercel.app/api/grupos", {
        credentials: "include" // 🍪 Incluir cookies en la solicitud
      });
      const data = await response.json();
      setGrupos(data);
    } catch (error) {
      console.error("Error al obtener grupos:", error);
    }
  };

  const asistenciasFiltradas = asistencias.filter(() => true);

  const datosPorEdificio = asistenciasFiltradas.reduce((acc, cur) => {
    const key = cur.edificio;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const datosEdificio = Object.entries(datosPorEdificio).map(([key, value]) => ({ 
    edificio: key, 
    clases: value 
  }));

  const descargarListaPDF = async () => {
    if (!filtroFecha || !filtroGrupo) {
      alert("Debes seleccionar una fecha y un grupo para descargar la lista.");
      return;
    }

    const alumnos = asistenciasFiltradas.filter(a => a.priv_usu === 1);
    const maestro = asistenciasFiltradas.find(a => a.priv_usu === 2);

    if (!alumnos.length && !maestro) {
      alert("No hay registros de asistencia para ese filtro.");
      return;
    }

    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Lista de Asistencia", 20, 20);
      doc.setFontSize(12);
      doc.text(`Fecha: ${filtroFecha}`, 20, 30);
      doc.text(`Grupo: ${filtroGrupo}`, 20, 40);

      if (maestro) {
        doc.text(`Maestro: ${maestro.nombre_usu} ${maestro.ap_usu} ${maestro.am_usu} - ${maestro.no_empleado}`, 20, 50);
      }

      const agrupado = {};
      alumnos.forEach(a => {
        const key = `${a.nombre_aula} - ${a.edificio}`;
        if (!agrupado[key]) agrupado[key] = [];
        agrupado[key].push(a);
      });

      let firstPage = true;
      for (const aulaEdificio in agrupado) {
        if (!firstPage) doc.addPage();
        firstPage = false;
        doc.setFontSize(14);
        doc.text(`Aula - Edificio: ${aulaEdificio}`, 20, 60);
        autoTable(doc, {
          startY: 70,
          head: [["Nombre", "Matrícula", "Entrada", "Salida"]],
          body: agrupado[aulaEdificio].map(a => [
            `${a.nombre_usu} ${a.ap_usu} ${a.am_usu}`,
            a.matricula,
            a.hora_entrada,
            a.hora_salida || "No registrada"
          ]),
          styles: {
            cellPadding: 5,
            fontSize: 10,
            valign: 'middle'
          },
          headStyles: {
            fillColor: '#4a6ef5',
            textColor: 'white',
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: '#f8fafc'
          }
        });
      }

      doc.save(`asistencia_${filtroGrupo}_${filtroFecha}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar el documento PDF");
    }
  };

  const imprimirLista = () => {
    const nuevaVentana = window.open("", "_blank");
    if (!nuevaVentana) return;
    
    nuevaVentana.document.write(`
      <html>
        <head>
          <title>Lista de Asistencia</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1, h2, h3 { color: #1e3a8a; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4a6ef5; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 20px; }
            .info { margin-bottom: 15px; }
            @media print {
              body { padding: 0; margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Lista de Asistencia</h1>
            <div class="info">
              <p><strong>Fecha:</strong> ${filtroFecha}</p>
              <p><strong>Grupo:</strong> ${filtroGrupo}</p>
    `);

    const maestro = asistenciasFiltradas.find(a => a.priv_usu === 2);
    if (maestro) {
      nuevaVentana.document.write(`
        <p><strong>Maestro:</strong> ${maestro.nombre_usu} ${maestro.ap_usu} ${maestro.am_usu} - ${maestro.no_empleado}</p>
      `);
    }

    nuevaVentana.document.write(`
          </div>
        </div>
    `);

    const agrupado = {};
    asistenciasFiltradas.filter(a => a.priv_usu === 1).forEach(a => {
      const key = `${a.nombre_aula} - ${a.edificio}`;
      if (!agrupado[key]) agrupado[key] = [];
      agrupado[key].push(a);
    });

    Object.entries(agrupado).forEach(([key, alumnos]) => {
      nuevaVentana.document.write(`
        <h2>${key}</h2>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Matrícula</th>
              <th>Entrada</th>
              <th>Salida</th>
            </tr>
          </thead>
          <tbody>
      `);

      alumnos.forEach(a => {
        nuevaVentana.document.write(`
          <tr>
            <td>${a.nombre_usu} ${a.ap_usu} ${a.am_usu}</td>
            <td>${a.matricula}</td>
            <td>${a.hora_entrada}</td>
            <td>${a.hora_salida || "No registrada"}</td>
          </tr>
        `);
      });

      nuevaVentana.document.write(`
          </tbody>
        </table>
      `);
    });

    nuevaVentana.document.write(`
          <button class="no-print" onclick="window.print()" style="
            background: #4a6ef5;
            color: white;
            border: none;
            padding: 10px 20px;
            margin: 20px auto;
            display: block;
            cursor: pointer;
            border-radius: 5px;
          ">Imprimir</button>
        </body>
      </html>
    `);

    nuevaVentana.document.close();
  };

  const porcentaje = totalClases > 0 ? Math.round((clasesEfectivas / totalClases) * 100) : 0;

  if (cargando) return <div className="loading">Cargando información...</div>;

  return (
    <div className="dashboard-administrador">
      <MenuAdmin />
      <main className="contenido-administrador reportes-container">
        <div className="reportes-header">
          <h1>Reportes de Asistencias</h1>
          <p>Genera reportes y visualiza estadísticas de asistencia</p>
        </div>

        <div className="filtros-container">
          <div className="filtros">
            <div className="filtro-group">
              <label htmlFor="fecha">Fecha:</label>
              <input
                id="fecha"
                type="date"
                value={filtroFecha}
                onChange={e => setFiltroFecha(e.target.value)}
              />
            </div>
            
            <div className="filtro-group">
              <label htmlFor="grupo">Grupo:</label>
              <input
                id="grupo"
                list="listaGrupos"
                placeholder="Selecciona un grupo"
                value={filtroGrupo}
                onChange={e => setFiltroGrupo(e.target.value)}
              />
              <datalist id="listaGrupos">
                {grupos.map((g, index) => (
                  <option key={index} value={g} />
                ))}
              </datalist>
            </div>
            
            <div className="filtro-actions">
              <button 
                className="btn-descargar"
                onClick={descargarListaPDF}
                disabled={isLoading}
              >
                {isLoading ? "Generando..." : "Descargar PDF"}
              </button>
              <button 
                className="btn-imprimir"
                onClick={imprimirLista}
                disabled={isLoading}
              >
                Imprimir Lista
              </button>
            </div>
          </div>
        </div>

        <div className="graficas-container">
          <div className="grafica-card">
            <h3 className="grafica-title">Asistencias por Edificio</h3>
            <div className="grafica-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosEdificio}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="edificio" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="clases" fill="#4a6ef5" name="Clases" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="resumen-container">
          <h3 className="resumen-title">Resumen de Asistencias</h3>
          <div className="resumen-grid">
            <div className="resumen-item">
              <div className="resumen-value">{asistenciasFiltradas.length}</div>
              <div className="resumen-label">Registros totales</div>
            </div>
            <div className="resumen-item">
              <div className="resumen-value">{totalClases}</div>
              <div className="resumen-label">Clases programadas</div>
            </div>
            <div className="resumen-item">
              <div className="resumen-value">{clasesEfectivas}</div>
              <div className="resumen-label">Clases efectivas</div>
            </div>
            <div className="resumen-item">
              <div className="resumen-value">{porcentaje}%</div>
              <div className="resumen-label">Efectividad</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reportes;
