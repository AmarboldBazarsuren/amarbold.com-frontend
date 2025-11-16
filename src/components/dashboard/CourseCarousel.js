import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Star } from 'lucide-react';

function CourseCarousel({ title, courses, onCourseClick }) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const carouselRef = useRef(null);
  const [maxScroll, setMaxScroll] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollPosition, setStartScrollPosition] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      const track = carouselRef.current;
      const maxScrollWidth = track.scrollWidth - track.clientWidth;
      setMaxScroll(maxScrollWidth);
    }
  }, [courses]);

  const scroll = (direction) => {
    const scrollAmount = 320 + 28; // card width + gap
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(maxScroll, scrollPosition + scrollAmount);
    
    setScrollPosition(newPosition);
  };

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX);
    setStartScrollPosition(scrollPosition);
    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = (startX - x) * 1.5; // Scroll speed multiplier
    const newPosition = Math.max(0, Math.min(maxScroll, startScrollPosition + walk));
    setScrollPosition(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grab';
    }
  };

  // Touch handlers
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX);
    setStartScrollPosition(scrollPosition);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX;
    const walk = (startX - x) * 1.2;
    const newPosition = Math.max(0, Math.min(maxScroll, startScrollPosition + walk));
    setScrollPosition(newPosition);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (courses.length === 0) {
    return null;
  }

  return (
    <div className="courses-carousel-section">
      <div className="carousel-header">
        <h2 className="carousel-title">{title}</h2>
        <div className="carousel-controls">
          <button 
            className="carousel-btn"
            onClick={() => scroll('left')}
            disabled={scrollPosition === 0}
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            className="carousel-btn"
            onClick={() => scroll('right')}
            disabled={scrollPosition >= maxScroll}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div 
        className="courses-carousel"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div 
          ref={carouselRef}
          className="carousel-track"
          style={{ 
            transform: `translateX(-${scrollPosition}px)`,
            transition: isDragging ? 'none' : 'transform 0.5s ease'
          }}
        >
          {courses.map((course) => (
            <div 
              key={course.id} 
              className="carousel-item"
              onClick={(e) => {
                // Drag хийж байгаа бол card дээр дарахгүй
                if (isDragging) {
                  e.preventDefault();
                  return;
                }
                onCourseClick(course.id);
              }}
              style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
            >
              <div className="course-card">
                <div className="course-image">
                  <img 
                    src={course.thumbnail || '/placeholder-course.jpg'} 
                    alt={course.title} 
                  />
                  <div className="course-badge">{course.category}</div>
                  {course.discount_percent && (
                    <div className="discount-badge-card">-{course.discount_percent}%</div>
                  )}
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
                        <>
                          {course.discount_price ? (
                            <div className="price-with-discount">
                              <span className="original-price">₮{course.price?.toLocaleString()}</span>
                              <span className="discount-price">₮{course.discount_price?.toLocaleString()}</span>
                            </div>
                          ) : (
                            <span className="price">₮{course.price?.toLocaleString()}</span>
                          )}
                        </>
                      )}
                    </div>
                    <button className="btn-enroll">
                      Үзэх
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CourseCarousel;