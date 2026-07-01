import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  // Fetch products
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id, name, category, base_price, status,
          product_images (url)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    }
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
    }
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredProducts = products?.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Products</h1>
          <p>Manage your inventory and product listings.</p>
        </div>
        <Link to="/products/new" className="btn btn-primary">
          <Plus size={20} />
          Add Product
        </Link>
      </div>

      <div className="admin-card">
        <div className="table-actions">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filters">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-state">Loading products...</div>
        ) : error ? (
          <div className="error-state">Error loading products: {error.message}</div>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-cell">
                        <div className="product-img-mini">
                          {product.product_images?.[0] ? (
                            <img src={product.product_images[0].url} alt={product.name} />
                          ) : (
                            <div className="img-placeholder" />
                          )}
                        </div>
                        <span className="product-name">{product.name}</span>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>
                      <span className={`status-badge status-${product.status}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>₹{product.base_price}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" title="Edit">
                          <Edit2 size={18} />
                        </button>
                        <button 
                          className="btn-icon danger" 
                          title="Delete"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No products found. Add your first product!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
