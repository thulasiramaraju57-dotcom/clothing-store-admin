import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, MapPin, CreditCard, Package } from 'lucide-react';

const OrderDetail = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [updateError, setUpdateError] = useState(null);

  // Fetch Order
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers (*),
          order_items (
            *,
            products (name, product_images (url)),
            product_variants (size, color, sku)
          )
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    }
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus) => {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['order', id]);
      setUpdateError(null);
    },
    onError: (err) => {
      setUpdateError(err.message);
    }
  });

  if (isLoading) return <div className="admin-page"><div className="loading-state">Loading order...</div></div>;
  if (error) return <div className="admin-page"><div className="error-state">{error.message}</div></div>;
  if (!order) return <div className="admin-page">Order not found</div>;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <Link to="/orders" className="btn-outline btn-sm" style={{ display: 'inline-flex', marginBottom: '1rem' }}>
            <ArrowLeft size={16} /> Back to Orders
          </Link>
          <h1>Order {order.order_number}</h1>
          <p>Placed on {new Date(order.created_at).toLocaleString()}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>Update Status:</span>
          <select 
            value={order.status}
            onChange={(e) => updateStatusMutation.mutate(e.target.value)}
            className="filter-select"
            disabled={updateStatusMutation.isLoading}
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {updateError && <div className="error-state">{updateError}</div>}

      <div className="form-grid">
        {/* Left Column: Items */}
        <div className="admin-card">
          <h3>Items Ordered</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items?.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="product-cell">
                      <div className="product-img-mini">
                        {item.products?.product_images?.[0] ? (
                          <img src={item.products.product_images[0].url} alt="" />
                        ) : (
                          <Package size={20} className="text-muted" />
                        )}
                      </div>
                      <div>
                        <div className="product-name">{item.products?.name || 'Unknown Product'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>
                          Size: {item.product_variants?.size} | Color: {item.product_variants?.color}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>
                          SKU: {item.product_variants?.sku}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>₹{item.price_at_time}</td>
                  <td>{item.quantity}</td>
                  <td>₹{(item.price_at_time * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Column: Customer & Payment */}
        <div className="form-col-right">
          <div className="admin-card">
            <h3>Customer Details</h3>
            {order.customers ? (
              <div>
                <p><strong>{order.customers.first_name} {order.customers.last_name}</strong></p>
                <p style={{ color: 'var(--admin-text-light)' }}>{order.customers.email}</p>
                <p style={{ color: 'var(--admin-text-light)' }}>{order.customers.phone}</p>
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--admin-border)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>Total Lifetime Orders: {order.customers.total_orders}</span>
                </div>
              </div>
            ) : (
              <p className="text-muted">Guest Customer</p>
            )}
          </div>

          <div className="admin-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} /> Shipping Address
            </h3>
            <p>{order.shipping_address?.address_line1}</p>
            {order.shipping_address?.address_line2 && <p>{order.shipping_address.address_line2}</p>}
            <p>{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.pincode}</p>
            <p>{order.shipping_address?.country}</p>
          </div>

          <div className="admin-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} /> Payment Summary
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Shipping</span>
              <span>₹{order.shipping}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Tax</span>
              <span>₹{order.tax}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--admin-border)', fontWeight: 'bold' }}>
              <span>Total</span>
              <span>₹{order.total}</span>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <span className={`status-badge status-${order.payment_status}`}>
                Payment: {order.payment_status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
