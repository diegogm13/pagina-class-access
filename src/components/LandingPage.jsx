import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';
import logo from "../logonigga.png";


const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Header/Navbar */}
      <header className="navbar">
        <div className="navbar-content">
          <div className="logo-section">
            <img src={logo} alt="ClassAccess Logo" className="navbar-logo" />
            <h1 className="navbar-title">ClassAccess</h1>
            </div>

          <div className="navbar-buttons">
            <button className="btn-login" onClick={() => navigate('/login')}>
              Iniciar Sesión
            </button>
            <button className="btn-register" onClick={() => navigate('/RegistroAlumno')}>
              Registrarse
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
        <img src={logo} alt="ClassAccess Logo" className="hero-logo" />
        <h2 className="hero-title">ClassAccess</h2>
        <p className="hero-subtitle">Control automatizado con tecnología IoT para instituciones educativas</p>
        </div>
      </section>

      {/* ¿Qué es este proyecto? */}
      <section className="section">
        <h2 className="section-title">¿Qué es este proyecto?</h2>
        <p className="section-text">
          Un sistema completo que registra automáticamente la entrada y salida de estudiantes y profesores usando tecnología IoT
          conectada a una plataforma web intuitiva. Piensa en ello como un asistente digital que nunca olvida quién entró o salió, y que
          además cuida de la seguridad de todos.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <h3>Múltiples formas de acceso</h3>
            <p>Credencial escolar, código QR desde el celular, o teclado para ingresar matrícula</p>
          </div>
          <div className="feature-card">
            <h3>Conectado en tiempo real</h3>
            <p>Toda la información se envía automáticamente a la nube por WiFi</p>
          </div>
        </div>
      </section>

      {/* Cómo funciona el dispositivo IoT */}
      <section className="section">
        <h2 className="section-title">Cómo funciona el dispositivo IoT</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <h3>Usuario se identifica</h3>
            <p>Acerca su credencial, escanea QR o teclea su matrícula</p>
          </div>
          <div className="step-card">
            <div className="step-number">02</div>
            <h3>Pantalla confirma</h3>
            <p>La pantalla OLED muestra mensaje de éxito o error</p>
          </div>
          <div className="step-card">
            <div className="step-number">03</div>
            <h3>Buzzer alerta</h3>
            <p>Sonido confirma acceso válido o rechaza intentos no autorizados</p>
          </div>
          <div className="step-card">
            <div className="step-number">04</div>
            <h3>Datos a la nube</h3>
            <p>Información se guarda: quién, cuándo, dónde y hora exacta</p>
          </div>
        </div>
      </section>

      {/* Plataforma web */}
      <section className="section">
        <h2 className="section-title">Plataforma web: ClassAccessUteq</h2>
        <div className="platform-grid">
          <div className="platform-card">
            <h3>Para estudiantes y profesores</h3>
            <ul>
              <li>Consulta tu historial de asistencias completo</li>
              <li>Genera tu código QR temporal desde tu celular</li>
              <li>Revisa el calendario escolar con eventos importantes</li>
              <li>Recibe notificaciones de cambios de horario</li>
              <li>Edita tu perfil y datos personales</li>
            </ul>
          </div>
          <div className="platform-card">
            <h3>Para administradores</h3>
            <ul>
              <li>Gestiona usuarios: altas, bajas y modificaciones</li>
              <li>Genera reportes de asistencia en PDF</li>
              <li>Administra dispositivos IoT y aulas</li>
              <li>Envía notificaciones personalizadas</li>
              <li>Actualiza calendario y eventos institucionales</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Seguridad y confianza */}
      <section className="section">
        <h2 className="section-title">Seguridad y confianza</h2>
        <div className="security-grid">
          <div className="security-card">
            <h3>Información protegida</h3>
            <p>Cifrado de datos y control de accesos según normas ISO 27000</p>
          </div>
          <div className="security-card">
            <h3>Solo personal autorizado</h3>
            <p>Cada usuario ve únicamente la información que le corresponde según su rol</p>
          </div>
          <div className="security-card">
            <h3>Respuesta rápida</h3>
            <p>El sistema genera códigos QR en menos de 2 segundos</p>
          </div>
        </div>
      </section>
      {/* Equipo y liderazgo */}
      <section className="team-section">
        <div className="team-content">
          <h2 className="section-title">Equipo y liderazgo</h2>
          <div className="team-grid">
            <div className="team-column">
              <h3>Diego García Martínez</h3>
              <div className="team-member">Rubén Mendoza Dorantes</div>
              <div className="team-member">Jonathan Isaías Aguilar Cortes</div>
              <div className="team-member">Eduardo David Quiroz Rivera</div>
              <div className="team-member">Ángel Fabián Gutiérrez Gómez</div>
              <div className="team-role">Integrantes del equipo</div>
            </div>
            <div className="team-column">
              <h3>Mario Eduardo Donjuán Carreño</h3>
              <div className="team-role">Patrocinador y Gerente</div>
            </div>
            <div className="team-column">
              <h3>Equipo MewingClass</h3>
              <div className="team-role">Desarrolladores del Sistema</div>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios principales */}
      <section className="section">
        <h2 className="section-title">Beneficios principales</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <h3>Ahorro de tiempo</h3>
            <p>Sin pasar lista manualmente</p>
          </div>
          <div className="benefit-card">
            <h3>Precisión total</h3>
            <p>Registros automáticos sin errores humanos</p>
          </div>
          <div className="benefit-card">
            <h3>Más seguridad</h3>
            <p>Botón de pánico y control de accesos</p>
          </div>
          <div className="benefit-card">
            <h3>Información útil</h3>
            <p>Reportes y estadísticas instantáneas</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>Universidad Tecnológica del Estado de Querétaro</p>
          <p>Proyecto desarrollado por estudiantes de Ingeniería en Desarrollo y Gestión de Software</p>
          <p>Cumplimiento de estándares ISO 27000</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;