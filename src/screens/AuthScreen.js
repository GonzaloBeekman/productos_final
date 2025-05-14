import React, { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import './AuthScreen.css';

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLogin, setIsLogin] = useState(true); // true para login, false para registro
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const navigate = useNavigate();

  // Manejar cambio entre login y registro
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar autenticación tradicional (email/password)
  const handleTraditionalAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validación básica
      if (!formData.email || !formData.password) {
        throw new Error("Email y contraseña son requeridos");
      }
      if (!isLogin && !formData.name) {
        throw new Error("Nombre es requerido para registro");
      }

      const endpoint = isLogin ? 'login' : 'register';
      const response = await fetch('https://gestionproducto.alwaysdata.net/auth.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: endpoint,
          email: formData.email,
          password: formData.password,
          name: formData.name
          
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error en la autenticación");
      }

      // Guardar datos del usuario
      localStorage.setItem("user", JSON.stringify({
        email: data.email,
        name: data.name,
        token: data.token,
        permiso: data.permiso
      }));
    
      // Redirigir al home
      navigate('/');

    } catch (err) {
      console.error('Error en autenticación:', err);
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  // Manejar éxito de Google (existente)
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      
      localStorage.setItem("user", JSON.stringify({
        email: decoded.email,
        name: decoded.name,
        googleId: decoded.sub
      }));

      const backendResponse = await fetch('https://gestionproducto.alwaysdata.net/auth.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'google-auth',
          email: decoded.email,
          name: decoded.name,
          googleId: decoded.sub
        })
      });

      if (!backendResponse.ok) {
        throw new Error("Error en el servidor");
      }

      navigate('/');

    } catch (err) {
      console.error('Error en login con Google:', err);
      setError(err.message || "Error al iniciar sesión con Google");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Error al iniciar sesión con Google");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h2>
        
        {/* Formulario tradicional */}
        <form onSubmit={handleTraditionalAuth} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Tu nombre completo"
                disabled={loading}
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="tu@email.com"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
          >
            {loading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
          
          <button 
            type="button" 
            className="toggle-auth" 
            onClick={toggleAuthMode}
            disabled={loading}
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </form>
        
        <div className="auth-divider">
          <span>o</span>
        </div>
        
        {/* Login con Google */}
        <div className="google-auth">
          <GoogleOAuthProvider clientId="1023818518338-i1elg9c337ump0otsdv4c1nsaaea86bk.apps.googleusercontent.com">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={isLogin} // Solo mostrar one-tap en login
              text={isLogin ? "signin_with" : "signup_with"}
              shape="rectangular"
            />
          </GoogleOAuthProvider>
        </div>
      </div>
    </div>
  );
}