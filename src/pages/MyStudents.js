import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Calendar, Mail } from 'lucide-react';
import axios from 'axios';
import '../styles/MyStudents.css';

function MyStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0
  });

  useEffect(() => {
    fetchMyStudents();
  }, []);

  const fetchMyStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/my-students', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // ✅ Console-д өгөгдөл шалгах
      console.log('✅ Backend-с ирсэн өгөгдөл:', response.data);
      console.log('📊 Суралцагчдын жагсаалт:', response.data.data);

      if (response.data.success) {
        setStudents(response.data.data || []);
        setStats({
          totalCourses: response.data.totalCourses || 0,
          totalStudents: response.data.totalStudents || 0
        });
      }
    } catch (error) {
      console.error('❌ Суралцагчид татахад алдаа:', error);
      console.error('❌ Error response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mystudents-loading">
        <div className="loader"></div>
        <p>Уншиж байна...</p>
      </div>
    );
  }

  return (
    <div className="mystudents">
      <div className="mystudents-header">
        <h1>Миний суралцагчид</h1>
        <p>Таны хичээлд бүртгүүлсэн суралцагчдын жагсаалт</p>
      </div>

      {/* Статистик */}
      <div className="mystudents-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <BookOpen size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalCourses}</div>
            <div className="stat-label">Миний хичээлүүд</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalStudents}</div>
            <div className="stat-label">Нийт суралцагчид</div>
          </div>
        </div>
      </div>

      {/* Суралцагчдын жагсаалт */}
      {students.length === 0 ? (
        <div className="empty-state">
          <Users size={80} />
          <h3>Суралцагч байхгүй байна</h3>
          <p>Таны хичээлд одоогоор хэн ч бүртгүүлээгүй байна</p>
        </div>
      ) : (
        <div className="students-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Нэр</th>
                <th>Имэйл</th>
                <th>Хичээл</th>
                <th>Бүртгүүлсэн огноо</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => {
                console.log('🔍 Rendering student:', student); // ✅ Debug log
                return (
                  <tr key={`student-${student.id}-${student.course_id}-${index}`}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>
                      <div className="email-cell">
                        <Mail size={14} />
                        {student.email}
                      </div>
                    </td>
                    <td>
                      {/* ✅ Хичээлийн нэр - inline style-тай */}
                      <span style={{
                        display: 'inline-block',
                        padding: '6px 14px',
                        background: 'rgba(0, 212, 255, 0.15)',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                        borderRadius: '6px',
                        color: '#00d4ff',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>
                        {student.course_title || 'Хичээл олдсонгүй'}
                      </span>
                    </td>
                    <td>
                      <div className="date-cell">
                        <Calendar size={14} />
                        {new Date(student.enrolled_at).toLocaleDateString('mn-MN')}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyStudents;