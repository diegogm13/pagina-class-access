// ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return decodeURIComponent(parts.pop().split(';').shift());
    }
    return null;
};

const ProtectedRoute = ({ children, allowedPrivileges }) => {
    // Intentar obtener userData de cookie o localStorage
    let userData = null;
    
    const userDataCookie = getCookie("userData");
    if (userDataCookie) {
        userData = JSON.parse(userDataCookie);
    } else {
        const stored = localStorage.getItem('userData');
        if (stored) {
            userData = JSON.parse(stored);
        }
    }

    if (!userData) {
        console.log("❌ No autenticado, redirigiendo a login");
        return <Navigate to="/login" replace />;
    }

    if (allowedPrivileges && !allowedPrivileges.includes(userData.priv_usu)) {
        console.log("❌ Sin privilegios suficientes");
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;