import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

const ProfileEditor = () => {
  const [userData, setUserData] = useState({
    nombre: '', 
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Cargar datos actuales del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user?.token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('https://gestionproducto.alwaysdata.net/obtenerdatos.php', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });

        setUserData(prev => ({
          ...prev,
          nombre: response.data.nombre || '', 
          email: response.data.email || ''
        }));
      } catch (err) {
        setError('Error al cargar datos del usuario');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validaciones
    if (userData.newPassword && userData.newPassword !== userData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));
    
      if (!userData.nombre || !userData.currentPassword) { 
        setError('El nombre y la contraseña actual son obligatorios');
        return;
      }
    
      const response = await axios.put('https://gestionproducto.alwaysdata.net/actualizadatos.php',
        {
          id: user.id,
          nombre: userData.nombre, 
          currentPassword: userData.currentPassword,
          newPassword: userData.newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
    
      const updatedUser = {
        ...user,
        nombre: response.data.nombre || user.nombre, 
        email: response.data.email || user.email
      };
    
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccess('Perfil actualizado correctamente');
    
      // Limpiar campos de contraseña
      setUserData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: ''
      }));
    
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-editor-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        Volver Atrás
      </button>

      <h2>Editar Perfil</h2>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="form-group">
        <label>Correo:</label>
        <input
          type="email"
          name="email"
          value={userData.email}
          disabled
        />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre" 
            value={userData.nombre} 
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Contraseña Actual (para cambios):</label>
          <input
            type="password"
            name="currentPassword"
            value={userData.currentPassword}
            onChange={handleChange}
            placeholder="••••••••"
          />
        </div>

        <div className="form-group">
          <label>Nueva Contraseña:</label>
          <input
            type="password"
            name="newPassword"
            value={userData.newPassword}
            onChange={handleChange}
            placeholder="••••••••"
          />
        </div>

        <div className="form-group">
          <label>Confirmar Nueva Contraseña:</label>
          <input
            type="password"
            name="confirmPassword"
            value={userData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
};

export default ProfileEditor;
