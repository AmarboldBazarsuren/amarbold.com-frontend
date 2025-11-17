import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Key } from 'lucide-react';
import axios from 'axios';
import '../pages/Auth.css';
import api from '../config/api';  // ✅ Нэмэх

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: Code + New Password
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/forgot-password', {
        email
      });

      if (response.data.success) {
        setStep(2);
        // Development-д код харуулах
        if (response.data.resetCode) {
          alert(`Development код: ${response.data.resetCode}`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Нууц үг таарахгүй байна');
      return;
    }

    if (newPassword.length < 6) {
      setError('Нууц үг дор хаяж 6 тэмдэгттэй байх ёстой');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/reset-password', {
        email,
        resetCode,
        newPassword
      });

      if (response.data.success) {
        alert('Нууц үг амжилттай солигдлоо!');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Алдаа гарлаа');
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
            <h1>Нууц үг сэргээх</h1>
            <p>
              {step === 1
                ? 'Бүртгэлтэй имэйл хаягаа оруулна уу'
                : 'Имэйл дээр ирсэн кодыг оруулна уу'}
            </p>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendCode} className="auth-form">
              <div className="input-group">
                <label htmlFor="email">
                  <Mail size={16} />
                  Имэйл хаяг
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Илгээж байна...
                  </>
                ) : (
                  <>
                    <Mail size={20} />
                    Код илгээх
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="input-group">
                <label htmlFor="code">
                  <Key size={16} />
                  Сэргээх код (6 орон)
                </label>
                <input
                  type="text"
                  id="code"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="123456"
                  maxLength="6"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="newPassword">Шинэ нууц үг</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="confirmPassword">Нууц үг давтах</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Солиж байна...
                  </>
                ) : (
                  'Нууц үг солих'
                )}
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-full"
                onClick={() => setStep(1)}
                style={{ marginTop: '12px' }}
              >
                Буцах
              </button>
            </form>
          )}

          <div className="auth-divider">
            <span>эсвэл</span>
          </div>

          <div className="auth-footer">
            <Link to="/login" className="auth-link">
              <ArrowLeft size={16} />
              Нэвтрэх хуудас руу буцах
            </Link>
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

export default ForgotPassword;

// ============================================================
// 5. FRONTEND - src/App.js (ROUTE НЭМЭХ)
// ============================================================

// Import нэмэх:
// import ForgotPassword from './pages/ForgotPassword';

// Routes хэсэгт нэмэх:
// <Route path="/forgot-password" element={<ForgotPassword />} />

// ============================================================
// 6. ХЭРЭГЛЭХ ЗААВАР
// ============================================================

/*
1. Database migration ажиллуулах:
   - MySQL-д 2 талбар нэмэх (reset_password_token, reset_password_expires)

2. Backend файлуудыг шинэчлэх:
   - controllers/authController.js - 2 функц нэмэх
   - routes/authRoutes.js - 2 route нэмэх

3. Frontend файлуудыг үүсгэх:
   - src/pages/ForgotPassword.js
   - src/App.js - route нэмэх

4. Тест хийх:
   - Login хуудас дээр "Нууц үг мартсан?" линк дарах
   - Имэйл оруулах
   - Console-с 6 оронтой код авах
   - Код оруулаад шинэ нууц үг тохируулах
*/