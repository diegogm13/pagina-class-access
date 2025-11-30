import React, { useState, useEffect } from "react";
import MenuAdmin from "./menuAdmi";
import "../styles/notificaciones.css";
import { useNavigate } from "react-router-dom";

const EnviarNotificaciones = () => {
  const navigate = useNavigate();
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);

  // 🍪 Función para leer cookies
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return decodeURIComponent(parts.pop().split(";").shift());
    }
    return null;
  };

  // Validar usuario desde cookie
  useEffect(() => {
    const userDataCookie = getCookie("userData");
    if (userDataCookie) {
      try {
        const usuario = JSON.parse(userDataCookie);
        setUsuarioLogueado(usuario);
        
        // Verificar que sea administrador (priv_usu = 3)
        if (usuario.priv_usu !== 3) {
          alert("No tienes permisos para enviar notificaciones");
          navigate("/");
        }
      } catch (err) {
        console.error("Error al parsear userData:", err);
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  const [mensaje, setMensaje] = useState("");
  const [destino, setDestino] = useState("3");
  const [enviado, setEnviado] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("📤 Enviando notificación...");
      console.log("Mensaje:", mensaje);
      console.log("Target:", parseInt(destino));

      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        credentials: "include", // ✅ Envía las cookies automáticamente
        body: JSON.stringify({
          message: mensaje,
          target: parseInt(destino)
        })
      });

      console.log("📥 Respuesta del servidor:", response.status);

      const data = await response.json();
      console.log("✅ Datos recibidos:", data);

      if (response.ok) {
        setEnviado(true);
        setMensaje("");
        setDestino("3");
        setTimeout(() => setEnviado(false), 3000);
      } else {
        alert(data.message || "Error al enviar notificación");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("Error al conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  if (!usuarioLogueado) return <div className="loading">Validando sesión...</div>;

  return (
    <div className="dashboard-administrador">
      <MenuAdmin />

      <main className="contenido-administrador notificaciones-container">
        <div className="notificaciones-header">
          <h1>Enviar Notificación</h1>
          <p>Envía mensajes importantes a los usuarios del sistema</p>
        </div>

        <form className="form-notificacion" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="mensaje">Mensaje:</label>
            <textarea
              id="mensaje"
              placeholder="Escribe el mensaje que deseas enviar..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              required
              minLength={5}
              maxLength={500}
            />
          </div>

          <div className="form-group">
            <label htmlFor="destino">Destinatarios:</label>
            <select 
              id="destino"
              value={destino} 
              onChange={(e) => setDestino(e.target.value)} 
              required
            >
              <option value="1">Solo Alumnos</option>
              <option value="2">Solo Maestros</option>
              <option value="3">Todos los usuarios</option>
            </select>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-enviar"
              disabled={isLoading || !mensaje.trim()}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Enviando...
                </>
              ) : (
                <>
                  <i className="icon-send"></i>
                  Enviar Notificación
                </>
              )}
            </button>
          </div>
        </form>

        {enviado && (
          <div className="notification-success">
            ✅ ¡Notificación enviada correctamente!
          </div>
        )}
      </main>
    </div>
  );
};

export default EnviarNotificaciones;