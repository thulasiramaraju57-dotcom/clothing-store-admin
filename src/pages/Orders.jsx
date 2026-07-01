import React, { useState } from 'react';
import { Search, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, order_number, status, payment_status, total, created_at,
          customers (first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    }
  });

  const filteredOrders = orders?.filter(o => {
    const searchString = `${o.order_number} ${o.customers?.first_name} ${o.customers?.last_name} ${o.customers?.email}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Orders</h1>
          <p>Manage and fulfill customer orders.</p>
        </div>
      </div>

      <div className="admin-card">
        <div className="table-actions">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by order # or customer..." 
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
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-state">Loading orders...</div>
        ) : error ? (
          <div className="error-state">Error loading orders: {error.message}</div>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Fulfillment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 500 }}>{order.order_number}</td>
                    <td>
                      <div>{order.customers ? `${order.customers.first_name} ${order.customers.last_name}` : 'Guest'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>
                        {order.customers?.email}
                      </div>
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 500 }}>₹{order.total}</td>
                    <td>
                      <span className={`status-badge status-${order.payment_status}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/orders/${order.id}`} className="btn-icon" title="View Order Details">
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
                
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="empty-state text-center" style={{ padding: '3rem' }}>
                      No orders found matching your criteria.
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

export default Orders;
