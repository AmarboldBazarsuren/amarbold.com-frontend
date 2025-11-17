import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import '../styles/AdminDashboard.css';
import api from '../config/api';  // ✅ Энийг нэмэх

// Components
import AdminStats from '../components/admin/AdminStats';
import CourseFormModal from '../components/admin/CourseFormModal';
import CourseContentModal from '../components/admin/CourseContentModal';
import LessonFormModal from '../components/admin/LessonFormModal';
import DiscountModal from '../components/admin/DiscountModal';
import CoursesTable from '../components/admin/CoursesTable';
function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    newUsersThisMonth: 0,
    topCourses: []
  });
  
  const [courses, setCourses] = useState([]);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Course Form Data
 const [formData, setFormData] = useState({
  title: '',
  description: '',
  full_description: '',
  category_id: '',  // ✅ Хоосон байж болно
  price: 0,
  is_free: false,
  duration: 0,
  thumbnail: '',
  preview_video_url: ''  // ✅ Шинэ талбар
});
  
  // Section Management
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [sectionFormData, setSectionFormData] = useState({
    title: '',
    description: '',
    order_number: 0
  });
  const [editingSection, setEditingSection] = useState(null);
  
  // Lesson Management
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    duration: 0,
    order_number: 0,
    is_free_preview: false
  });
  const [editingLesson, setEditingLesson] = useState(null);
  
  // Discount Management
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [selectedCourseForDiscount, setSelectedCourseForDiscount] = useState(null);
 const [discountFormData, setDiscountFormData] = useState({
  discount_percent: 10,
  end_date: ''
});
  const [courseDiscounts, setCourseDiscounts] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
    fetchStats();
    fetchAllCourses();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('api/admin/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Статистик татахад алдаа:', error);
    }
  };

  const fetchAllCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/admin/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setCourses(response.data.data || []);
      }
    } catch (error) {
      console.error('Хичээлүүд татахад алдаа:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (editingCourse) {
        await api.put(
          `api/admin/courses/${editingCourse.id}`,
          { ...formData, status: 'published' },
         
        );
        alert('Хичээл амжилттай шинэчлэгдлээ');
      } else { await api.post(
          'api/admin/courses',
          formData,
         
        );
        alert('Хичээл амжилттай үүсгэлээ');
      }
      
      setShowCourseForm(false);
      setEditingCourse(null);
      resetForm();
      fetchAllCourses();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Алдаа гарлаа');
    }
  };

  const handleEdit = (course) => {
  setEditingCourse(course);
  setFormData({
    title: course.title,
    description: course.description,
    full_description: course.full_description || course.description,
    category_id: course.category_id || '',
    price: course.price,
    is_free: course.is_free,
    duration: course.duration,
    thumbnail: course.thumbnail || '',
    preview_video_url: course.preview_video_url || ''
  });
  setShowCourseForm(true);
};

  const handleDelete = async (courseId) => {
    if (!window.confirm('Энэ хичээлийг устгах уу?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.delete(
        `/api/admin/courses/${courseId}`,
      );
      alert('Хичээл амжилттай устгагдлаа');
      fetchAllCourses();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Алдаа гарлаа');
    }
  };

 const resetForm = () => {
  setFormData({
    title: '',
    description: '',
    full_description: '',
    category_id: '',
    price: 0,
    is_free: false,
    duration: 0,
    thumbnail: '',
    preview_video_url: ''
  });
};

  const handleManageCourse = async (course) => {
    setSelectedCourse(course);
    await fetchCourseSections(course.id);
    setShowSectionForm(false);
    setShowLessonForm(false);
  };

  const fetchCourseSections = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`${process.env.REACT_APP_API_URL}/api/courses/${courseId}`);
      if (response.data.success && response.data.course.sections) {
        setSections(response.data.course.sections);
      }
    } catch (error) {
      console.error('Section татахад алдаа:', error);
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (editingSection) {
        await api.put(
          `/api/admin/sections/${editingSection.id}`,
          sectionFormData,
        );
        alert('Section амжилттай шинэчлэгдлээ');
      } else {
        await api.post(
          `/api/admin/courses/${selectedCourse.id}/sections`,
          sectionFormData,
        );
        alert('Section амжилттай нэмэгдлээ');
      }
      
      setSectionFormData({ title: '', description: '', order_number: 0 });
      setEditingSection(null);
      setShowSectionForm(false);
      fetchCourseSections(selectedCourse.id);
    } catch (error) {
      alert(error.response?.data?.message || 'Алдаа гарлаа');
    }
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setSectionFormData({
      title: section.title,
      description: section.description || '',
      order_number: section.order_number || 0
    });
    setShowSectionForm(true);
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Энэ section-ийг устгах уу?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.delete(
        `/api/admin/sections/${sectionId}`,
      );
      alert('Section амжилттай устгагдлаа');
      fetchCourseSections(selectedCourse.id);
    } catch (error) {
      alert(error.response?.data?.message || 'Алдаа гарлаа');
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (editingLesson) {
        await api.put(
          `/api/admin/lessons/${editingLesson.id}`,
          lessonFormData,
        );
        alert('Хичээл амжилттай шинэчлэгдлээ');
      } else {
        await api.post(
          `/api/admin/sections/${selectedSection.id}/lessons`,
          lessonFormData,
        );
        alert('Хичээл амжилттай нэмэгдлээ');
      }
      
      setLessonFormData({
        title: '',
        description: '',
        video_url: '',
        duration: 0,
        order_number: 0,
        is_free_preview: false
      });
      setEditingLesson(null);
      setShowLessonForm(false);
      fetchCourseSections(selectedCourse.id);
    } catch (error) {
      alert(error.response?.data?.message || 'Алдаа гарлаа');
    }
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setLessonFormData({
      title: lesson.title,
      description: lesson.description || '',
      video_url: lesson.video_url || '',
      duration: lesson.duration || 0,
      order_number: lesson.order_number || 0,
      is_free_preview: lesson.is_free_preview || false
    });
    setSelectedSection({ id: lesson.section_id });
    setShowLessonForm(true);
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Энэ хичээлийг устгах уу?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.delete(
        `/api/admin/lessons/${lessonId}`,
      );
      alert('Хичээл амжилттай устгагдлаа');
      fetchCourseSections(selectedCourse.id);
    } catch (error) {
      alert(error.response?.data?.message || 'Алдаа гарлаа');
    }
  };

  const handleOpenDiscountModal = async (course) => {
    setSelectedCourseForDiscount(course);
    setShowDiscountModal(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(
        `/api/discounts/courses/${course.id}`
      );
      if (response.data.success) {
        setCourseDiscounts(response.data.data);
      }
    } catch (error) {
      console.error('Хямдрал татахад алдаа:', error);
    }
  };

 const handleCreateDiscount = async (e) => {
  e.preventDefault();
  
  if (!discountFormData.discount_percent || !discountFormData.end_date) {  // ✅ start_date шалгахгүй
    alert('Бүх талбарыг бөглөнө үү');
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    await api.post(
      `/api/discounts/courses/${selectedCourseForDiscount.id}`,
      discountFormData,
    );
    
    alert('Хямдрал амжилттай үүсгэлээ!');
    setDiscountFormData({ discount_percent: 10, end_date: '' });  // ✅ start_date устгасан
    handleOpenDiscountModal(selectedCourseForDiscount);
  } catch (error) {
    alert(error.response?.data?.message || 'Алдаа гарлаа');
  }
};
  const handleDeleteDiscount = async (discountId) => {
    if (!window.confirm('Энэ хямдралыг устгах уу?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.delete(
        `/api/discounts/${discountId}`,
      );
      
      alert('Хямдрал устгагдлаа');
      handleOpenDiscountModal(selectedCourseForDiscount);
    } catch (error) {
      alert(error.response?.data?.message || 'Алдаа гарлаа');
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Админ самбар</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setShowCourseForm(true);
            setEditingCourse(null);
            resetForm();
          }}
        >
          <Plus size={20} />
          Хичээл нэмэх
        </button>
      </div>

      {/* Statistics */}
      <AdminStats stats={stats} currentUser={currentUser} />

      {/* Course Form Modal */}
      <CourseFormModal
        show={showCourseForm}
        onClose={() => {
          setShowCourseForm(false);
          setEditingCourse(null);
          resetForm();
        }}
        formData={formData}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        editingCourse={editingCourse}
      />

      {/* Course Content Management Modal */}
      <CourseContentModal
        show={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
        course={selectedCourse}
        sections={sections}
        showSectionForm={showSectionForm}
        setShowSectionForm={setShowSectionForm}
        sectionFormData={sectionFormData}
        setSectionFormData={setSectionFormData}
        editingSection={editingSection}
        setEditingSection={setEditingSection}
        onAddSection={handleAddSection}
        onEditSection={handleEditSection}
        onDeleteSection={handleDeleteSection}
        showLessonForm={showLessonForm}
        setShowLessonForm={setShowLessonForm}
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        lessonFormData={lessonFormData}
        setLessonFormData={setLessonFormData}
        editingLesson={editingLesson}
        setEditingLesson={setEditingLesson}
        onAddLesson={handleAddLesson}
        onEditLesson={handleEditLesson}
        onDeleteLesson={handleDeleteLesson}
      />

      {/* Lesson Form Modal */}
      <LessonFormModal
        show={showLessonForm && selectedSection}
        onClose={() => {
          setShowLessonForm(false);
          setEditingLesson(null);
          setLessonFormData({
            title: '',
            description: '',
            video_url: '',
            duration: 0,
            order_number: 0,
            is_free_preview: false
          });
        }}
        formData={lessonFormData}
        onChange={setLessonFormData}
        onSubmit={handleAddLesson}
        editingLesson={editingLesson}
      />

      {/* Discount Modal */}
      <DiscountModal
        show={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        course={selectedCourseForDiscount}
        formData={discountFormData}
        onChange={setDiscountFormData}
        onSubmit={handleCreateDiscount}
        discounts={courseDiscounts}
        onDeleteDiscount={handleDeleteDiscount}
      />

      {/* Courses Table */}
      <div className="courses-section">
        <h2>
          {currentUser?.role === 'test_admin' 
            ? `Миний хичээлүүд (${courses.length})` 
            : `Бүх хичээлүүд (${courses.length})`}
        </h2>
        <CoursesTable
          courses={courses}
          loading={loading}
          currentUser={currentUser}
          onManageCourse={handleManageCourse}
          onEditCourse={handleEdit}
          onDeleteCourse={handleDelete}
          onOpenDiscount={handleOpenDiscountModal}
        />
      </div>
    </div>
  );
}

export default AdminDashboard;
