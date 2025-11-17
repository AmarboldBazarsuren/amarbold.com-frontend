// src/pages/AdminUsers.js

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, Filter, UserPlus, Trash2, Eye, X } from 'lucide-react';
import axios from 'axios';
import '../styles/AdminUsers.css';
import api from '../config/api';
function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showTestAdminForm, setShowTestAdminForm] = useState(false);
  const [testAdminData, setTestAdminData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // ✅ User detail modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [userCourses, setUserCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      let url = '/api/admin/users?';
      
      if (filterRole !== 'all') url += `role=${filterRole}&`;
      if (filterStatus !== 'all') url += `status=${filterStatus}&`;
      if (searchQuery) url += `search=${searchQuery}&`;

      const response = await api.get(url);

      if (response.data.success) {
        setUsers(response.data.data || []);
      }
    } catch (error) {
      console.error('Хэрэглэгчид татахад алдаа:', error);
    } finally {
      setLoading(false);
    }
  }, [filterRole, filterStatus, searchQuery]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/admin/users/${userId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Статус амжилттай өөрчлөгдлөө');
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Алдаа гарлаа');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Энэ хэрэглэгчийг ${newRole === 'admin' ? 'Super Admin' : newRole === 'test_admin' ? 'Test Admin' : 'Хэрэглэгч'} болгох уу?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Эрх амжилттай өөрчлөгдлөө');
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Алдаа гарлаа');
    }
  };

  // ✅ Хэрэглэгч устгах
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`"${userName}" хэрэглэгчийг бүрмөсөн устгах уу?\n\nӨгөгдөл:\n- Бүртгэл\n- Прогресс\n- Үнэлгээ\n\nБҮХ устах болно!`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `/api/admin/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Хэрэглэгч амжилттай устгагдлаа');
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Алдаа гарлаа');
    }
  };

  // ✅ Хэрэглэгчийн хичээлүүд харах
  const handleViewUserCourses = async (user) => {
    setSelectedUser(user);
    setLoadingCourses(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(
        `/api/admin/users/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setUserCourses(response.data.data.enrollments || []);
      }
    } catch (error) {
      console.error('Хичээл татахад алдаа:', error);
      setUserCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleCreateTestAdmin = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/admin/users/create-test-admin',
        testAdminData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Test Admin амжилттай үүсгэлээ');
      setShowTestAdminForm(false);
      setTestAdminData({ name: '', email: '', password: '' });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Алдаа гарлаа');
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') return <span className="badge-admin">Super Admin</span>;
    if (role === 'test_admin') return <span className="badge-test-admin">Test Admin</span>;
    return <span className="badge-user">Хэрэглэгч</span>;
  };

  const getStatusBadge = (status) => {
    if (status === 'active') return <span className="badge-active">Идэвхтэй</span>;
    if (status === 'suspended') return <span className="badge-suspended">Түр хаагдсан</span>;
    return <span className="badge-banned">Хаагдсан</span>;
  };

  return (
    <div className="admin-users">
      <div className="users-header">
        <div>
          <h1>Хэрэглэгчид</h1>
          <p>{users.length} хэрэглэгч</p>
        </div>
        {currentUser?.role === 'admin' && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowTestAdminForm(true)}
          >
            <UserPlus size={20} />
            Test Admin үүсгэх
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="users-filters">
        <form onSubmit={handleSearch} className="search-form">
          <Search size={20} />
          <input
            type="text"
            placeholder="Нэр эсвэл имэйлээр хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary">Хайх</button>
        </form>

        <div className="filter-buttons">
          <Filter size={20} />
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">Бүх эрх</option>
            <option value="user">Хэрэглэгч</option>
            <option value="test_admin">Test Admin</option>
            <option value="admin">Admin</option>
          </select>

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Бүх статус</option>
            <option value="active">Идэвхтэй</option>
            <option value="suspended">Түр хаагдсан</option>
            <option value="banned">Хаагдсан</option>
          </select>
        </div>
      </div>

      {/* Test Admin Form Modal */}
      {showTestAdminForm && (
        <div className="modal-overlay" onClick={() => setShowTestAdminForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Test Admin үүсгэх</h2>
            <form onSubmit={handleCreateTestAdmin}>
              <div className="input-group">
                <label>Нэр *</label>
                <input
                  type="text"
                  value={testAdminData.name}
                  onChange={(e) => setTestAdminData({...testAdminData, name: e.target.value})}
                  required
                />
              </div>

              <div className="input-group">
                <label>Имэйл *</label>
                <input
                  type="email"
                  value={testAdminData.email}
                  onChange={(e) => setTestAdminData({...testAdminData, email: e.target.value})}
                  required
                />
              </div>

              <div className="input-group">
                <label>Нууц үг *</label>
                <input
                  type="password"
                  value={testAdminData.password}
                  onChange={(e) => setTestAdminData({...testAdminData, password: e.target.value})}
                  required
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowTestAdminForm(false)}
                >
                  Болих
                </button>
                <button type="submit" className="btn btn-primary">
                  Үүсгэх
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ User Courses Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2>{selectedUser.name} - Хичээлүүд</h2>
                <p style={{ color: '#808080', fontSize: '14px', marginTop: '4px' }}>
                  {selectedUser.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255, 59, 48, 0.1)',
                  border: '1px solid rgba(255, 59, 48, 0.3)',
                  color: '#ff3b30',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {loadingCourses ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#808080' }}>
                Уншиж байна...
              </div>
            ) : userCourses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#808080' }}>
                Энэ хэрэглэгч хичээлд бүртгүүлээгүй байна
              </div>
            ) : (
              <div className="user-courses-list">
                {userCourses.map((enrollment) => (
                  <div key={enrollment.id} className="user-course-item">
                    <img 
                      src={enrollment.thumbnail || '/placeholder-course.jpg'} 
                      alt={enrollment.title}
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '8px',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '16px', color: '#ffffff', marginBottom: '4px' }}>
                        {enrollment.title}
                      </h3>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#808080' }}>
                        <span>Бүртгүүлсэн: {new Date(enrollment.enrolled_at).toLocaleDateString('mn-MN')}</span>
                        <span>Төлбөр: {enrollment.payment_status === 'paid' ? `₮${enrollment.payment_amount?.toLocaleString()}` : 'Үнэгүй'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="loading">Уншиж байна...</div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <Users size={64} />
          <p>Хэрэглэгч олдсонгүй</p>
        </div>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Нэр</th>
                <th>Имэйл</th>
                <th>Эрх</th>
                <th>Статус</th>
                <th>Хичээлүүд</th>
                <th>Бүртгэлсэн</th>
                <th>Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{getStatusBadge(user.status)}</td>
                  <td>
                    <button
                      onClick={() => handleViewUserCourses(user)}
                      style={{
                        padding: '4px 12px',
                        background: 'rgba(0, 212, 255, 0.1)',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                        borderRadius: '6px',
                        color: '#00d4ff',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Eye size={14} />
                      {user.enrolled_courses || 0}
                    </button>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString('mn-MN')}</td>
                  <td>
                    <div className="action-dropdown">
                      {user.id !== currentUser?.id && user.role !== 'admin' && currentUser?.role === 'admin' && (
                        <>
                          <select 
                            onChange={(e) => handleStatusChange(user.id, e.target.value)}
                            value={user.status}
                            className="status-select"
                          >
                            <option value="active">Идэвхтэй</option>
                            <option value="suspended">Түр хаах</option>
                            <option value="banned">Хаах</option>
                          </select>

                          <select 
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            value={user.role}
                            className="role-select"
                          >
                            <option value="user">Хэрэглэгч</option>
                            <option value="test_admin">Test Admin</option>
                            <option value="admin">Super Admin</option>
                          </select>

                          {/* ✅ Устгах товч */}
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            style={{
                              padding: '6px 12px',
                              background: 'rgba(255, 59, 48, 0.1)',
                              border: '1px solid rgba(255, 59, 48, 0.3)',
                              borderRadius: '6px',
                              color: '#ff3b30',
                              fontSize: '13px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Trash2 size={14} />
                            Устгах
                          </button>
                        </>
                      )}
                      {user.id === currentUser?.id && <span className="self-indicator">Та</span>}
                      {user.role === 'admin' && user.id !== currentUser?.id && (
                        <span className="protected-user">Хамгаалагдсан</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;