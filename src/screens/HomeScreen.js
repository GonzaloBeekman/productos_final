import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import './HomeScreen.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://gestionproducto.alwaysdata.net/api.php';

const HomeScreen = () => {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    precio: '',
    descripcion: '',
    user_email: '',
  });
  const [editandoId, setEditandoId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permiso, setPermiso] = useState(null);
  const navigate = useNavigate();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [activeTab, setActiveTab] = useState("ventas");
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const getAuthToken = () => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return null;
    }
    return JSON.parse(userData).token;
  };

  const fetchProductos = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      if (!token) return;

      const response = await axios.get(`${API_URL}?action=get_products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setProductos(response.data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      if (error.response?.status === 401 || error.message.includes('autenticación')) {
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setError(error.message || 'Error al cargar productos');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          navigate('/login');
          return;
        }

        const { email, permiso } = JSON.parse(userData);
        setUserEmail(email);
        setPermiso(permiso);
        fetchProductos();
      } catch (error) {
        console.error('Error en carga inicial:', error);
        navigate('/login');
      }
    };

    loadInitialData();
  }, [navigate]);

  // Validación de formulario
  const validarFormulario = () => {
    if (!form.nombre.trim()) return "Nombre es requerido";
    if (isNaN(parseFloat(form.precio))) return "Precio debe ser un número";
    return null;
  };

  const crearProducto = async () => {
    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      alert(errorValidacion);
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) return;

      await axios.post(API_URL, {
        action: 'create_product',
        nombre: form.nombre,
        precio: parseFloat(form.precio),
        descripcion: form.descripcion,
        user_email: userEmail
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      await fetchProductos();
      limpiarCampos();
      alert('Producto creado correctamente');
    } catch (error) {
      console.error('Error al crear producto:', error);
      alert(error.message || 'No se pudo crear el producto');
    }
  };

  const actualizarProducto = async () => {
    try {
      const token = getAuthToken();

      await axios.put(API_URL, {
        id: editandoId,
        nombre: form.nombre,
        precio: parseFloat(form.precio),
        descripcion: form.descripcion
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      await fetchProductos();
      limpiarCampos();
      setEditandoId(null);
      alert('Producto actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      alert('No se pudo actualizar el producto');
    }
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) {
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) return;

      await axios.delete(`${API_URL}?action=delete_product&id=${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      await fetchProductos();
      alert('Producto eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert('No se pudo eliminar el producto');
    }
  };

  const limpiarCampos = () => {
    setForm({ nombre: '', precio: '', descripcion: '' });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const productosFiltrados = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );
  const comprarProducto = (producto) => {
    setCarrito([...carrito, producto]);
    alert("Producto agregado al carrito");
  }

  const eliminarDelCarrito = (index) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito.splice(index, 1);
    setCarrito(nuevoCarrito);
  };
  
 
  return (
    <div className="container">
      <div className="menu-horizontal">
        {permiso === '1' && (
          <span
            className={`menu-item ${activeTab === "administracion" ? "active" : ""}`}
            onClick={() => setActiveTab("administracion")}
          >
            Administración de Productos
          </span>
        )}
        <span
          className={`menu-item ${activeTab === "ventas" ? "active" : ""}`}
          onClick={() => setActiveTab("ventas")}
        >
          Ventas de Productos
        </span>
  
        <div className="menu-item perfil-dropdown">
          Perfil ▾
          <div className="dropdown-content">
            <Link to="/perfil" className="dropdown-link">Editar Perfil</Link>
            <span className="dropdown-link" onClick={() => setActiveTab("carrito")}>
              🛒 Carrito ({carrito.length})
            </span>
            <span className="dropdown-link logout" onClick={handleLogout}>
              Cerrar sesión ({userEmail})
            </span>
          </div>
        </div>
      </div>
  
      {activeTab === "administracion" && permiso == 1 && (
        <>
          <button
            className="btn-toggle-form"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            {mostrarFormulario ? "Ocultar Formulario" : "Agregar Producto"}
          </button>
  
          {mostrarFormulario && (
            <div className="form-container">
              <input
                className="form-input"
                placeholder="Nombre del producto*"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
              <input
                className="form-input"
                placeholder="Precio*"
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                type="number"
              />
              <textarea
                className="form-textarea"
                placeholder="Descripción (opcional)"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                rows="3"
              />
  
              <div className="button-group">
                {editandoId ? (
                  <>
                    <button className="btn btn-update" onClick={actualizarProducto}>
                      Actualizar
                    </button>
                    <button
                      className="btn btn-cancel"
                      onClick={() => {
                        limpiarCampos();
                        setEditandoId(null);
                      }}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button className="btn btn-create" onClick={crearProducto}>
                    Crear Producto
                  </button>
                )}
              </div>
            </div>
          )}
  
          {loading && productos.length > 0 && <div className="spinner small"></div>}
  
          <div className="product-list">
            {productos.length === 0 && !loading ? (
              <p className="empty-text">No hay productos registrados</p>
            ) : (
              productos.map((item) => <ProductCard key={item.id} item={item} />)
            )}
          </div>
        </>
      )}
  {activeTab === "carrito" && (
  <div className="carrito-container">
    <h2>Carrito de Compras</h2>
    {carrito.length === 0 ? (
      <p>No hay productos en el carrito.</p>
    ) : (
      <>
    <ul>
  {carrito.map((producto, index) => (
    <li key={index}>
      {producto.nombre} - ${parseFloat(producto.precio).toFixed(2)}{" "}
      <button
        onClick={() => eliminarDelCarrito(index)}
        style={{
          marginLeft: "10px",
          background: "none",
          border: "none",
          color: "red",
          fontSize: "1.2rem",
          cursor: "pointer"
        }}
        title="Eliminar este producto"
      >
        ❌
      </button>
    </li>
  ))}
</ul>
      <p className="total">
        <strong>Total: $</strong>
        {carrito.reduce((acc, prod) => acc + parseFloat(prod.precio), 0).toFixed(2)}
      </p>
      {carrito.length > 0 && (
  <button
    className="btn-confirm"
    onClick={() => setActiveTab("confirmarCompra")}
  >
    Confirmar Compra
  </button>
)}
      </>
    )}
    <button className="btn-clear-cart" onClick={() => setCarrito([])}>
  Vaciar Carrito 
</button>
  </div>
)}

 {activeTab === "confirmarCompra" && (
  <div className="confirmar-compra-container">
    <h2>Confirmar Compra</h2>
    
    <ul>
      {carrito.map((producto, index) => (
        <li key={index}>
          {producto.nombre} - ${producto.precio}
        </li>
      ))}
    </ul>

    <p>
      <strong>Total:</strong> ${carrito.reduce((acc, prod) => acc + parseFloat(prod.precio), 0).toFixed(2)}
    </p>

    <form onSubmit={(e) => {
      e.preventDefault();
      alert("¡Compra realizada con éxito!");
      setCarrito([]);
      setActiveTab("ventas");
    }}>
      <div className="form-group">
        <label>Nombre completo:</label>
        <input type="text" required />
      </div>

      <div className="form-group">
        <label>Dirección de envío:</label>
        <input type="text" required />
      </div>

      <div className="form-group">
        <label>Método de pago:</label>
        <select required>
          <option value="">Seleccionar...</option>
          <option value="tarjeta">Tarjeta de crédito</option>
          <option value="debito">Tarjeta de débito</option>
          <option value="efectivo">Pago en efectivo</option>
          <option value="mercadopago">MercadoPago</option>
        </select>
      </div>

      <button type="submit" className="btn-finalizar">Finalizar Compra</button>
      <button type="button" className="btn-volver" onClick={() => setActiveTab("carrito")}>Volver al Carrito</button>
    </form>
  </div>
)}

      {activeTab === "ventas" && (
        <div className="ventas-container">
          <div className="search-row">
            <input
              type="text"
              placeholder="Buscar productos..."
              className="search-input"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
  
          <div className="product-list">
            {productosFiltrados.length === 0 && !loading ? (
              <p className="empty-text">No hay productos encontrados</p>
            ) : (
              productosFiltrados.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  modoVenta={true}
                  comprarProducto={comprarProducto}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
  export default HomeScreen;