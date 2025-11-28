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

  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const irLogin = (e) => {
    e.preventDefault();
    navigate("/");
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    // Validaciones
    if (password !== repetirPassword) {
      setMensaje("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    if (!validarPassword(password)) {
      setMensaje(
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un caracter especial."
      );
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
      const res = await fetch("http://localhost:3001/api/users/register", {
        method: "POST",
        credentials: 'include', // 🍪 Por si necesitas cookies en el futuro
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("📥 Respuesta del servidor:", data); // Debug

      if (data.success) {
        // Mensaje de éxito
        if (!cod_rfid.trim()) {
          setMensaje(
            "✅ Registro exitoso. Recuerda que puedes agregar tu credencial RFID más tarde desde tu perfil."
          );
        } else {
          setMensaje("✅ Registro exitoso. Ya puedes iniciar sesión.");
        }

        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          navigate("/");
        }, 2000);

      } else {
        setMensaje(`❌ Error: ${data.message || "No se pudo registrar el usuario"}`);
      }

    } catch (error) {
      console.error("Error en registro:", error);
      setMensaje("❌ Error de conexión al servidor. Verifica que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
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
              />
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
              />
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
              />
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
              />
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
              />
              <small className="helper-text">
                Debe contener: mayúscula, número y caracter especial
              </small>
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
              />
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
              />
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
              />
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
              />
              <small className="helper-text">
                Puedes agregarlo después desde tu perfil
              </small>
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
                className="btn-regresar"
                disabled={loading}
                style={{ color: "white" }}
              >
                Regresar
            </button>
            </div>
          </form>

          {mensaje && (
            <div className={`mensaje ${mensaje.includes("✅") ? "success" : "error"}`}>
              {mensaje}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistroAlumno;