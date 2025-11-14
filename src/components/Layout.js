import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, User, LogOut, Menu, X, Shield, Users } from 'lucide-react';
import './Layout.css';

function Layout({ children, user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/my-courses', icon: BookOpen, label: 'Миний хичээлүүд' },
    { path: '/profile', icon: User, label: 'Профайл' },
  ];

  // Admin эрхтэй бол Admin хэсэг нэмэх
  if (user?.role === 'admin' || user?.role === 'test_admin') {
    navItems.push({ 
      path: '/admin', 
      icon: Shield, 
      label: 'Админ самбар',
      adminOnly: true 
    });
    
    // Test Admin эсвэл Admin - Миний суралцагчид
    navItems.push({ 
      path: '/my-students', 
      icon: Users, 
      label: 'Миний суралцагчид',
      adminOnly: true 
    });
  }

  // Зөвхөн admin эрхтэй бол Users удирдлага нэмэх
  if (user?.role === 'admin') {
    navItems.push({ 
      path: '/admin/users', 
      icon: Users, 
      label: 'Хэрэглэгчид',
      superAdminOnly: true 
    });
  }

  return (
    <div className="layout">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/dashboard" className="navbar-logo">
            <span className="logo-text">AmarBold</span>
            <span className="logo-badge">.mn</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-menu">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''} ${
                  item.superAdminOnly ? 'super-admin' : item.adminOnly ? 'admin' : ''
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Info & Logout */}
          <div className="navbar-actions">
            <div className="user-info">
              <div className="user-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-details">
                <span className="user-name">{user?.name}</span>
                {user?.role === 'admin' && (
                  <span className="user-role super-admin-badge">Super Admin</span>
                )}
                {user?.role === 'test_admin' && (
                  <span className="user-role admin-badge">Test Admin</span>
                )}
                {user?.role === 'user' && (
                  <span className="user-role">Хэрэглэгч</span>
                )}
              </div>
            </div>
            <button onClick={onLogout} className="btn-logout">
              <LogOut size={20} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''} ${
                  item.superAdminOnly ? 'super-admin' : item.adminOnly ? 'admin' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }} 
              className="mobile-logout-btn"
            >
              <LogOut size={20} />
              <span>Гарах</span>
            </button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <p>&copy; 2024 AmarBold.mn - Бүх эрх хуулиар хамгаалагдсан</p>
          <div className="footer-links">
            <a href="/terms">Үйлчилгээний нөхцөл</a>
            <a href="/privacy">Нууцлалын бодлого</a>
            <a href="/contact">Холбоо барих</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;