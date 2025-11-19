import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Clock, Star } from 'lucide-react';

function CourseCarousel({ title, courses, onCourseClick }) {
  const [maxScroll, setMaxScroll] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
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
  const rafRef = useRef(null);

  useEffect(() => {
    if (trackRef.current && carouselRef.current) {
      const maxScrollWidth = trackRef.current.scrollWidth - carouselRef.current.clientWidth;
      setMaxScroll(maxScrollWidth);
      setCanScrollRight(maxScrollWidth > 0);
    }
  }, [courses]);

  // 🔥 UPDATE BUTTONS
  const updateButtons = useCallback(() => {
    setCanScrollLeft(scrollPosRef.current > 10);
    setCanScrollRight(scrollPosRef.current < maxScroll - 10);
  }, [maxScroll]);

  // 🔥 ULTRA SMOOTH MOMENTUM - 120fps ready
  const animateMomentum = useCallback(() => {
    if (Math.abs(velocityRef.current) > 0.1) {
      velocityRef.current *= 0.94; // Илүү удаан удааширна
      scrollPosRef.current += velocityRef.current;

      // Elastic bounce effect
      if (scrollPosRef.current < 0) {
        scrollPosRef.current *= 0.7;
        velocityRef.current *= 0.5;
        if (Math.abs(scrollPosRef.current) < 1) {
          scrollPosRef.current = 0;
          velocityRef.current = 0;
        }
      } else if (scrollPosRef.current > maxScroll) {
        const overshoot = scrollPosRef.current - maxScroll;
        scrollPosRef.current = maxScroll + overshoot * 0.7;
        velocityRef.current *= 0.5;
        if (overshoot < 1) {
          scrollPosRef.current = maxScroll;
          velocityRef.current = 0;
        }
      }

      // GPU optimized transform
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(-${scrollPosRef.current}px, 0, 0)`;
      }

      updateButtons();
      rafRef.current = requestAnimationFrame(animateMomentum);
    } else {
      velocityRef.current = 0;
      updateButtons();
    }
  }, [maxScroll, updateButtons]);

  const scroll = (direction) => {
    const scrollAmount = 350;
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosRef.current - scrollAmount)
      : Math.min(maxScroll, scrollPosRef.current + scrollAmount);
    
    scrollPosRef.current = newPosition;
    velocityRef.current = 0;
    
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      trackRef.current.style.transform = `translate3d(-${newPosition}px, 0, 0)`;
      
      setTimeout(() => {
        if (trackRef.current) {
          trackRef.current.style.transition = 'none';
        }
        updateButtons();
      }, 800);
    }

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  };

  // 🔥 SMOOTH DRAG START
  const handleDragStart = useCallback((pageX) => {
    isDraggingRef.current = true;
    startXRef.current = pageX;
    currentXRef.current = pageX;
    lastXRef.current = pageX;
    lastTimeRef.current = performance.now(); // Илүү нарийвчлалтай
    velocityRef.current = 0;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    if (trackRef.current) {
      trackRef.current.style.transition = 'none';
    }

    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grabbing';
      carouselRef.current.style.userSelect = 'none';
    }
  }, []);

  // 🔥 ULTRA SMOOTH DRAG MOVE
  const handleDragMove = useCallback((pageX) => {
    if (!isDraggingRef.current) return;

    currentXRef.current = pageX;
    const currentTime = performance.now();
    const timeDiff = currentTime - lastTimeRef.current;

    if (timeDiff > 0) {
      const distance = lastXRef.current - pageX;
      velocityRef.current = (distance / timeDiff) * 16; // 60fps base
    }

    lastXRef.current = pageX;
    lastTimeRef.current = currentTime;

    const totalDistance = startXRef.current - pageX;
    let newPos = scrollPosRef.current + totalDistance;
    
    // Rubber band effect on edges
    if (newPos < 0) {
      newPos = newPos * 0.3;
    } else if (newPos > maxScroll) {
      const overshoot = newPos - maxScroll;
      newPos = maxScroll + overshoot * 0.3;
    }
    
    startXRef.current = pageX;
    scrollPosRef.current = newPos;

    // Direct GPU transform
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(-${newPos}px, 0, 0)`;
    }
  }, [maxScroll]);

  // 🔥 SMOOTH DRAG END
  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;

    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grab';
      carouselRef.current.style.userSelect = '';
    }

    // Snap back if overscrolled
    if (scrollPosRef.current < 0) {
      velocityRef.current = Math.abs(velocityRef.current);
    } else if (scrollPosRef.current > maxScroll) {
      velocityRef.current = -Math.abs(velocityRef.current);
    }

    // Start momentum if velocity is significant
    if (Math.abs(velocityRef.current) > 0.1) {
      rafRef.current = requestAnimationFrame(animateMomentum);
    } else {
      updateButtons();
    }
  }, [animateMomentum, maxScroll, updateButtons]);

  // Mouse handlers
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    handleDragStart(e.pageX);
  }, [handleDragStart]);

  const handleMouseMove = useCallback((e) => {
    if (isDraggingRef.current) {
      e.preventDefault();
      handleDragMove(e.pageX);
    }
  }, [handleDragMove]);

  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current) {
      handleDragEnd();
    }
  }, [handleDragEnd]);

  const handleMouseLeave = useCallback(() => {
    if (isDraggingRef.current) {
      handleDragEnd();
    }
  }, [handleDragEnd]);

  // Touch handlers
  const handleTouchStart = useCallback((e) => {
    handleDragStart(e.touches[0].pageX);
  }, [handleDragStart]);

  const handleTouchMove = useCallback((e) => {
    if (isDraggingRef.current) {
      e.preventDefault();
      handleDragMove(e.touches[0].pageX);
    }
  }, [handleDragMove]);

  const handleTouchEnd = useCallback(() => {
    if (isDraggingRef.current) {
      handleDragEnd();
    }
  }, [handleDragEnd]);

  // Card click handler
  const handleCardClick = useCallback((courseId, e) => {
    const dragDistance = Math.abs(startXRef.current - currentXRef.current);
    if (dragDistance > 5) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onCourseClick(courseId);
  }, [onCourseClick]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
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
            disabled={!canScrollLeft}
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            className="carousel-btn"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
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
          touchAction: 'pan-y',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        <div 
          ref={trackRef}
          className="carousel-track"
          style={{ 
            transform: 'translate3d(0px, 0, 0)',
            transition: 'none',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            perspective: 1000
          }}
        >
          {courses.map((course) => (
            <div 
              key={course.id} 
              className="carousel-item"
              onClick={(e) => handleCardClick(course.id, e)}
              style={{ 
                cursor: 'pointer',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none'
              }}
            >
              <div className="course-card">
                <div className="course-image">
                  <img 
                    src={course.thumbnail || '/placeholder-course.jpg'} 
                    alt={course.title}
                    draggable="false"
                    style={{ 
                      pointerEvents: 'none',
                      userSelect: 'none',
                      WebkitUserDrag: 'none'
                    }}
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
                    <button className="btn-enroll" onClick={(e) => e.stopPropagation()}>
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