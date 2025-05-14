const ProductForm = ({ onSubmit, editingProduct, onCancel }) => {
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

  };
  