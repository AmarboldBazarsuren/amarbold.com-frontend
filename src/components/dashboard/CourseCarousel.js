import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Star } from 'lucide-react';

function CourseCarousel({ title, courses, onCourseClick }) {
  const [maxScroll, setMaxScroll] = useState(0);
  const carouselRef = useRef(null);
  const trackRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animationRef = useRef(null);
  const scrollPosRef = useRef(0);

  useEffect(() => {
    if (trackRef.current && carouselRef.current) {
      const maxScrollWidth = trackRef.current.scrollWidth - carouselRef.current.clientWidth;
      setMaxScroll(maxScrollWidth);
    }
  }, [courses]);

  // 🔥 MOMENTUM ANIMATION - useRef ашиглаж state update багасгана
  const animateMomentum = () => {
    if (Math.abs(velocityRef.current) > 0.3) {
      velocityRef.current *= 0.92; // Удааших хурд
      scrollPosRef.current += velocityRef.current;

      // Boundary check
      if (scrollPosRef.current < 0) {
        scrollPosRef.current = 0;
        velocityRef.current = 0;
      } else if (scrollPosRef.current > maxScroll) {
        scrollPosRef.current = maxScroll;
        velocityRef.current = 0;
      }

      // DOM шууд засна - React state-гүй
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${scrollPosRef.current}px)`;
      }

      animationRef.current = requestAnimationFrame(animateMomentum);
    } else {
      velocityRef.current = 0;
    }
  };

  const scroll = (direction) => {
    const scrollAmount = 320 + 28;
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosRef.current - scrollAmount)
      : Math.min(maxScroll, scrollPosRef.current + scrollAmount);
    
    scrollPosRef.current = newPosition;
    velocityRef.current = 0;
    
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      trackRef.current.style.transform = `translateX(-${newPosition}px)`;
      
      setTimeout(() => {
        if (trackRef.current) {
          trackRef.current.style.transition = 'none';
        }
      }, 600);
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  // 🔥 DRAG START
  const handleDragStart = (pageX) => {
    isDraggingRef.current = true;
    startXRef.current = pageX;
    currentXRef.current = pageX;
    lastXRef.current = pageX;
    lastTimeRef.current = Date.now();
    velocityRef.current = 0;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (trackRef.current) {
      trackRef.current.style.transition = 'none';
    }

    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grabbing';
    }
  };

  // 🔥 DRAG MOVE - Маш хурдан, state update байхгүй
  const handleDragMove = (pageX) => {
    if (!isDraggingRef.current) return;

    currentXRef.current = pageX;
    const currentTime = Date.now();
    const timeDiff = currentTime - lastTimeRef.current;

    // Velocity тооцоолох
    if (timeDiff > 0) {
      velocityRef.current = (lastXRef.current - pageX) / timeDiff * 20; // Илүү хүчтэй
    }

    lastXRef.current = pageX;
    lastTimeRef.current = currentTime;

    // Scroll position шинэчлэх
    const distance = startXRef.current - pageX;
    const newPos = Math.max(0, Math.min(maxScroll, scrollPosRef.current + distance));
    
    startXRef.current = pageX;
    scrollPosRef.current = newPos;

    // DOM шууд засна
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${newPos}px)`;
    }
  };

  // 🔥 DRAG END - Momentum эхлүүлнэ
  const handleDragEnd = () => {
    isDraggingRef.current = false;

    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grab';
    }

    // Momentum эхлүүлэх
    if (Math.abs(velocityRef.current) > 0.3) {
      animationRef.current = requestAnimationFrame(animateMomentum);
    }
  };

  // Mouse handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    handleDragStart(e.pageX);
  };

  const handleMouseMove = (e) => {
    handleDragMove(e.pageX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleMouseLeave = () => {
    if (isDraggingRef.current) {
      handleDragEnd();
    }
  };

  // Touch handlers
  const handleTouchStart = (e) => {
    handleDragStart(e.touches[0].pageX);
  };

  const handleTouchMove = (e) => {
    e.preventDefault(); // Prevent scroll
    handleDragMove(e.touches[0].pageX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Card click handler
  const handleCardClick = (courseId, e) => {
    const dragDistance = Math.abs(startXRef.current - currentXRef.current);
    if (dragDistance > 10) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onCourseClick(courseId);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

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
            disabled={scrollPosRef.current === 0}
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            className="carousel-btn"
            onClick={() => scroll('right')}
            disabled={scrollPosRef.current >= maxScroll}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div 
        ref={carouselRef}
        className="courses-carousel"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          cursor: 'grab',
          touchAction: 'pan-y' // Vertical scroll зөвшөөрнө, horizontal disable
        }}
      >
        <div 
          ref={trackRef}
          className="carousel-track"
          style={{ 
            transform: 'translateX(0px)',
            transition: 'none',
            willChange: 'transform'
          }}
        >
          {courses.map((course) => (
            <div 
              key={course.id} 
              className="carousel-item"
              onClick={(e) => handleCardClick(course.id, e)}
              style={{ 
                cursor: isDraggingRef.current ? 'grabbing' : 'pointer',
                userSelect: 'none',
                WebkitUserSelect: 'none'
              }}
            >
              <div className="course-card">
                <div className="course-image">
                  <img 
                    src={course.thumbnail || '/placeholder-course.jpg'} 
                    alt={course.title}
                    draggable="false"
                    style={{ pointerEvents: 'none' }}
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