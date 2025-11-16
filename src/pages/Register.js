import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react';
import axios from 'axios';
import './Auth.css';

function Register({ onLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Нууц үг таарахгүй байна');
      return;
    }

    if (formData.password.length < 6) {
      setError('Нууц үг дор хаяж 6 тэмдэгттэй байх ёстой');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

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
      setError(err.response?.data?.message || 'Бүртгэл үүсгэх үед алдаа гарлаа');
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
            <h1>Бүртгэл үүсгэх</h1>
            <p>Өөрийн сургалтын аялалаа эхлүүлээрэй</p>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label htmlFor="name">
                <User size={16} />
                Нэр
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Таны нэр"
                required
              />
            </div>

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

            <div className="input-group">
              <label htmlFor="confirmPassword">
                <Lock size={16} />
                Нууц үг давтах
              </label>
              <div className="password-input">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="terms-checkbox">
              <label className="checkbox-label">
                <input type="checkbox" required />
                <span>
                  Би <Link to="/terms" className="terms-link">үйлчилгээний нөхцөл</Link> болон{' '}
                  <Link to="/privacy" className="terms-link">нууцлалын бодлого</Link>-тай танилцсан
                </span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Бүртгэж байна...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Бүртгүүлэх
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>эсвэл</span>
          </div>

          <div className="auth-footer">
            <p>
              Аль хэдийн бүртгэлтэй юу?{' '}
              <Link to="/login" className="auth-link">
                Нэвтрэх
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

export default Register;