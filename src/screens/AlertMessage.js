import React from 'react';

export default function AlertMessage({ message, type = "success", onClose }) {
  const backgroundColor = type === "error" ? "#f8d7da" : "#d1e7dd";
  const color = type === "error" ? "#842029" : "#0f5132";
  const border = type === "error" ? "#f5c2c7" : "#badbcc";

  return (
    <div style={{
      backgroundColor,
      color,
      border: `1px solid ${border}`,
      padding: '10px',
      borderRadius: '5px',
      marginTop: '10px',
      position: 'relative'
    }}>
      {message}
      <button onClick={onClose} style={{
        position: 'absolute',
        right: '10px',
        top: '5px',
        background: 'none',
        border: 'none',
        fontSize: '16px',
        cursor: 'pointer',
        color
      }}>×</button>
    </div>
  );
}
