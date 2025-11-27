import React, { useEffect, useState } from "react";
import MenuAlumno from "./menuAlumno";
import "../styles/notificacionesAlumno.css";
import { useNavigate } from "react-router-dom";

// Función auxiliar para obtener un resumen del mensaje o un asunto si existiera
const getNotificationSubject = (mensaje) => {
    // Aquí puedes implementar una lógica real para extraer el asunto
    // Por ahora, usaremos las primeras 5 palabras como "asunto" simulado.
    const words = mensaje.split(/\s+/).filter(w => w.length > 0);
    return words.slice(0, 5).join(" ") + (words.length > 5 ? "..." : "");
};

const NotificacionesAlumno = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const usuario = localStorage.getItem("usuario");
        if (!usuario) {
            navigate("/"); // Redirige al login si no hay sesión
        }
    }, [navigate]);

    const [notificaciones, setNotificaciones] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const id_usu = localStorage.getItem("id_usu");

        const fetchNotificaciones = async () => {
            try {
                const res = await fetch("https://servidor-class-access.vercel.app/notificacionesAlumno", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ id_usu }),
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    console.error("respuesta:", errorData);
                    setNotificaciones([]);
                    setCargando(false);
                    return;
                }

                const data = await res.json();
                console.log("respuesta:", data);

                if (data.success) {
                    setNotificaciones(Array.isArray(data.notificaciones) ? data.notificaciones : []);
                } else {
                    setNotificaciones([]);
                }
            } catch (error) {
                console.error("Error al obtener notificaciones:", error);
                setNotificaciones([]); // Asegurar que no hay datos si falla la conexión
            } finally {
                setCargando(false);
            }
        };

        fetchNotificaciones();
    }, []);

    // Simulación de acción al hacer clic en una notificación
    const handleNotificacionClick = (noti) => {
        console.log("Notificación clickeada:", noti.id_notificacion);
        // Aquí podrías navegar a una vista de detalle: navigate(`/notificaciones/${noti.id_notificacion}`)
        alert(`Ver Detalle de la Notificación: ${noti.mensaje.substring(0, 30)}...`);
    };

    return (
        <div className="alumno-notificaciones-container">
            {/* 1. Menú Lateral (No afectado) */}
            <MenuAlumno /> 
            
            {/* 2. Área de Contenido Principal */}
            <div className="alumno-noti-contenedor">
                
                {/* 3. La "Ventana" de Buzón (Nuevo Contenedor) */}
                <div className="alumno-noti-window">

                    {/* Barra Superior con Controles (Estética) */}
                    <div className="alumno-noti-header">
                        <div className="alumno-noti-controls">
                            <span className="red"></span>
                            <span className="yellow"></span>
                            <span className="green"></span>
                        </div>
                        <span>Bandeja de Entrada</span>
                        <span style={{ cursor: 'pointer' }}></span> 
                    </div>

                    {/* Contenido (Título y Lista) */}
                    <div className="alumno-noti-content">

                        <h2 className="alumno-noti-titulo">Mis Notificaciones</h2>

                        <div className="alumno-noti-list-container">
                            {/* Manejo de estados de carga y datos */}
                            {cargando ? (
                                <p className="alumno-noti-cargando">Cargando...</p>
                            ) : notificaciones.length === 0 ? (
                                <p className="alumno-noti-sin-datos">No tienes notificaciones en tu bandeja.</p>
                            ) : (
                                // Renderizado de la lista
                                notificaciones.map((noti) => (
                                    <div 
                                        key={noti.id_notificacion} 
                                        className="alumno-noti-item"
                                        onClick={() => handleNotificacionClick(noti)}
                                    >
                                        <div className="alumno-noti-message-info">
                                            {/* Asunto (simulado) - para dar más jerarquía */}
                                            <div className="alumno-noti-subject">
                                                {getNotificationSubject(noti.mensaje)}
                                            </div>
                                            {/* Vista previa del Cuerpo del mensaje */}
                                            <div className="alumno-noti-body-preview" title={noti.mensaje}>
                                                {noti.mensaje}
                                            </div>
                                        </div>
                                        {/* Fecha */}
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
        </div>
    );
};

export default NotificacionesAlumno;