import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost/api.php';

export const getProductos = async () => {
  const res = await axios.get(`${API_URL}/productos`);
  return res.data;
};

export const createProducto = (producto) => axios.post(`${API_URL}/productos`, producto);
export const deleteProducto = (id) => axios.delete(`${API_URL}/productos/${id}`);
