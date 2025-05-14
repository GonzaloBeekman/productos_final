import ProductCard from './ProductCard';

// Obtener productos
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

const ProductList = ({ productos, onSelect, userEmail }) => (
  <>
    {productos.map(producto => (
      <ProductCard
        key={producto.id}
        producto={producto}
        onSelect={onSelect}
        userEmail={userEmail}
      />
    ))}
  </>
);

