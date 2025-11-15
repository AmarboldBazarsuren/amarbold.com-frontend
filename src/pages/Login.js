import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import axios from 'axios';
import './Auth.css';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      if (response.data.success) {
        const userData = {
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role
        };

        localStorage.setItem('token', response.data.token);
        onLogin(userData);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Нэвтрэх үед алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <span className="logo-text">Eduvia</span>
              <span className="logo-badge">.mn</span>
            </Link>
            <h1>Тавтай морил</h1>
            <p>Өөрийн акаунтруу нэвтэрч орно уу</p>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label htmlFor="email">
                <Mail size={16} />
                Имэйл хаяг
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">
                <Lock size={16} />
                Нууц үг
              </label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-footer">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Намайг сана</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Нууц үг мартсан?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Нэвтэрч байна...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Нэвтрэх
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>эсвэл</span>
          </div>

          <div className="auth-footer">
            <p>
              Шинэ хэрэглэгч үү?{' '}
              <Link to="/register" className="auth-link">
                Бүртгүүлэх
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-background">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
      </div>
    </div>
  );
}

export default Login;