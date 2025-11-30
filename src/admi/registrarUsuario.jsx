import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/registro.css";
import MenuAdmin from "./menuAdmi";

const RegistrarUsuario = () => {
  const navigate = useNavigate();
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🍪 Función para leer cookies
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return decodeURIComponent(parts.pop().split(";").shift());
    }
    return null;
  };

    useEffect(() => {
      const userDataCookie = getCookie("userData");
      if (userDataCookie) {
        try {
          const usuario = JSON.parse(userDataCookie);

          if (usuario.priv_usu !== 3) {
            console.warn("Usuario no es administrador");
            navigate("/");
            return;
          }

          setUsuarioLogueado(usuario);

          // Reiniciar formulario cada vez que se entra
          setFormData({
            nombre: "",
            ap: "",
            am: "",
            correo: "",
            password: "",
            priv: 1,
            matricula: "",
            cod_rfid: "",
            grupo: "",
            no_empleado: ""
          });

        } catch (err) {
          console.error("Error al parsear userData:", err);
          navigate("/");
        }
      } else {
        console.warn("No hay cookie de sesión");
        navigate("/");
      }
    }, [navigate]);


  const [formData, setFormData] = useState({
    nombre: "",
    ap: "",
    am: "",
    correo: "",
    password: "",
    priv: 1, // Cambiar a número
    matricula: "",
    cod_rfid: "",
    grupo: "",
    no_empleado: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Convertir priv a número
    if (name === "priv") {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("📝 Datos a enviar:", formData);

      // Preparar el payload según el tipo de usuario
      const payload = {
        nombre: formData.nombre.trim(),
        ap: formData.ap.trim(),
        am: formData.am.trim(),
        correo: formData.correo.trim().toLowerCase(),
        password: formData.password,
        priv: formData.priv
      };

      // Agregar campos específicos según el tipo de usuario
      if (formData.priv === 1) {
        // Alumno
        payload.matricula = formData.matricula.trim();
        payload.cod_rfid = formData.cod_rfid.trim();
        payload.grupo = formData.grupo.trim();
      } else if (formData.priv === 2) {
        // Maestro
        payload.no_empleado = formData.no_empleado.trim();
      }
      // Administrador no necesita campos adicionales

      console.log("📤 Payload preparado:", payload);

      const response = await axios.post(
        "/api/users/register",
        payload,
        {
          withCredentials: true, // 🔑 Importante: envía las cookies
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("✅ Respuesta del servidor:", response.data);

      // Mostrar mensaje de éxito
      const tipoUsuario = formData.priv === 1 ? "Alumno" : formData.priv === 2 ? "Maestro" : "Administrador";
      alert(`✅ ${tipoUsuario} registrado con éxito`);

      // Limpiar formulario
      setFormData({
        nombre: "",
        ap: "",
        am: "",
        correo: "",
        password: "",
        priv: 1,
        matricula: "",
        cod_rfid: "",
        grupo: "",
        no_empleado: ""
      });

      setLoading(false);

      // Redirigir a la página de usuarios después de 1 segundo
      setTimeout(() => {
        navigate("/usuarios");
      }, 1000);

    } catch (err) {
      console.error("❌ Error al registrar usuario:", err);
      console.error("Detalles:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      setLoading(false);

      if (err.response) {
        const status = err.response.status;
        const errorData = err.response.data;
        const errorMessage = errorData?.message || errorData?.error;

        switch (status) {
          case 400:
            // Error de validación
            if (errorData?.errors && Array.isArray(errorData.errors)) {
              // Errores de validación de express-validator
              const errores = errorData.errors.map(e => e.msg).join('\n');
              setError(errores);
              alert(`❌ Errores de validación:\n${errores}`);
            } else {
              setError(errorMessage || "Datos inválidos");
              alert(`❌ ${errorMessage || "Datos inválidos. Verifica los campos."}`);
            }
            break;

          case 401:
            setError("Sesión expirada");
            alert("⚠️ Sesión expirada. Redirigiendo al login...");
            setTimeout(() => navigate("/"), 2000);
            break;

          case 403:
            setError("No tienes permiso para registrar usuarios");
            alert("⚠️ No tienes permiso para realizar esta acción");
            break;

          case 409:
            setError(errorMessage || "El correo ya está registrado");
            alert(`⚠️ ${errorMessage || "El correo ya está registrado"}`);
            break;

          case 500:
            setError("Error en el servidor");
            alert("❌ Error en el servidor. Intenta más tarde.");
            break;

          default:
            setError(errorMessage || "Error al registrar usuario");
            alert(`❌ ${errorMessage || "Error al registrar usuario"}`);
        }
      } else if (err.request) {
        setError("No se pudo conectar con el servidor");
        alert("❌ No se pudo conectar con el servidor. Verifica tu conexión.");
      } else {
        setError("Error al procesar la solicitud");
        alert("❌ Error al procesar la solicitud");
      }
    }
  };

  const handleCancel = () => {
    // Limpiar el formulario
    setFormData({
      nombre: "",
      ap: "",
      am: "",
      correo: "",
      password: "",
      priv: 1,
      matricula: "",
      cod_rfid: "",
      grupo: "",
      no_empleado: ""
    });
    
    // Regresar a la página anterior
    navigate(-1);
  };

  if (!usuarioLogueado) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Validando sesión...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-administrador">
      <MenuAdmin />

      <main className="contenido-administrador">
        <div className="registro-header">
          <h1>Registrar Nuevo Usuario</h1>
          <p className="subtitulo">Complete el formulario para agregar un usuario al sistema</p>
        </div>

        {error && (
          <div className="mensaje-error">
            <span className="icono-error">⚠️</span>
            {error}
          </div>
        )}

          <form className="form-registro" onSubmit={handleSubmit} autoComplete="off">
          <div className="form-section">            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre(s)</label>
                <input 
                  type="text" 
                  id="nombre"
                  name="nombre" 
                  placeholder="Ej: Juan" 
                  value={formData.nombre}
                  onChange={handleChange}
                  disabled={loading}
                  required 
                  minLength={2}
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label htmlFor="ap">Apellido Paterno</label>
                <input 
                  type="text" 
                  id="ap"
                  name="ap" 
                  placeholder="Ej: Pérez" 
                  value={formData.ap}
                  onChange={handleChange}
                  disabled={loading}
                  required 
                  minLength={2}
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label htmlFor="am">Apellido Materno</label>
                <input 
                  type="text" 
                  id="am"
                  name="am" 
                  placeholder="Ej: García" 
                  value={formData.am}
                  onChange={handleChange}
                  disabled={loading}
                  required 
                  minLength={2}
                  maxLength={100}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Credenciales de Acceso</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="correo">Correo Electrónico</label>
                <input 
                  type="email" 
                  id="correo"
                  name="correo" 
                  placeholder="usuario@ejemplo.com" 
                  value={formData.correo}
                  onChange={handleChange}
                  disabled={loading}
                  required 
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input 
                  type="password" 
                  id="password"
                  name="password" 
                  placeholder="Mínimo 6 caracteres" 
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  required 
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Tipo de Usuario</h3>
            
            <div className="form-group">
              <label htmlFor="priv">Seleccione el tipo de usuario</label>
              <select 
                id="priv"
                name="priv" 
                onChange={handleChange} 
                value={formData.priv}
                disabled={loading}
                required
              >
                <option value={1}>Alumno</option>
                <option value={2}>Maestro</option>
                <option value={3}>Administrador</option>
              </select>
            </div>
          </div>

          {/* Campos específicos para Alumno */}
          {formData.priv === 1 && (
            <div className="form-section campos-especificos">
              <h3 className="section-title">Información del Alumno</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="matricula">Matrícula</label>
                  <input 
                    type="text" 
                    id="matricula"
                    name="matricula" 
                    placeholder="Ej: A12345678" 
                    value={formData.matricula}
                    onChange={handleChange}
                    disabled={loading}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cod_rfid">Código RFID</label>
                  <input 
                    type="text" 
                    id="cod_rfid"
                    name="cod_rfid" 
                    placeholder="Ej: RFID123456" 
                    value={formData.cod_rfid}
                    onChange={handleChange}
                    disabled={loading}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="grupo">Grupo</label>
                  <input 
                    type="text" 
                    id="grupo"
                    name="grupo" 
                    placeholder="Ej: 3A" 
                    value={formData.grupo}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Campos específicos para Maestro */}
          {formData.priv === 2 && (
            <div className="form-section campos-especificos">
              <h3 className="section-title">Información del Maestro</h3>
              
              <div className="form-group">
                <label htmlFor="no_empleado">Número de Empleado *</label>
                <input 
                  type="text" 
                  id="no_empleado"
                  name="no_empleado" 
                  placeholder="Ej: EMP001" 
                  value={formData.no_empleado}
                  onChange={handleChange}
                  disabled={loading}
                  required 
                />
              </div>
            </div>
          )}

          {/* Información para Administrador */}
          {formData.priv === 3 && (
            <div className="form-section info-admin">
              <p className="texto-info">
                ℹLos administradores tienen acceso completo al sistema. No requieren campos adicionales.
              </p>
            </div>
          )}

          <div className="form-buttons">
            <button 
              type="submit" 
              className="btn-cancelar"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Registrando...
                </>
              ) : (
                <>
                  ✓ Registrar Usuario
                </>
              )}
            </button>
            
            <button 
              type="button" 
              className="btn-cancelar" 
              onClick={handleCancel}
              disabled={loading}
            >
              ✗ Cancelar
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default RegistrarUsuario;