import React, { useState, useEffect } from "react";
import MenuMaestro from "./menuMaestro";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/maestro.css";
import "../styles/listaMaestro.css";

const ListasMaestro = () => {
  const [fecha, setFecha] = useState("");
  const [clases, setClases] = useState([]);
  const [idMaestro, setIdMaestro] = useState(null);
  const [nombreMaestro, setNombreMaestro] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Función para limpiar milisegundos
  const limpiarHora = (hora) => hora ? hora.split(".")[0] : "-";

  useEffect(() => {
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
    if (usuarioGuardado) {
      setIdMaestro(usuarioGuardado.id_usu);
      setNombreMaestro(
        `${usuarioGuardado.nombre_usu} ${usuarioGuardado.ap_usu} ${usuarioGuardado.am_usu}`
      );
    } else {
      window.location.href = "/";
    }
  }, []);

  const buscarClases = () => {
    if (!idMaestro || !fecha) return;

    setCargando(true);
    setError("");

    fetch(`https://servidor-class-access.vercel.app/api/listas-maestro/${idMaestro}?fecha=${fecha}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener las clases");
        return res.json();
      })
      .then((data) => {
        setClases(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setError("No se encontraron clases para esta fecha");
        setCargando(false);
      });
  };

  const descargarPDF = (clase) => {
    const doc = new jsPDF();

    // 🔹 Limpieza de horas para el encabezado
    const entradaLimpia = limpiarHora(clase.hora_entrada);
    const salidaLimpia = limpiarHora(clase.hora_salida);

    doc.setFontSize(14);
    doc.setTextColor(12, 167, 63); 
    doc.setFont("helvetica", "bold");
    doc.text(`Lista de Asistencia`, 14, 20);

    doc.setTextColor(0, 0, 0); 
    doc.setFont("helvetica", "normal");
    doc.text(`Maestro: ${nombreMaestro}`, 14, 28);
    doc.text(`Edificio: ${clase.edificio}`, 14, 36);
    doc.text(`Aula: ${clase.aula}`, 14, 44);
    doc.text(`Hora: ${entradaLimpia} - ${salidaLimpia}`, 14, 52);
    doc.text(`Fecha: ${fecha}`, 14, 60);

    // 🔹 Filtrar horas de los alumnos
    const rows = clase.alumnos.map((a, i) => [
      i + 1,
      `${a.nombre_usu} ${a.ap_usu} ${a.am_usu}`,
      a.matricula,
      a.grupo,
      limpiarHora(a.hora_entrada),
      limpiarHora(a.hora_salida),
    ]);

    autoTable(doc, {
      startY: 70,
      headStyles: {
        fillColor: [12, 167, 63],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      head: [["#", "Nombre", "Matrícula", "Grupo", "Entrada", "Salida"]],
      body: rows,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      margin: { left: 14 },
    });

    doc.save(`Lista_${clase.edificio}_${clase.aula}_${fecha}.pdf`);
  };

  return (
    <div className="dashboard-maestro">
      <MenuMaestro />

      <main className="contenido-maestro">
        <h1 className="titulo-seccion">Listas de Asistencia</h1>

        <div className="contenedor-busqueda">
          <p className="instrucciones">Seleccione la fecha para generar la lista:</p>

          <div className="controles-busqueda">
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="input-fecha"
            />

            <button
              onClick={buscarClases}
              disabled={!idMaestro || !fecha || cargando}
              className="boton-buscar"
            >
              {cargando ? "Buscando..." : "Buscar Clases"}
            </button>
          </div>
        </div>

        {error && <p className="mensaje-error">{error}</p>}

        {cargando && (
          <div className="cargando-listas">
            <p>Cargando clases...</p>
          </div>
        )}

        <div className="contenedor-clases">
          {clases.map((clase, index) => {
            const entradaLimpia = limpiarHora(clase.hora_entrada);
            const salidaLimpia = limpiarHora(clase.hora_salida);

            return (
              <div key={index} className="tarjeta-clase">
                <div className="info-clase">
                  <h3 className="titulo-clase">
                    <span className="edificio">{clase.edificio}</span> -
                    <span className="aula"> {clase.aula}</span>
                  </h3>
                  <p className="horario">
                    {entradaLimpia} a {salidaLimpia}
                  </p>
                  <p className="total-alumnos">
                    Alumnos: {clase.alumnos.length}
                  </p>
                </div>

                <button
                  onClick={() => descargarPDF(clase)}
                  className="boton-descargar"
                >
                  Descargar Lista
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default ListasMaestro;
