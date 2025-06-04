import React, { useState, useEffect } from 'react';

const ProductCard = ({
    item,
    modoVenta,
    comprarProducto,
    eliminarProducto,
    setEditandoId,
    setForm,
  }) => (
    <div className="product-card">
      <h3 className="product-name">
        {item.nombre} - ${item.precio}
      </h3>
      {item.descripcion && (
        <p className="product-desc">{item.descripcion}</p> 
      )}
      <p className="product-stock">Stock: {item.stock}</p>
      <div className="product-actions">
        {!modoVenta && (
          <>
            <button
              className="btn btn-edit"
              onClick={() => {
                setForm({
                  nombre: item.nombre,
                  precio: item.precio.toString(),
                  stock: item.stock.toString(),
                  descripcion: item.descripcion,
                });
                setEditandoId(item.id);
              }}
            >
              Editar
            </button>
            <button
              className="btn btn-delete"
              onClick={() => eliminarProducto(item.id)}
            >
              Eliminar
            </button>
          </>
        )}
        {modoVenta && (
          <button className="btn-buy" onClick={() => comprarProducto(item)}>
            Comprar
          </button>
        )}
      </div>
    </div>
  );
  export default ProductCard;