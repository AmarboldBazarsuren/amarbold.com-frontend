import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Star, TrendingUp, Search, Filter } from 'lucide-react';
import axios from 'axios';
import './Dashboard.css';

function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Backend-с ирсэн өгөгдлийг шалгах
      if (response.data.success && Array.isArray(response.data.data)) {
        setCourses(response.data.data);
      } else {
        console.error('Буруу өгөгдлийн format:', response.data);
        setCourses([]);
      }
    } catch (error) {
      console.error('Хичээл татахад алдаа гарлаа:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'programming', 'design', 'business', 'marketing'];

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>
        <p>Хичээлүүдийг уншиж байна...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Бүх хичээлүүд</h1>
          <p className="dashboard-subtitle">
            Өөртөө тохирсон хичээлээ сонгоод суралцаж эхлээрэй
          </p>
        </div>
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <BookOpen size={24} />
            <div>
              <div className="stat-value">{courses.length}</div>
              <div className="stat-label">Нийт хичээл</div>
            </div>
          </div>
          <div className="stat-card">
            <TrendingUp size={24} />
            <div>
              <div className="stat-value">50+</div>
              <div className="stat-label">Идэвхтэй багш</div>
            </div>
          </div>
          <div className="stat-card">
            <Star size={24} />
            <div>
              <div className="stat-value">4.8</div>
              <div className="stat-label">Дундаж үнэлгээ</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Хичээл хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <Filter size={20} />
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${filterCategory === cat ? 'active' : ''}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat === 'all' ? 'Бүгд' : 
               cat === 'programming' ? 'Програмчлал' :
               cat === 'design' ? 'Дизайн' :
               cat === 'business' ? 'Бизнес' : 'Маркетинг'}
            </button>
          ))}
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="no-results">
          <BookOpen size={64} />
          <h3>Хичээл олдсонгүй</h3>
          <p>Өөр түлхүүр үгээр хайж үзээрэй</p>
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map(course => (
            <div 
              key={course.id} 
              className="course-card"
              onClick={() => handleCourseClick(course.id)}
            >
              <div className="course-image">
                <img src={course.thumbnail || '/placeholder-course.jpg'} alt={course.title} />
                <div className="course-badge">{course.category}</div>
              </div>
              <div className="course-content">
                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">{course.description}</p>
                <div className="course-meta">
                  <div className="course-instructor">
                    <div className="instructor-avatar">
                      {course.instructor?.name?.charAt(0) || 'B'}
                    </div>
                    <span>{course.instructor?.name || 'Багш'}</span>
                  </div>
                  <div className="course-stats">
                    <div className="stat">
                      <Clock size={16} />
                      <span>{course.duration || '10'} цаг</span>
                    </div>
                    <div className="stat">
                      <Star size={16} />
                      <span>{course.rating || '4.5'}</span>
                    </div>
                  </div>
                </div>
                <div className="course-footer">
                  <div className="course-price">
                    {course.price === 0 ? (
                      <span className="free-badge">Үнэгүй</span>
                    ) : (
                      <span className="price">₮{course.price?.toLocaleString()}</span>
                    )}
                  </div>
                  <button className="btn-enroll">
                    Үзэх
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;