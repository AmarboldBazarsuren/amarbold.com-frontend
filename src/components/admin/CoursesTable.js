import React from 'react';
import { BookOpen, Eye, Edit, Trash2, Tag } from 'lucide-react';

function CoursesTable({ 
  courses, 
  loading, 
  currentUser,
  onManageCourse,
  onEditCourse,
  onDeleteCourse,
  onOpenDiscount
}) {
  if (loading) {
    return <div className="loading">Уншиж байна...</div>;
  }

  if (courses.length === 0) {
    return (
      <div className="empty-state">
        <BookOpen size={64} />
        <p>
          {currentUser?.role === 'test_admin' 
            ? 'Та одоогоор хичээл нэмээгүй байна' 
            : 'Хичээл байхгүй байна'}
        </p>
      </div>
    );
  }

  return (
    <div className="courses-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Нэр</th>
            <th>Ангилал</th>
            <th>Үнэ</th>
            <th>Суралцагчид</th>
            <th>Үйлдэл</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course.id}>
              <td>{course.id}</td>
              <td>{course.title}</td>
              <td>{course.category}</td>
              <td>
                {course.is_free ? (
                  <span className="badge-free">Үнэгүй</span>
                ) : (
                  <>
                    {/* ✅ Хямдралтай үнэ харуулах */}
                    {course.discount_price ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ 
                          textDecoration: 'line-through', 
                          color: '#808080', 
                          fontSize: '13px' 
                        }}>
                          ₮{course.price.toLocaleString()}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            color: '#34c759', 
                            fontWeight: '700',
                            fontSize: '15px'
                          }}>
                            ₮{course.discount_price.toLocaleString()}
                          </span>
                          <span style={{
                            padding: '2px 6px',
                            background: 'rgba(255, 193, 7, 0.15)',
                            border: '1px solid rgba(255, 193, 7, 0.3)',
                            borderRadius: '4px',
                            color: '#ffc107',
                            fontSize: '11px',
                            fontWeight: '700'
                          }}>
                            -{course.discount_percent}%
                          </span>
                        </div>
                      </div>
                    ) : (
                      `₮${course.price.toLocaleString()}`
                    )}
                  </>
                )}
              </td>
              <td>{course.students || 0}</td>
              <td>
                <div className="action-buttons">
                  <button 
                    className="btn-icon"
                    onClick={() => onManageCourse(course)}
                    title="Агуулга удирдах"
                  >
                    <BookOpen size={16} />
                  </button>
                  <button 
                    className="btn-icon"
                    onClick={() => window.open(`/course/${course.id}`, '_blank')}
                    title="Үзэх"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    className="btn-icon"
                    onClick={() => onOpenDiscount(course)}
                    title="Хямдрал"
                    style={{ color: course.discount_percent ? '#34c759' : '#ffc107' }}
                  >
                    <Tag size={16} />
                  </button>
                  <button 
                    className="btn-icon"
                    onClick={() => onEditCourse(course)}
                    title="Засах"
                  >
                    <Edit size={16} />
                  </button>
                  {currentUser?.role === 'admin' && (
                    <button 
                      className="btn-icon btn-danger"
                      onClick={() => onDeleteCourse(course.id)}
                      title="Устгах"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CoursesTable;