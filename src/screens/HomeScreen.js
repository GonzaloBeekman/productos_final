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
    stock: '',
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
  const [stock, setStock] = useState(null)
   const token = localStorage.getItem('token');

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
    if (!form.stock || isNaN(parseInt(form.stock))) return "Stock debe ser un número";
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
        stock: parseInt(form.stock),
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
        descripcion: form.descripcion,
       stock: parseInt(form.stock)
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
  if (producto.stock > 0) {
    // Buscar si ya está en el carrito
    const index = carrito.findIndex(p => p.id === producto.id);
    if (index !== -1) {
      // Incrementar cantidad si no supera stock
      if ((carrito[index].cantidad || 1) < producto.stock) {
        const nuevoCarrito = [...carrito];
        nuevoCarrito[index].cantidad = (nuevoCarrito[index].cantidad || 1) + 1;
        setCarrito(nuevoCarrito);
        alert(`Cantidad incrementada para "${producto.nombre}".`);
      } else {
        alert("No hay suficiente stock para aumentar la cantidad.");
      }
    } else {
      // Agregar nuevo con cantidad 1
      setCarrito(prev => [...prev, {...producto, cantidad: 1}]);
      alert(`"${producto.nombre}" agregado al carrito.`);
    }
  } else {
    alert("Stock agotado. Este producto no tiene stock disponible.");
  }
};
const obtenerProductos = async () => {
  try {
    const response = await fetch("https://gestionproducto.alwaysdata.net/api.php?accion=confirmar_compra");
    const data = await response.json();
    setProductos(data); // Asegurate que tenés un estado `productos`
  } catch (error) {
    console.error("Error al obtener productos:", error);
  }
};


   const eliminarDelCarrito = (index) => {
     const nuevoCarrito = [...carrito];
     nuevoCarrito.splice(index, 1);
     setCarrito(nuevoCarrito);
   };
   
  function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD") // sacar tildes
    .replace(/[\u0300-\u036f]/g, "") // eliminar acentos
    .replace(/[^a-zA-Z0-9 ]/g, "") // eliminar símbolos
    .trim();
}
const patronesMalasPalabras = [
  /p+u+t+[o@a]+/,
  /m+i+e+r+d+a+/,
  /i+d+i+[@o]+t+a+/,
  /h+d+p+/,
  /m+a+l+d+i+t+[o@a]/,
  /g+i+l+i+p+[@o]+l+l+a+s*/,
  /v+e+r+g+a+/,
  /v+e+r+g+o+t+a/,
  /P+r+o+s+t+i+t+u+t+a+/,
  /p+i+j+a+/,
  /b+o+l+u+d+[o@a]/,
  /f+o+r+r+[o@a]+/,
  /s+o+r+e+t+e+/,
  /c+u+l+[o@a]/,
  /c+u+l+o+n+a/,
  /z+o+r+r+a+/,
  /t+a+r+a+d+[o@a]/,
  /i+m+b+e+c+i+l+/,
  /c+a+b+r+[oa@]+n+/,
  /t+r+o+l+[oa@]+/,
  /c+[@o]+n+c+h+a+/,
  /c+o+n+c+h+i+t+a+/,
  /c+o+n+c+h+i+t+a+s+/,
  /p+e+r+d+i+d+a+/,
];

function contieneMalasPalabras(texto) {
  const limpio = normalizarTexto(texto);
  return patronesMalasPalabras.some((patron) => patron.test(limpio));
}

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
         <span className="dropdown-link" onClick={() => setActiveTab("carrito")}>
              🛒 Carrito ({carrito.length})
            </span>
        <div className="menu-item perfil-dropdown">
          Perfil ▾
          <div className="dropdown-content">
            <Link to="/perfil" className="dropdown-link">Editar Perfil</Link>
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
              <input
                className="form-input"
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="Stock"
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
              productos.map((item) => <ProductCard key={item.id} item={item} setForm={setForm} setEditandoId={setEditandoId} eliminarProducto={eliminarProducto}/>)
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
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Subtotal</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {carrito.map((producto, index) => (
              <tr key={index}>
                <td>{producto.nombre}</td>
                <td>{producto.cantidad || 1}</td>
                <td>${parseFloat(producto.precio).toFixed(2)}</td>
                <td>${((producto.cantidad || 1) * parseFloat(producto.precio)).toFixed(2)}</td>
                <td className="actions">
                  <button
                    className="btn-del"
                    onClick={() => eliminarDelCarrito(index)}
                    title="Eliminar este producto"
                  >
                    ❌
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="total">
          <strong>Total: $</strong>
          {carrito
            .reduce(
              (acc, prod) =>
                acc + (prod.cantidad || 1) * parseFloat(prod.precio),
              0
            )
            .toFixed(2)}
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
      <strong>Total:</strong> $
      {carrito
        .reduce((acc, prod) => acc + parseFloat(prod.precio), 0)
        .toFixed(2)}
    </p>

    <form
      onSubmit={async (e) => {
        e.preventDefault();

           const nombre = e.target[0].value;
           const direccion = e.target[1].value;
         if (contieneMalasPalabras(nombre) || contieneMalasPalabras(direccion)) {
         alert("Por favor, evitá usar palabras ofensivas o inapropiadas.");
           return;
          }
        try {
          const token = localStorage.getItem("token");

          const productos = carrito.map((prod) => ({
            id: prod.id,
            cantidad: prod.cantidad || 1, // asumimos 1 si no tiene campo cantidad
          }));

          await axios.post(
            "https://gestionproducto.alwaysdata.net/api.php?accion=confirmar_compra",
            { productos },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
         await fetchProductos();
          alert("¡Compra realizada con éxito!");
          setCarrito([]);
          setActiveTab("ventas");
        } catch (error) {
          console.error("Error al confirmar compra:", error);
          alert("Hubo un problema al confirmar la compra.");
        }
      }}
    >
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

      <button type="submit" className="btn-finalizar">
        Finalizar Compra
      </button>
      <button
        type="button"
        className="btn-volver"
        onClick={() => setActiveTab("carrito")}
      >
        Volver al Carrito
      </button>
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