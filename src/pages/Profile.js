import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Shield, Save, Edit2, Award } from 'lucide-react';
import axios from 'axios';
import ImageUpload from '../components/ImageUpload'; // ✅ НЭМСЭН
import '../styles/Profile.css';

function Profile({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingInstructor, setIsEditingInstructor] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [instructorData, setInstructorData] = useState({
    bio: '',
    teaching_categories: '',
    profile_image: '',
    profile_banner: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'test_admin' || user?.role === 'admin') {
      fetchInstructorProfile();
    }
  }, [user]);

  const fetchInstructorProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/auth/me');
      
      if (response.data.success && response.data.user) {
        const userData = response.data.user;
        setInstructorData({
          bio: userData.bio || '',
          teaching_categories: userData.teaching_categories || '',
          profile_image: userData.profile_image || '',
          profile_banner: userData.profile_banner || ''
        });
      }
    } catch (error) {
      console.error('Профайл татахад алдаа:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        '/api/users/profile',
        {
          name: formData.name,
          email: formData.email
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess('Профайл амжилттай шинэчлэгдлээ');
      setIsEditing(false);
      
      const updatedUser = { ...user, name: formData.name, email: formData.email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      setError(err.response?.data?.message || 'Профайл шинэчлэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Шинэ нууц үг таарахгүй байна');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Нууц үг дор хаяж 6 тэмдэгттэй байх ёстой');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        '/api/users/change-password',
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess('Нууц үг амжилттай солигдлоо');
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Нууц үг солихоор алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInstructorProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        '/api/users/instructor-profile',
        instructorData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Багшийн профайл амжилттай шинэчлэгдлээ');
      setIsEditingInstructor(false);
      fetchInstructorProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Профайл шинэчлэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile">
      <div className="profile-header">
        <h1 className="profile-title">Профайл</h1>
        <p className="profile-subtitle">Өөрийн мэдээллээ удирдах</p>
      </div>

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="profile-grid">
        {/* Profile Info Card */}
        <div className="profile-card">
          <div className="card-header">
            <div className="profile-avatar-large">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="profile-info">
              <h2>{user?.name}</h2>
              <p>{user?.email}</p>
              {user?.role === 'admin' && (
                <div className="role-badge super-admin">
                  <Shield size={14} />
                  Super Admin
                </div>
              )}
              {user?.role === 'test_admin' && (
                <div className="role-badge admin">
                  <Shield size={14} />
                  БАГШ
                </div>
              )}
              {user?.role === 'user' && (
                <div className="role-badge user">
                  <User size={14} />
                  Хэрэглэгч
                </div>
              )}
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat-box">
              <Award size={24} />
              <div>
                <div className="stat-value">12</div>
                <div className="stat-label">Хичээл</div>
              </div>
            </div>
            <div className="stat-box">
              <Award size={24} />
              <div>
                <div className="stat-value">8</div>
                <div className="stat-label">Гэрчилгээ</div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Card */}
        <div className="profile-card">
          <div className="card-header">
            <h3>Хувийн мэдээлэл</h3>
            {!isEditing && (
              <button 
                className="btn-edit"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={16} />
                Засах
              </button>
            )}
          </div>

          <form onSubmit={handleUpdateProfile}>
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
                disabled={!isEditing}
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
                disabled={!isEditing}
                required
              />
            </div>

            {isEditing && (
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      ...formData,
                      name: user?.name || '',
                      email: user?.email || ''
                    });
                  }}
                >
                  Цуцлах
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Хадгалж байна...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Хадгалах
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Change Password Card */}
        <div className="profile-card">
          <div className="card-header">
            <h3>Нууц үг солих</h3>
          </div>

          <form onSubmit={handleChangePassword}>
            <div className="input-group">
              <label htmlFor="currentPassword">
                <Lock size={16} />
                Одоогийн нууц үг
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            <div className="input-group">
              <label htmlFor="newPassword">
                <Lock size={16} />
                Шинэ нууц үг
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">
                <Lock size={16} />
                Шинэ нууц үг давтах
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={loading || !formData.currentPassword || !formData.newPassword}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Солиж байна...
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Нууц үг солих
                </>
              )}
            </button>
          </form>
        </div>

        {/* ✅✅✅ БАГШИЙН ТАНИЛЦУУЛГА - ImageUpload-тай */}
        {(user?.role === 'test_admin' || user?.role === 'admin') && !isEditingInstructor && (
          <div className="profile-card">
            <div className="card-header">
              <h3>Багшийн танилцуулга</h3>
              <button 
                className="btn-edit"
                onClick={() => setIsEditingInstructor(true)}
              >
                <Edit2 size={16} />
                Засах
              </button>
            </div>

            <div className="instructor-display">
              {instructorData.bio ? (
                <div className="display-section">
                  <label>
                    <User size={16} />
                    Миний тухай
                  </label>
                  <div className="display-value">{instructorData.bio}</div>
                </div>
              ) : (
                <p style={{color: '#808080', fontSize: '14px'}}>Танилцуулга нэмэгдээгүй байна</p>
              )}

              {instructorData.teaching_categories && (
                <div className="display-section">
                  <label>Заадаг хичээлийн төрөл</label>
                  <div className="display-value">{instructorData.teaching_categories}</div>
                </div>
              )}

              {instructorData.profile_image && (
                <div className="display-section">
                  <label>Профайл зураг</label>
                  <img 
                    src={instructorData.profile_image} 
                    alt="Profile" 
                    className="profile-preview-image"
                  />
                </div>
              )}

              {instructorData.profile_banner && (
                <div className="display-section">
                  <label>Баннер зураг</label>
                  <img 
                    src={instructorData.profile_banner} 
                    alt="Banner" 
                    className="profile-preview-banner"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ✅✅✅ БАГШИЙН ТАНИЛЦУУЛГА - ЗАСАХ ГОРИМ (ImageUpload) */}
        {(user?.role === 'test_admin' || user?.role === 'admin') && isEditingInstructor && (
          <div className="profile-card">
            <div className="card-header">
              <h3>Багшийн танилцуулга засах</h3>
            </div>

            <form onSubmit={handleUpdateInstructorProfile}>
              <div className="input-group">
                <label htmlFor="bio">Миний тухай</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={instructorData.bio}
                  onChange={(e) => setInstructorData({...instructorData, bio: e.target.value})}
                  rows="5"
                  placeholder="Өөрийнхөө тухай бичнэ үү..."
                />
              </div>

              <div className="input-group">
                <label htmlFor="teaching_categories">Заадаг хичээлийн төрөл</label>
                <input
                  type="text"
                  id="teaching_categories"
                  name="teaching_categories"
                  value={instructorData.teaching_categories}
                  onChange={(e) => setInstructorData({...instructorData, teaching_categories: e.target.value})}
                  placeholder="Жишээ: Програмчлал, Веб хөгжүүлэлт, React"
                />
              </div>

              {/* ✅✅✅ ПРОФАЙЛ ЗУРАГ UPLOAD */}
              <ImageUpload
                label="Профайл зураг"
                onUploadSuccess={(url) => setInstructorData({...instructorData, profile_image: url})}
                currentImage={instructorData.profile_image}
                uploadType="profile-image"
              />

              {/* ✅✅✅ БАННЕР ЗУРАГ UPLOAD */}
              <ImageUpload
                label="Баннер зураг"
                onUploadSuccess={(url) => setInstructorData({...instructorData, profile_banner: url})}
                currentImage={instructorData.profile_banner}
                uploadType="profile-banner"
              />

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsEditingInstructor(false);
                    fetchInstructorProfile();
                  }}
                >
                  Цуцлах
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Хадгалж байна...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Хадгалах
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;