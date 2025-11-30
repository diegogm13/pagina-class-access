import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 1.258 0 2.449.197 3.551.52M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.9 8.28l-3.376 3.376M19.5 6.5l-6.075 6.075M4.5 17.5l6.075-6.075" />
    </svg>
);

const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

// 🍪 Utilidad para obtener una cookie por su nombre
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return decodeURIComponent(parts.pop().split(';').shift());
    }
    return null;
};

const Login = () => {
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [mostrarContrasena, setMostrarContrasena] = useState(false);

    const navigate = useNavigate();
    const irRegistro = () => navigate("/RegistroAlumno");
    const irInicio = () => navigate("/");

   const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!correo.trim() || !contrasena.trim()) {
        setMensaje("Por favor completa todos los campos");
        return;
    }

    try {
        // 🔥 Ahora usa la ruta relativa que será manejada por el proxy de Vercel
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify({ correo, password: contrasena }),
        });

        if (!response.ok) {
            if (response.status >= 500) {
                setMensaje("Error del servidor o base de datos no disponible");
                return;
            }
        }

        const data = await response.json();

        if (!response.ok) {
            setMensaje(data.message || "Credenciales incorrectas");
            return;
        }

        setMensaje("Login exitoso");

        await new Promise(resolve => setTimeout(resolve, 100));

        const userDataCookie = getCookie("userData");
        
        console.log("Todas las cookies:", document.cookie);
        console.log("userData cookie:", userDataCookie);

        let userData;
        if (userDataCookie) {
            userData = JSON.parse(userDataCookie);
        } else if (data.data && data.data.user) {
            console.warn("Cookie no encontrada, usando respuesta del servidor");
            userData = data.data.user;
        } else {
            setMensaje("Error al obtener datos de usuario");
            return;
        }

        const tipoUsuario = userData.priv_usu;

        switch (tipoUsuario) {
            case 1: navigate("/alumno"); break;
            case 2: navigate("/maestro"); break;
            case 3: navigate("/admi"); break;
            default: setMensaje("Tipo de usuario desconocido");
        }

    } catch (error) {
        console.error("Error:", error);
        setMensaje("No se pudo conectar al servidor. Verifica tu conexión o la base de datos.");
    }
};

    const getMensajeClass = () => {
        if (!mensaje) return "";
        return mensaje.includes("exitoso") ? "success" : "error";
    };

    return (
        <div style={styles.loginPage}>
            <div style={styles.leftPanel}>
                <img src="/logo.png" alt="Logo" style={styles.logoImage} />
            </div>
            <div style={styles.rightPanel}>
                {/* 🔙 Botón de regresar */}
                <button onClick={irInicio} style={styles.backButton}>
                    <ArrowLeftIcon />
                    <span>Regresar</span>
                </button>

                <div style={styles.formContainer}>
                    <h2 style={styles.title}>Inicio de Sesión</h2>
                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGroup}>
                            <label htmlFor="correo" style={styles.label}>Correo Electrónico</label>
                            <input
                                id="correo"
                                type="email"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label htmlFor="contrasena" style={styles.label}>Contraseña</label>
                            <div style={styles.passwordContainer}>
                                <input
                                    id="contrasena"
                                    type={mostrarContrasena ? "text" : "password"}
                                    value={contrasena}
                                    onChange={(e) => setContrasena(e.target.value)}
                                    maxLength={20}
                                    required
                                    style={styles.passwordInput}
                                />
                                <span
                                    style={styles.togglePasswordIcon}
                                    onClick={() => setMostrarContrasena(!mostrarContrasena)}
                                >
                                    {mostrarContrasena ? <EyeOffIcon /> : <EyeIcon />}
                                </span>
                            </div>
                        </div>

                        <button type="submit" style={styles.loginButton}>Iniciar Sesión</button>
                        <button type="button" onClick={irRegistro} style={styles.botonRegistro}>
                            ¿No tienes cuenta? ¡Regístrate aquí!
                        </button>
                    </form>

                    {mensaje && (
                        <p style={{...styles.mensaje, ...(mensaje.includes("exitoso") ? styles.mensajeSuccess : styles.mensajeError)}}>
                            {mensaje}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    loginPage: {
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    },
    leftPanel: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #232e56 0%, #1a2342 100%)',
        padding: '40px',
        position: 'relative',
        overflow: 'hidden',
    },
    logoImage: {
        maxWidth: '75%',
        height: 'auto',
        maxHeight: '65vh',
        objectFit: 'contain',
        filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3))',
        position: 'relative',
        zIndex: 1,
    },
    rightPanel: {
        flex: 1,
        background: 'linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        bottom: '-0.15px',
        right: '95px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: 'auto',
        padding: '10px 20px',
        background: 'white',
        color: '#232e56',
        border: '2px solid #e2e8f0',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(35, 46, 86, 0.1)',
    },
    formContainer: {
        width: '100%',
        maxWidth: '440px',
        padding: '45px 40px',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(35, 46, 86, 0.12)',
        border: '1px solid rgba(35, 46, 86, 0.08)',
    },
    title: {
        textAlign: 'center',
        marginBottom: '35px',
        color: '#232e56',
        fontSize: '28px',
        fontWeight: '700',
        letterSpacing: '-0.5px',
    },
    formGroup: {
        marginBottom: '24px',
    },
    label: {
        display: 'block',
        marginBottom: '10px',
        color: '#232e56',
        fontWeight: '600',
        fontSize: '14px',
        letterSpacing: '0.3px',
    },
    passwordContainer: {
        position: 'relative',
        width: '100%',
    },
    input: {
        width: '100%',
        padding: '14px 16px',
        border: '2px solid #e2e8f0',
        borderRadius: '10px',
        fontSize: '15px',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box',
        backgroundColor: '#f8fafc',
        color: '#232e56',
    },
    passwordInput: {
        width: '100%',
        padding: '14px 45px 14px 16px',
        border: '2px solid #e2e8f0',
        borderRadius: '10px',
        fontSize: '15px',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box',
        backgroundColor: '#f8fafc',
        color: '#232e56',
    },
    togglePasswordIcon: {
        position: 'absolute',
        right: '14px',
        top: '50%',
        transform: 'translateY(-50%)',
        cursor: 'pointer',
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        transition: 'color 0.2s ease',
        padding: '4px',
    },
    loginButton: {
        width: '100%',
        padding: '14px',
        background: 'linear-gradient(135deg, #232e56 0%, #1a2342 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontWeight: '600',
        marginTop: '8px',
        letterSpacing: '0.3px',
        boxShadow: '0 4px 12px rgba(35, 46, 86, 0.2)',
    },
    botonRegistro: {
        width: '100%',
        marginTop: '12px',
        background: 'transparent',
        boxShadow: 'none',
        border: 'none',
        color: '#232e56',
        fontSize: '14px',
        cursor: 'pointer',
        textDecoration: 'underline',
        transition: '0.3s ease',
        padding: '10px',
    },
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

export default Login;