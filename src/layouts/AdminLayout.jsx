import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, LogOut, Home } from 'lucide-react';
import '../pages/Admin.css';

const AdminLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>Heirloom Admin</h2>
        </div>
        <nav className="admin-nav">
          <ul>
            <li>
              <Link to="/" className={`admin-nav-link ${currentPath === '/' ? 'active' : ''}`}>
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/products" className={`admin-nav-link ${currentPath === '/products' ? 'active' : ''}`}>
                <Package size={20} />
                <span>Products</span>
              </Link>
            </li>
            <li>
              <Link to="/orders" className={`admin-nav-link ${currentPath === '/orders' ? 'active' : ''}`}>
                <ShoppingCart size={20} />
                <span>Orders</span>
              </Link>
            </li>
          </ul>
        </nav>
        <div className="admin-nav-bottom">
          <a href="https://clothing-store-64k3tg20c-at17.vercel.app/" className="admin-nav-link">
            <Home size={20} />
            <span>Storefront</span>
          </a>
          <button className="admin-nav-link logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-header-title">
            <h1>Backend Portal</h1>
          </div>
          <div className="admin-user-profile">
            <div className="avatar">A</div>
            <span>Admin User</span>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
