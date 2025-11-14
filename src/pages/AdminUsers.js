import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, Filter, UserPlus } from 'lucide-react';
import axios from 'axios';
import './AdminUsers.css';

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

  // ✅ Одоогийн хэрэглэгчийн эрхийг авах
  const [currentUser, setCurrentUser] = useState(null);

  // ✅ useCallback ашиглаж fetchUsers-г тогтмол болгох
  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      let url = 'http://localhost:5000/api/admin/users?';
      
      if (filterRole !== 'all') url += `role=${filterRole}&`;
      if (filterStatus !== 'all') url += `status=${filterStatus}&`;
      if (searchQuery) url += `search=${searchQuery}&`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

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
  }, [fetchUsers]); // ✅ fetchUsers-г dependency-д нэмэх

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Статус амжилттай өөрчлөгдлөө');
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Алдаа гарлаа');
    }
  };

  // ✅ Веб дээрээс эрх өөрчлөх функц
  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Энэ хэрэглэгчийг ${newRole === 'admin' ? 'Super Admin' : newRole === 'test_admin' ? 'Test Admin' : 'Хэрэглэгч'} болгох уу?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Эрх амжилттай өөрчлөгдлөө');
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Алдаа гарлаа');
    }
  };

  const handleCreateTestAdmin = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/admin/users/create-test-admin',
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
        {/* ✅ Зөвхөн Super Admin л Test Admin үүсгэнэ */}
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
                  <td>{user.enrolled_courses || 0}</td>
                  <td>{new Date(user.created_at).toLocaleDateString('mn-MN')}</td>
                  <td>
                    <div className="action-dropdown">
                      {/* ✅ Өөрийгөө болон Super Admin-г өөрчилж болохгүй */}
                      {user.id !== currentUser?.id && user.role !== 'admin' && currentUser?.role === 'admin' && (
                        <>
                          {/* Статус солих */}
                          <select 
                            onChange={(e) => handleStatusChange(user.id, e.target.value)}
                            value={user.status}
                            className="status-select"
                          >
                            <option value="active">Идэвхтэй</option>
                            <option value="suspended">Түр хаах</option>
                            <option value="banned">Хаах</option>
                          </select>

                          {/* ✅ Эрх солих - Зөвхөн Super Admin */}
                          <select 
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            value={user.role}
                            className="role-select"
                          >
                            <option value="user">Хэрэглэгч</option>
                            <option value="test_admin">Test Admin</option>
                            <option value="admin">Super Admin</option>
                          </select>
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