import React from 'react';
import { DollarSign, ShoppingBag, Users, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="admin-card metric-card">
          <div className="metric-icon">
            <DollarSign size={24} />
          </div>
          <div className="metric-content">
            <p>Total Revenue (30d)</p>
            <h4>₹1,42,500</h4>
          </div>
        </div>
        
        <div className="admin-card metric-card">
          <div className="metric-icon">
            <ShoppingBag size={24} />
          </div>
          <div className="metric-content">
            <p>Active Orders</p>
            <h4>24</h4>
          </div>
        </div>
        
        <div className="admin-card metric-card">
          <div className="metric-icon">
            <Users size={24} />
          </div>
          <div className="metric-content">
            <p>Total Customers</p>
            <h4>842</h4>
          </div>
        </div>

        <div className="admin-card metric-card">
          <div className="metric-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>
            <AlertCircle size={24} />
          </div>
          <div className="metric-content">
            <p>Low Stock Alerts</p>
            <h4>3 Items</h4>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h3>Recent Orders</h3>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#1042</td>
                <td>Eleanor Vance</td>
                <td>Today, 10:42 AM</td>
                <td>₹1,450.00</td>
                <td><span className="status-badge status-fulfilled">Fulfilled</span></td>
              </tr>
              <tr>
                <td>#1043</td>
                <td>Arthur Pendelton</td>
                <td>Today, 1:15 PM</td>
                <td>₹850.00</td>
                <td><span className="status-badge status-processing">Processing</span></td>
              </tr>
              <tr>
                <td>#1044</td>
                <td>Beatrice Ward</td>
                <td>Yesterday</td>
                <td>₹2,100.00</td>
                <td><span className="status-badge status-fulfilled">Fulfilled</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
