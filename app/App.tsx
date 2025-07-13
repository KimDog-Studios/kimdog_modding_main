// src/components/ProductDetail.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import products from './config/ProductsConfig';

function ProductDetail() {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return <h2>Product not found.</h2>;
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      {/* Add more product detail display here */}
    </div>
  );
}

export default ProductDetail;
