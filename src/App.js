import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MyCourses from './pages/MyCourses';
import CourseDetail from './pages/CourseDetail';
import InstructorDetail from './pages/InstructorDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import MyStudents from './pages/MyStudents';
import Layout from './components/Layout';
import LessonPlayer from './pages/LessonPlayer';
import CourseManage from './pages/CourseManage'; 
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Home */}
          <Route path="/" element={<Home user={user} />} />

          {/* Login / Register */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" /> : <Register onLogin={handleLogin} />} 
          />

          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              user ? (
                <Layout user={user} onLogout={handleLogout}>
                  <Dashboard />
                </Layout>
              ) : <Navigate to="/login" />
            } 
          />

          <Route 
            path="/profile" 
            element={
              user ? (
                <Layout user={user} onLogout={handleLogout}>
                  <Profile user={user} />
                </Layout>
              ) : <Navigate to="/login" />
            } 
          />

          <Route 
            path="/my-courses" 
            element={
              user ? (
                <Layout user={user} onLogout={handleLogout}>
                  <MyCourses />
                </Layout>
              ) : <Navigate to="/login" />
            } 
          />

          <Route 
            path="/course/:id" 
            element={
              user ? (
                <Layout user={user} onLogout={handleLogout}>
                  <CourseDetail />
                </Layout>
              ) : <Navigate to="/login" />
            } 
          />

          {/* 🔥 ШИНЭ - Course Manage Route */}
          <Route 
            path="/course/:id/manage" 
            element={
              user && (user.role === 'admin' || user.role === 'test_admin') ? (
                <Layout user={user} onLogout={handleLogout}>
                  <CourseManage />
                </Layout>
              ) : <Navigate to="/login" />
            } 
          />

          {/* Багшийн дэлгэрэнгүй хуудас */}
          <Route 
            path="/instructor/:id" 
            element={
              user ? (
                <Layout user={user} onLogout={handleLogout}>
                  <InstructorDetail />
                </Layout>
              ) : <Navigate to="/login" />
            } 
          />

          {/* My Students route */}
          <Route 
            path="/my-students"
            element={
              user && (user.role === 'admin' || user.role === 'test_admin') ? (
                <Layout user={user} onLogout={handleLogout}>
                  <MyStudents />
                </Layout>
              ) : <Navigate to="/login" />
            }
          />

          {/* Admin Dashboard route */}
          <Route 
            path="/admin" 
            element={
              user && (user.role === 'admin' || user.role === 'test_admin') ? (
                <Layout user={user} onLogout={handleLogout}>
                  <AdminDashboard />
                </Layout>
              ) : <Navigate to="/login" />
            }
          />

          {/* Admin Users route */}
          <Route 
            path="/admin/users" 
            element={
              user && user.role === 'admin' ? (
                <Layout user={user} onLogout={handleLogout}>
                  <AdminUsers />
                </Layout>
              ) : <Navigate to="/login" />
            }
          />

          {/* Lesson Player */}
          <Route 
            path="/course/:courseId/learn" 
            element={
              user ? (
                <LessonPlayer />
              ) : <Navigate to="/login" />
            } 
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;