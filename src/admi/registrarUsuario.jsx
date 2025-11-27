import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/registro.css";
import MenuAdmin from "./menuAdmi";

const RegistrarUsuario = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    ap: "",
    am: "",
    correo: "",
    password: "",
    priv: "1",
    matricula: "",
    cod_rfid: "",
    grupo: "",
    no_empleado: ""
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("https://servidor-class-access.vercel.app/registrarUsuario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Usuario registrado con éxito");
          // Limpiar formulario después de registrar
          setFormData({
            nombre: "",
            ap: "",
            am: "",
            correo: "",
            password: "",
            priv: "1",
            matricula: "",
            cod_rfid: "",
            grupo: "",
            no_empleado: ""
          });
        } else {
          alert("Error al registrar usuario");
        }
      })
      .catch(error => {
        console.error("Error:", error);
        alert("Error al conectar con el servidor");
      });
  };

  const handleCancel = () => {
    // Limpiar el formulario
    setFormData({
      nombre: "",
      ap: "",
      am: "",
      correo: "",
      password: "",
      priv: "1",
      matricula: "",
      cod_rfid: "",
      grupo: "",
      no_empleado: ""
    });
    // Opcional: regresar a la página anterior o dashboard
    navigate(-1); // Descomentar si quieres regresar a la página anterior
  };

  return (
    <div className="dashboard-administrador">
      <MenuAdmin />

      <main className="contenido-administrador">
  
        <h1>Registrar Usuario</h1>
        <br /><br />
        <form className="form-registro" onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="nombre" 
            placeholder="Nombre" 
            value={formData.nombre}
            onChange={handleChange} 
            required 
          />
          <input 
            type="text" 
            name="ap" 
            placeholder="Apellido Paterno" 
            value={formData.ap}
            onChange={handleChange} 
            required 
          />
          <input 
            type="text" 
            name="am" 
            placeholder="Apellido Materno" 
            value={formData.am}
            onChange={handleChange} 
            required 
          />
          <input 
            type="email" 
            name="correo" 
            placeholder="Correo" 
            value={formData.correo}
            onChange={handleChange} 
            required 
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Contraseña" 
            value={formData.password}
            onChange={handleChange} 
            required 
          />

          <select name="priv" onChange={handleChange} value={formData.priv}>
            <option value="1">Alumno</option>
            <option value="2">Maestro</option>
            <option value="3">Administrador</option>
          </select>

          {formData.priv === "1" && (
            <>
              <input 
                type="text" 
                name="matricula" 
                placeholder="Matrícula" 
                value={formData.matricula}
                onChange={handleChange} 
                required 
              />
              <input 
                type="text" 
                name="cod_rfid" 
                placeholder="Código RFID" 
                value={formData.cod_rfid}
                onChange={handleChange} 
                required 
              />
              <input 
                type="text" 
                name="grupo" 
                placeholder="Grupo" 
                value={formData.grupo}
                onChange={handleChange} 
                required
              />
            </>
          )}

          {formData.priv === "2" && (
            <input 
              type="text" 
              name="no_empleado" 
              placeholder="Número de Empleado" 
              value={formData.no_empleado}
              onChange={handleChange} 
              required 
            />
          )}

          <div className="form-buttons">
            <button type="submit" className="btn-registrar">Registrar</button>
            <button type="button" className="btn-cancelar" onClick={handleCancel}>
              Cancelar
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default RegistrarUsuario;