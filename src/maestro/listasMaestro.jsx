import React, { useState, useEffect } from "react";
import MenuMaestro from "./menuMaestro";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import "../styles/maestro.css";
import "../styles/listaMaestro.css";

// 🍪 Utilidad para obtener cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(";").shift());
  }
  return null;
};

const ListasMaestro = () => {
  const [fecha, setFecha] = useState("");
  const [clases, setClases] = useState([]);
  const [idMaestro, setIdMaestro] = useState(null);
  const [nombreMaestro, setNombreMaestro] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Función para limpiar milisegundos
  const limpiarHora = (hora) => (hora ? hora.split(".")[0] : "-");

  useEffect(() => {
    const userDataCookie = getCookie("userData");

    if (!userDataCookie) {
      window.location.href = "/"; // Redirige al login si no hay cookie
      return;
    }

    let usuario;
    try {
      usuario = JSON.parse(userDataCookie);
    } catch (error) {
      console.error("Error al parsear userData:", error);
      window.location.href = "/"; // Redirige si la cookie está corrupta
      return;
    }

    // Verificar que sea un profesor (priv_usu = 2)
    if (usuario.priv_usu !== 2) {
      console.warn("Usuario no es profesor");
      window.location.href = "/";
      return;
    }

    setIdMaestro(usuario.id_usu);
    setNombreMaestro(`${usuario.nombre_usu} ${usuario.ap_usu} ${usuario.am_usu}`);
  }, []);

  const buscarClases = async () => {
    if (!idMaestro || !fecha) {
      setError("Por favor selecciona una fecha");
      return;
    }

    setCargando(true);
    setError("");
    setClases([]); // Limpiar clases anteriores

    try {
      console.log("🔍 Buscando clases para:", { idMaestro, fecha });

      // 📡 Usar la nueva API con autenticación por cookies
      const response = await axios.get(
        `/api/teachers/${idMaestro}/lists`,
        {
          params: { fecha }, // Axios automáticamente convierte esto a query string
          withCredentials: true, // 🔑 Importante: envía las cookies
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      console.log("✅ Respuesta del servidor:", response.data);

      // La respuesta viene en el formato { success: true, data: [...] }
      let clasesData;
      if (response.data.success) {
        clasesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        clasesData = response.data;
      } else {
        clasesData = [];
      }

      if (clasesData && clasesData.length > 0) {
        setClases(clasesData);
        setError("");
        console.log(`✅ ${clasesData.length} clases encontradas`);
      } else {
        setClases([]);
        setError("No se encontraron clases para esta fecha");
        console.log("ℹ️ No hay clases para esta fecha");
      }

      setCargando(false);

    } catch (err) {
      console.error("❌ Error al obtener clases:", err);
      console.error("Detalles del error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      if (err.response) {
        // El servidor respondió con un código de error
        const status = err.response.status;
        const errorMessage = err.response.data?.message || err.response.data?.error;

        console.log("📊 Status:", status);
        console.log("📝 Mensaje:", errorMessage);

        switch (status) {
          case 400:
            setError(errorMessage || "Solicitud inválida. Verifica la fecha.");
            break;
          case 401:
            setError("Sesión expirada. Redirigiendo al login...");
            setTimeout(() => {
              window.location.href = "/";
            }, 2000);
            break;
          case 403:
            setError("No tienes permiso para ver estas listas");
            break;
          case 404:
            setError("No se encontraron clases para esta fecha");
            break;
          case 500:
            setError("Error en el servidor. Intenta más tarde.");
            break;
          default:
            setError(`Error ${status}: ${errorMessage || "Error al cargar las clases"}`);
        }
      } else if (err.request) {
        // La petición se hizo pero no hubo respuesta
        setError("No se pudo conectar con el servidor. Verifica tu conexión.");
        console.error("No hubo respuesta del servidor");
      } else {
        // Error al configurar la petición
        setError("Error al procesar la solicitud");
        console.error("Error de configuración:", err.message);
      }

      setClases([]);
      setCargando(false);
    }
  };

  const descargarPDF = (clase) => {
    const doc = new jsPDF();

    const entradaLimpia = limpiarHora(clase.hora_entrada);
    const salidaLimpia = limpiarHora(clase.hora_salida);

    // 📄 Encabezado del PDF
    doc.setFontSize(16);
    doc.setTextColor(2, 112, 255); // Color azul del sistema
    doc.setFont("helvetica", "bold");
    doc.text(`Lista de Asistencia`, 14, 20);

    // 📋 Información de la clase
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`Maestro: ${nombreMaestro}`, 14, 30);
    doc.text(`Edificio: ${clase.edificio}`, 14, 37);
    doc.text(`Aula: ${clase.aula}`, 14, 44);
    doc.text(`Horario: ${entradaLimpia} - ${salidaLimpia}`, 14, 51);
    doc.text(`Fecha: ${fecha}`, 14, 58);
    doc.text(`Total de alumnos: ${clase.total_alumnos || clase.alumnos.length}`, 14, 65);

    // 📊 Tabla de alumnos
    const rows = clase.alumnos.map((alumno, index) => [
      index + 1,
      `${alumno.nombre_usu} ${alumno.ap_usu} ${alumno.am_usu}`,
      alumno.matricula || "N/A",
      alumno.grupo || "N/A",
      limpiarHora(alumno.hora_entrada),
      limpiarHora(alumno.hora_salida),
    ]);

    autoTable(doc, {
      startY: 75,
      headStyles: {
        fillColor: [2, 112, 255], // Color azul del sistema
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      head: [["#", "Nombre Completo", "Matrícula", "Grupo", "Entrada", "Salida"]],
      body: rows,
      styles: {
        fontSize: 9,
        cellPadding: 4,
        overflow: "linebreak",
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 60 },
        2: { cellWidth: 30, halign: "center" },
        3: { cellWidth: 20, halign: "center" },
        4: { cellWidth: 25, halign: "center" },
        5: { cellWidth: 25, halign: "center" },
      },
      margin: { left: 14, right: 14 },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // 📅 Pie de página con fecha de generación
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`,
        14,
        doc.internal.pageSize.height - 10
      );
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width - 40,
        doc.internal.pageSize.height - 10
      );
    }

    // 💾 Guardar PDF con nombre descriptivo
    const nombreArchivo = `Lista_${clase.edificio.replace(/\s+/g, '_')}_${clase.aula.replace(/\s+/g, '_')}_${fecha}.pdf`;
    doc.save(nombreArchivo);
  };

  return (
    <div className="dashboard-maestro">
      <MenuMaestro />

      <main className="contenido-maestro">
        <div className="header-listas">
          <h1 className="titulo-seccion">Listas de Asistencia</h1>
          <p className="subtitulo-seccion">
            Genera y descarga las listas de tus clases
          </p>
        </div>

        <div className="contenedor-busqueda">
          <p className="instrucciones">
            Selecciona la fecha para generar las listas de asistencia:
          </p>

          <div className="controles-busqueda">
            <input
              type="date"
              value={fecha}
              onChange={(e) => {
                console.log("Fecha seleccionada:", e.target.value);
                setFecha(e.target.value);
                setError(""); // Limpiar error al cambiar fecha
              }}
              className="input-fecha"
              max={new Date().toISOString().split('T')[0]} // No permitir fechas futuras
            />

            <button
              onClick={buscarClases}
              disabled={!idMaestro || !fecha || cargando}
              className="boton-buscar"
            >
              {cargando ? (
                <>
                  <span className="spinner-small"></span>
                  Buscando...
                </>
              ) : (
                <>
                  Buscar Clases
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mensaje-error">
            <span className="icono-error"></span>
            {error}
          </div>
        )}

        {cargando && (
          <div className="cargando-listas">
            <div className="spinner"></div>
            <p>Cargando clases...</p>
          </div>
        )}

        {!cargando && clases.length === 0 && fecha && !error && (
          <div className="mensaje-vacio">
            <span className="icono-vacio">📋</span>
            <p>No hay clases registradas para esta fecha</p>
          </div>
        )}

        <div className="contenedor-clases">
          {clases.map((clase, index) => {
            const entradaLimpia = limpiarHora(clase.hora_entrada);
            const salidaLimpia = limpiarHora(clase.hora_salida);
            const totalAlumnos = clase.total_alumnos || clase.alumnos.length;

            return (
              <div key={`${clase.id_aula}-${index}`} className="tarjeta-clase">
                <div className="cabecera-clase">
                  <div className="icono-clase"></div>
                  <div className="info-clase">
                    <h3 className="titulo-clase">
                      <span className="edificio">{clase.edificio}</span>
                      <span>-</span>
                      <span className="aula">{clase.aula}</span>
                    </h3>
                    <div className="detalles-clase">
                      <p className="horario">
                        {entradaLimpia} - {salidaLimpia}
                      </p>
                      <p className="total-alumnos">
                        {totalAlumnos} {totalAlumnos === 1 ? 'alumno' : 'alumnos'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="acciones-clase">
                  <button
                    onClick={() => descargarPDF(clase)}
                    className="boton-descargar"
                    disabled={totalAlumnos === 0}
                  >
                    Descargar Lista PDF
                  </button>
                </div>

                {/* Vista previa de alumnos */}
                {clase.alumnos && clase.alumnos.length > 0 && (
                  <div className="preview-alumnos">
                    <p className="texto-preview">
                      Primeros alumnos: {clase.alumnos.slice(0, 3).map(a =>
                        `${a.nombre_usu} ${a.ap_usu}`
                      ).join(', ')}
                      {clase.alumnos.length > 3 && ` y ${clase.alumnos.length - 3} más...`}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {clases.length > 0 && (
          <div className="resumen-listas">
            <p>
              Total de clases encontradas: <strong>{clases.length}</strong>
            </p>
            <p>
              Total de alumnos: <strong>
                {clases.reduce((sum, clase) => sum + (clase.total_alumnos || clase.alumnos.length), 0)}
              </strong>
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ListasMaestro;