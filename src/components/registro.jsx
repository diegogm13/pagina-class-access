import React, { useState } from "react";
import "../styles/registroAlumno.css";
import { useNavigate } from "react-router-dom";

const RegistroAlumno = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    ap: "",
    am: "",
    correo: "",
    password: "",
    repetirPassword: "",
    matricula: "",
    cod_rfid: "",
    grupo: "",
  });

  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const irLogin = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Limpiar error del campo al escribir
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ""
      }));
    }
    
    // Limpiar mensaje general al escribir
    if (mensaje) {
      setMensaje("");
    }
    
    // Convertir grupo a mayúsculas y eliminar caracteres no válidos
    if (name === "grupo") {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validarPassword = (pwd) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\];:'",.<>?/\\|`~]).{8,}$/;
    return regex.test(pwd);
  };

  // 🔒 Nueva función para validar dominio UTEQ
  const validarDominioUTEQ = (correo) => {
    const regex = /^[a-zA-Z0-9._%+-]+@uteq\.edu\.mx$/i;
    return regex.test(correo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrores({});
    setMensaje("");
    setLoading(true);

    const {
      nombre,
      ap,
      am,
      correo,
      password,
      repetirPassword,
      matricula,
      cod_rfid,
      grupo,
    } = formData;

    // Objeto para acumular errores
    const nuevosErrores = {};

    // 🔒 Validación de dominio institucional
    if (!validarDominioUTEQ(correo)) {
      nuevosErrores.correo = "Solo se permiten correos institucionales @uteq.edu.mx";
    }

    // Validaciones
    if (password !== repetirPassword) {
      nuevosErrores.repetirPassword = "Las contraseñas no coinciden";
    }

    if (!validarPassword(password)) {
      nuevosErrores.password = "Mínimo 8 caracteres, una mayúscula, un número y un caracter especial";
    }

    // Si hay errores, mostrarlos y detener
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      setLoading(false);
      return;
    }

    // 🔧 CRÍTICO: priv debe ser un número, no string
    const payload = {
      nombre,
      ap,
      am,
      correo,
      password,
      priv: 1, // 🔧 Número, no string "1"
      matricula,
      cod_rfid: cod_rfid.trim() || null, // null si está vacío
      grupo,
    };

    console.log("📤 Enviando payload:", payload); // Debug

    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        credentials: 'include', // 🍪 Por si necesitas cookies en el futuro
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(payload),
      });

      // Manejo de errores de servidor
      if (!res.ok) {
        if (res.status >= 500) {
          setMensaje("Error del servidor o base de datos no disponible");
          setLoading(false);
          return;
        }
      }

      const data = await res.json();
      console.log("📥 Respuesta del servidor:", data); // Debug

      if (!res.ok) {
        setMensaje(data.message || "No se pudo registrar el usuario");
        setLoading(false);
        return;
      }

      if (data.success) {
        setMensaje("¡Registro exitoso! Redirigiendo al login...");
        
        // Redirigir al login después de 1.5 segundos
        setTimeout(() => {
          navigate("/login");
        }, 1500);

      } else {
        setMensaje(data.message || "No se pudo registrar el usuario");
      }

    } catch (error) {
      console.error("Error en registro:", error);
      setMensaje("No se pudo conectar al servidor. Verifica tu conexión o la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  const getMensajeClass = () => {
    if (!mensaje) return "";
    return mensaje.includes("exitoso") ? "success" : "error";
  };

  const styles = {
    mensaje: {
      display: 'block',
      marginTop: '12px',
      padding: '6px 12px',
      borderRadius: '8px',
      textAlign: 'center',
      fontSize: '13px',
      fontWeight: '500',
      width: '100%',
      boxSizing: 'border-box',
    },
    mensajeError: {
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      border: '1px solid #fecaca',
      boxShadow: '0 2px 8px rgba(220, 38, 38, 0.1)',
    },
    mensajeSuccess: {
      backgroundColor: '#f0fdf4',
      color: '#16a34a',
      border: '1px solid #bbf7d0',
      boxShadow: '0 2px 8px rgba(22, 163, 74, 0.1)',
    },
  };

  return (
    <div className="registro-page">
      <div className="left-panel-registro">
        <img src="/logo.png" alt="Logo" className="logo-image-small" />
      </div>
      
      <div className="right-panel-registro">
        <div className="form-container-registro">
          <h2>Registro de Alumno</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. Juan"
                required
                disabled={loading}
                className={errores.nombre ? "input-error" : ""}
              />
              {errores.nombre && <span className="error-text">{errores.nombre}</span>}
            </div>

            <div className="form-group">
              <label>Apellido Paterno</label>
              <input
                type="text"
                name="ap"
                value={formData.ap}
                onChange={handleChange}
                placeholder="Ej. Pérez"
                required
                disabled={loading}
                className={errores.ap ? "input-error" : ""}
              />
              {errores.ap && <span className="error-text">{errores.ap}</span>}
            </div>

            <div className="form-group">
              <label>Apellido Materno</label>
              <input
                type="text"
                name="am"
                value={formData.am}
                onChange={handleChange}
                placeholder="Ej. García"
                required
                disabled={loading}
                className={errores.am ? "input-error" : ""}
              />
              {errores.am && <span className="error-text">{errores.am}</span>}
            </div>

            <div className="form-group">
              <label>Correo Institucional</label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                placeholder="ejemplo@uteq.edu.mx"
                required
                disabled={loading}
                className={errores.correo ? "input-error" : ""}
              />
              {errores.correo && <span className="error-text">{errores.correo}</span>}
              {!errores.correo && (
                <small className="helper-text">
                  Solo correos @uteq.edu.mx
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                required
                disabled={loading}
                className={errores.password ? "input-error" : ""}
              />
              {errores.password && <span className="error-text">{errores.password}</span>}
              {!errores.password && (
                <small className="helper-text">
                  Debe contener: mayúscula, número y caracter especial
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Repetir Contraseña</label>
              <input
                type="password"
                name="repetirPassword"
                value={formData.repetirPassword}
                onChange={handleChange}
                placeholder="Confirma tu contraseña"
                required
                disabled={loading}
                className={errores.repetirPassword ? "input-error" : ""}
              />
              {errores.repetirPassword && <span className="error-text">{errores.repetirPassword}</span>}
            </div>

            <div className="form-group">
              <label>Matrícula</label>
              <input
                type="text"
                name="matricula"
                value={formData.matricula}
                onChange={handleChange}
                placeholder="Ej. A12345678"
                required
                disabled={loading}
                className={errores.matricula ? "input-error" : ""}
              />
              {errores.matricula && <span className="error-text">{errores.matricula}</span>}
            </div>

            <div className="form-group">
              <label>Grupo</label>
              <input
                type="text"
                name="grupo"
                value={formData.grupo}
                onChange={handleChange}
                placeholder="Ej. 3A"
                maxLength={5}
                required
                disabled={loading}
                className={errores.grupo ? "input-error" : ""}
              />
              {errores.grupo && <span className="error-text">{errores.grupo}</span>}
            </div>

            <div className="form-group">
              <label>Código RFID (Opcional)</label>
              <input
                type="text"
                name="cod_rfid"
                value={formData.cod_rfid}
                onChange={handleChange}
                placeholder="Escanea tu credencial"
                disabled={loading}
                className={errores.cod_rfid ? "input-error" : ""}
              />
              {errores.cod_rfid && <span className="error-text">{errores.cod_rfid}</span>}
            </div>

            <div className="button-group">
              <button 
                type="submit" 
                className="btn-registrar"
                disabled={loading}
              >
                {loading ? "Registrando..." : "Registrar"}
              </button>
              
              <button
                type="button"
                onClick={irLogin}
                className="btn-iniciar-sesion"
                style={{ color: "#000000ff", textDecoration: "underline" }}
              >
                ¿Ya tienes cuenta? Inicia sesión aquí
              </button>
            </div>
          </form>

          {mensaje && <p style={{...styles.mensaje, ...(mensaje.includes("exitoso") ? styles.mensajeSuccess : styles.mensajeError)}}>{mensaje}</p>}
        </div>
      </div>
    </div>
  );
};

export default RegistroAlumno;