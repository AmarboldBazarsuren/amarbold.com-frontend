import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Users, TrendingUp, ArrowRight, Sparkles } from 'lucide-react'; // ✅ Award устгасан
import CourseCarousel from '../components/dashboard/CourseCarousel';
import InstructorCarousel from '../components/dashboard/InstructorCarousel';
import '../styles/Home.css';
import api from '../config/api';

function Home({ user }) {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalInstructors: 0,
    activeInstructors: 0,
    averageRating: '4.8'
  });
  const navigate = useNavigate();

  // ✅ useCallback ашиглан dependency warning арилгах
  const fetchPublicData = useCallback(async () => {
    try {
      // ✅ PUBLIC COURSES - Token шаардахгүй
      const coursesRes = await api.get('/api/public/courses');
      
      // ✅ PUBLIC STATS - Token шаардахгүй
      const statsRes = await api.get('/api/public/stats');
      
      // ✅ INSTRUCTORS - Зөвхөн нэвтэрсэн хэрэглэгчид
      let instructorsRes = { data: { success: true, data: [] } };
      if (user) {
        try {
          instructorsRes = await api.get('/api/instructors');
        } catch (error) {
          console.log('Bagsh татахад алдаа (нэвтрээгүй):', error.message);
        }
      }

      if (coursesRes.data.success) {
        setCourses(coursesRes.data.data.slice(0, 8));
      }

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      if (instructorsRes.data.success) {
        setInstructors(instructorsRes.data.data.slice(0, 8));
      }
    } catch (error) {
      console.error('❌ Өгөгдөл татахад алдаа:', error);
      
      // ✅ Алдаа гарсан ч хуудас харагдах ёстой
      setCourses([]);
      setInstructors([]);
      setStats({
        totalCourses: 0,
        totalInstructors: 0,
        activeInstructors: 0,
        averageRating: '4.8'
      });
    } finally {
      setLoading(false);
    }
  }, [user]); // ✅ user dependency нэмсэн

  useEffect(() => {
    fetchPublicData();
  }, [fetchPublicData]); // ✅ fetchPublicData dependency нэмсэн

  const handleCourseClick = (courseId) => {
    if (user) {
      navigate(`/course/${courseId}`);
    } else {
      alert('Хичээл үзэхийн тулд эхлээд бүртгүүлнэ үү');
      navigate('/login');
    }
  };

  const handleInstructorClick = (instructorId) => {
    if (user) {
      navigate(`/instructor/${instructorId}`);
    } else {
      alert('Багш үзэхийн тулд эхлээд бүртгүүлнэ үү');
      navigate('/login');
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-gradient"></div>
        <div className="container hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>Монголын шилдэг онлайн сургалт</span>
            </div>
            <h1 className="hero-title">
              Ирээдүйгээ бүтээх <br />
              <span className="gradient-text">цахим сургалтын</span> <br />
              платформ
            </h1>
            <p className="hero-description">
              Мэргэжлийн багш нараас сур. Өөрийн цагаараа. Өөрийн хурдаараа.
              Монгол хэл дээрх чанартай контентоор мэдлэгээ өргөжүүлээрэй.
            </p>
            <div className="hero-buttons">
              {user ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg">
                  Хичээл үзэх
                  <ArrowRight size={20} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Бүртгүүлэх
                    <ArrowRight size={20} />
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-lg">
                    Нэвтрэх
                  </Link>
                </>
              )}
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">{stats.totalCourses}+</div>
                <div className="stat-label">Хичээлүүд</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">10,000+</div>
                <div className="stat-label">Суралцагчид</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">{stats.totalInstructors}+</div>
                <div className="stat-label">Багш нар</div>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-card card-1">
              <BookOpen size={32} />
              <span>1000+ Видео хичээл</span>
            </div>
            <div className="floating-card card-3">
              <TrendingUp size={32} />
              <span>Шат дараалалтай</span>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ PUBLIC COURSES SECTION */}
      <section className="public-courses-section">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#808080' }}>
              Уншиж байна...
            </div>
          ) : courses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#808080' }}>
              Одоогоор хичээл байхгүй байна
            </div>
          ) : (
            <CourseCarousel
              title="Сүүлд нэмэгдсэн хичээлүүд"
              courses={courses}
              onCourseClick={handleCourseClick}
            />
          )}

          {!user && courses.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                Бүх хичээлүүдийг үзэх
                <ArrowRight size={20} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ✅ INSTRUCTORS SECTION */}
      {user && instructors.length > 0 && (
        <section className="public-instructors-section">
          <div className="container">
            <InstructorCarousel
              title="Багш нар"
              instructors={instructors}
              onInstructorClick={handleInstructorClick}
            />
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Яагаад Eduvia.mn вэ?</h2>
            <p className="section-subtitle">
              Бид Монголын хамгийн чанартай онлайн сургалтыг хүргэж байна
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <BookOpen size={32} />
              </div>
              <h3>Өргөн сонголт</h3>
              <p>
                Програмчлал, бизнес, дизайн, маркетинг гэх мэт олон салбарын
                мэргэжлийн хичээлүүдээс сонгоорой
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Users size={32} />
              </div>
              <h3>Туршлагатай багш нар</h3>
              <p>
                Салбартаа олон жилийн туршлагатай, амжилттай мэргэжилтнүүдээс
                шууд суралцаарай
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <TrendingUp size={32} />
              </div>
              <h3>Шат дараалалтай</h3>
              <p>
                Анхнаас дунд, дунд түвшнээс ахисан түвшин хүртэл алхам алхмаар
                суралцаарай
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <h2>Өнөөдөр эхлээрэй</h2>
              <p>
                Мянга мянган хүн аль хэдийн Eduvia.mn дээр суралцаж байна.
                Та ч бидэнтэй нэгдээрэй!
              </p>
              {!user && (
                <Link to="/register" className="btn btn-primary btn-lg">
                  Үнэгүй бүртгүүлэх
                  <ArrowRight size={20} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;