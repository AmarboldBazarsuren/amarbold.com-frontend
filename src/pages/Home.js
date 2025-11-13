import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Award, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import './Home.css';

function Home({ user }) {
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
                <div className="stat-number">500+</div>
                <div className="stat-label">Хичээлүүд</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">10,000+</div>
                <div className="stat-label">Суралцагчид</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Багш нар</div>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-card card-1">
              <BookOpen size={32} />
              <span>1000+ Видео хичээл</span>
            </div>
            <div className="floating-card card-2">
              <Award size={32} />
              <span>Гэрчилгээ олгоно</span>
            </div>
            <div className="floating-card card-3">
              <TrendingUp size={32} />
              <span>Шат дараалалтай</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Яагаад AmarBold.mn вэ?</h2>
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
            <div className="feature-card">
              <div className="feature-icon">
                <Award size={32} />
              </div>
              <h3>Гэрчилгээ олгоно</h3>
              <p>
                Хичээлээ амжилттай дуусгасан тохиолдолд төгсөлтийн гэрчилгээ
                авах боломжтой
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
                Мянга мянган хүн аль хэдийн AmarBold.mn дээр суралцаж байна.
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