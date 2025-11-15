import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Star, TrendingUp, Search, Filter, Users } from 'lucide-react';
import axios from 'axios';
import '../styles/Dashboard.css';

function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('courses');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
    fetchInstructors();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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

  const fetchInstructors = async () => {
  try {
    const token = localStorage.getItem('token');
    console.log('🔐 Token:', token ? 'Байна' : '❌ БАЙХГҮЙ!');
    
    if (!token) {
      console.error('❌ Token байхгүй - нэвтрэх хэрэгтэй');
      return;
    }
    
    console.log('📡 API дуудаж байна: http://localhost:5000/api/instructors');
    
    const response = await axios.get('http://localhost:5000/api/instructors', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Response:', response.data);
    
    if (response.data.success && Array.isArray(response.data.data)) {
      console.log('✅ Багш нар:', response.data.data);
      setInstructors(response.data.data);
    } else {
      console.error('❌ Буруу format:', response.data);
      setInstructors([]);
    }
  } catch (error) {
    console.error('❌ Багш нар татахад АЛДАА:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    setInstructors([]);
  }
};

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (instructor.teaching_categories && instructor.teaching_categories.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const categories = ['all', 'programming', 'design', 'business', 'marketing'];

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const handleInstructorClick = (instructorId) => {
    navigate(`/instructor/${instructorId}`);
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
          <h1 className="dashboard-title">
            {activeTab === 'courses' ? 'Бүх хичээлүүд' : 'Багш нар'}
          </h1>
          <p className="dashboard-subtitle">
            {activeTab === 'courses' 
              ? 'Өөртөө тохирсон хичээлээ сонгоод суралцаж эхлээрэй'
              : 'Мэргэжлийн багш нараас сонгоорой'
            }
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
            <Users size={24} />
            <div>
              <div className="stat-value">{instructors.length}</div>
              <div className="stat-label">Багш нар</div>
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

      {/* Tab Buttons */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          <BookOpen size={20} />
          Хичээлүүд
        </button>
        <button 
          className={`tab-btn ${activeTab === 'instructors' ? 'active' : ''}`}
          onClick={() => setActiveTab('instructors')}
        >
          <Users size={20} />
          Багш нар
        </button>
      </div>

      <div className="dashboard-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder={activeTab === 'courses' ? 'Хичээл хайх...' : 'Багш хайх...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {activeTab === 'courses' && (
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
        )}
      </div>

      {/* COURSES TAB */}
      {activeTab === 'courses' && (
        <>
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
        </>
      )}

      {/* INSTRUCTORS TAB */}
      {activeTab === 'instructors' && (
        <>
          {filteredInstructors.length === 0 ? (
            <div className="no-results">
              <Users size={64} />
              <h3>Багш олдсонгүй</h3>
              <p>Багш нар одоогоор байхгүй байна</p>
            </div>
          ) : (
            <div className="instructors-grid">
              {filteredInstructors.map(instructor => (
                <div 
                  key={instructor.id} 
                  className="instructor-card"
                  onClick={() => handleInstructorClick(instructor.id)}
                >
                  <div className="instructor-banner">
                    {instructor.profile_banner ? (
                      <img src={instructor.profile_banner} alt="" />
                    ) : (
                      <div className="banner-gradient"></div>
                    )}
                  </div>
                  <div className="instructor-content">
                    <div className="instructor-avatar-large">
                      {instructor.profile_image ? (
                        <img src={instructor.profile_image} alt={instructor.name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {instructor.name?.charAt(0) || 'B'}
                        </div>
                      )}
                    </div>
                    <h3 className="instructor-name">{instructor.name}</h3>
                    {instructor.teaching_categories && (
                      <p className="instructor-category">{instructor.teaching_categories}</p>
                    )}
                    {instructor.bio && instructor.bio !== 'Танилцуулга нэмэгдээгүй байна' && (
                      <p className="instructor-bio">{instructor.bio.substring(0, 100)}...</p>
                    )}
                    <div className="instructor-stats">
                      <div className="stat-item">
                        <BookOpen size={18} />
                        <span>{instructor.total_courses || 0} хичээл</span>
                      </div>
                      <div className="stat-item">
                        <Users size={18} />
                        <span>{instructor.total_students || 0} суралцагч</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;