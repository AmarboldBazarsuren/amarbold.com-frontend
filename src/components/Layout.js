import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, User, LogOut, Menu, X, Shield, Users } from 'lucide-react';
import './Layout.css';

function Layout({ children, user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Нүүр' },
    { path: '/courses', icon: BookOpen, label: 'Хичээлүүд' }, // 🔥 ШИНЭ
    { path: '/instructors', icon: Users, label: 'Багш нар' }, // 🔥 ШИНЭ
    { path: '/my-courses', icon: BookOpen, label: 'Миний хичээлүүд' },
    { path: '/profile', icon: User, label: 'Профайл' },
  ];

  // Admin эрхтэй бол админ хэсэг нэмэх
  if (user?.role === 'admin' || user?.role === 'test_admin') {
    navItems.push({ 
      path: '/admin', 
      icon: Shield, 
      label: 'Админ самбар',
      adminOnly: true 
    });
    
    navItems.push({ 
      path: '/my-students', 
      icon: Users, 
      label: 'Миний суралцагчид',
      adminOnly: true 
    });
  }

  // Super Admin - Хэрэглэгчид удирдлага
  if (user?.role === 'admin') {
    navItems.push({ 
      path: '/admin/users', 
      icon: Users, 
      label: 'Хэрэглэгчид',
      superAdminOnly: true 
    });
    
    navItems.push({ 
      path: '/admin/categories', 
      icon: BookOpen, 
      label: 'Ангилал',
      superAdminOnly: true 
    });
  }

  const handleNavClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="layout">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/dashboard" className="navbar-logo">
            <span className="logo-text">Eduvia</span>
            <span className="logo-badge">.mn</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-menu">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`nav-item ${isActive(item.path) ? 'active' : ''} ${
                  item.superAdminOnly ? 'super-admin' : item.adminOnly ? 'admin' : ''
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
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
                  <span className="user-role admin-badge">Багш</span>
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
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''} ${
                  item.superAdminOnly ? 'super-admin' : item.adminOnly ? 'admin' : ''
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
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
          <p>&copy; 2024 Eduvia.mn - Бүх эрх хуулиар хамгаалагдсан</p>
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