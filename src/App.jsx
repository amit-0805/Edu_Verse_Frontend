import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CopilotKit } from '@copilotkit/react-core';
// import { CopilotSidebar } from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';

// Components
import Navbar from './components/Layout/Navbar';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import Dashboard from './pages/Dashboard/Dashboard';
import TutorPage from './pages/Agents/TutorPage';
import StudyPlannerPage from './pages/Agents/StudyPlannerPage';
import ResourceCuratorPage from './pages/Agents/ResourceCuratorPage';
import ExamCoachPage from './pages/Agents/ExamCoachPage';
import SyllabusAnalyzerPage from './pages/Agents/SyllabusAnalyzerPage';
import ProfilePage from './pages/ProfilePage';
import LearningPathsPage from './pages/Agents/LearningPathsPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    const userId = localStorage.getItem('user_id');
    
    if (token && userId) {
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <CopilotKit 
      publicApiKey="ck_pub_5c3a721c58d6378f421601031025842b"
      agent="eduverse_tutor"
    >
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          
          {isAuthenticated && <Navbar setIsAuthenticated={setIsAuthenticated} />}
          
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />
              } 
            />
            <Route 
              path="/login" 
              element={
                isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage setIsAuthenticated={setIsAuthenticated} />
              } 
            />
            <Route 
              path="/register" 
              element={
                isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage setIsAuthenticated={setIsAuthenticated} />
              } 
            />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tutor" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <TutorPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/study-planner" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <StudyPlannerPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resource-curator" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <ResourceCuratorPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/exam-coach" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <ExamCoachPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/syllabus-analyzer" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <SyllabusAnalyzerPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/learning-paths" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <LearningPathsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </CopilotKit>
  );
}

export default App;
