import React, { useEffect, useState } from "react";
import MenuMaestro from "./menuMaestro";
import "../styles/notificacionesAlumno.css";
import { useNavigate } from "react-router-dom";

// 🍪 Utilidad para obtener cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(";").shift());
  }
  return null;
};

// Función auxiliar para obtener un resumen del mensaje o un asunto simulado
const getNotificationSubject = (mensaje) => {
  const words = mensaje.split(/\s+/).filter(w => w.length > 0);
  return words.slice(0, 5).join(" ") + (words.length > 5 ? "..." : "");
};

const NotificacionesMaestro = () => {
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [idUsuario, setIdUsuario] = useState(null);

  // Modal
  const [notificacionSeleccionada, setNotificacionSeleccionada] = useState(null);

  useEffect(() => {
    const userDataCookie = getCookie("userData");
    if (!userDataCookie) return navigate("/");

    try {
      const usuario = JSON.parse(userDataCookie);
      if (!usuario || !usuario.id_usu) return navigate("/");
      setIdUsuario(usuario.id_usu);
    } catch (error) {
      console.error("Error al parsear userData:", error);
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (!idUsuario) return;

    const fetchNotificaciones = async () => {
      setCargando(true);
      try {
        // Mismo payload que alumnos
        const payload = { studentId: idUsuario }; 
        const res = await fetch("https://classaccess-backend.vercel.app/api/notifications/student", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (data.success && data.data && Array.isArray(data.data.notificaciones)) {
          setNotificaciones(data.data.notificaciones);
        } else {
          setNotificaciones([]);
        }
      } catch (error) {
        console.error("Error al obtener notificaciones:", error);
        setNotificaciones([]);
      } finally {
        setCargando(false);
      }
    };

    fetchNotificaciones();
  }, [idUsuario]);

  const handleNotificacionClick = (noti) => {
    setNotificacionSeleccionada(noti);
  };

  const cerrarModal = () => {
    setNotificacionSeleccionada(null);
  };

  return (
    <div className="alumno-notificaciones-container">
      <MenuMaestro /> {/* Menú de profesor */}
      <div className="alumno-noti-contenedor">
        <div className="alumno-noti-window">
          <div className="alumno-noti-header">
            <div className="alumno-noti-controls">
              <span className="red"></span>
              <span className="yellow"></span>
              <span className="green"></span>
            </div>
            <span>Bandeja de Entrada</span>
          </div>

          <div className="alumno-noti-content">
            <h2 className="alumno-noti-titulo">Mis Notificaciones</h2>

            <div className="alumno-noti-list-container">
              {cargando ? (
                <p className="alumno-noti-cargando">Cargando...</p>
              ) : notificaciones.length === 0 ? (
                <p className="alumno-noti-sin-datos">No tienes notificaciones en tu bandeja.</p>
              ) : (
                notificaciones.map((noti) => (
                  <div 
                    key={noti.id_notificacion} 
                    className="alumno-noti-item"
                    onClick={() => handleNotificacionClick(noti)}
                  >
                    <div className="alumno-noti-message-info">
                      <div className="alumno-noti-subject">
                        {getNotificationSubject(noti.mensaje)}
                      </div>
                      <div className="alumno-noti-body-preview" title={noti.mensaje}>
                        {noti.mensaje}
                      </div>
                    </div>
                    <div className="alumno-noti-fecha">
                      {new Date(noti.fecha).toLocaleString("es-MX", { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de notificación */}
      {notificacionSeleccionada && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Notificación</h3>
            <p>{notificacionSeleccionada.mensaje}</p>
            <button className="btn-cerrar-modal" onClick={cerrarModal}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificacionesMaestro;
