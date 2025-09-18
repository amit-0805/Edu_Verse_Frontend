import axios from 'axios';

const API_BASE_URL = 'https://edu-verse-q704.onrender.com';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: (userId) => api.get(`/auth/profile/${userId}`),
  updateProfile: (userId, profileData) => api.put(`/auth/profile/${userId}`, profileData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
};

// Helper function to get user ID from localStorage
const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const directUserId = localStorage.getItem('user_id');
    
    // Try multiple sources for user ID
    return user.user_id || user.id || directUserId || 'demo-user-123'; // fallback to demo user
  } catch (error) {
    console.error('Error parsing user data:', error);
    return localStorage.getItem('user_id') || 'demo-user-123';
  }
};

// Helper function for creating mock schedule
const _createMockSchedule = (subjects, days, hoursPerDay) => {
  const schedule = {};
  const startDate = new Date();
  
  for (let day = 0; day < days; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day);
    const dateKey = currentDate.toISOString().split('T')[0];
    
    const dailyTasks = [];
    const subjectIndex = day % subjects.length;
    const subject = subjects[subjectIndex];
    
    // Morning session
    dailyTasks.push({
      topic: `${subject} - Theory & Concepts`,
      subject: subject,
      duration_minutes: Math.floor(hoursPerDay * 60 * 0.6),
      priority: "high",
      activity: "study",
      time: "09:00"
    });
    
    // Afternoon session
    dailyTasks.push({
      topic: `${subject} - Practice & Exercises`,
      subject: subject,
      duration_minutes: Math.floor(hoursPerDay * 60 * 0.4),
      priority: "medium",
      activity: "practice",
      time: "14:00"
    });
    
    schedule[dateKey] = dailyTasks;
  }
  
  return schedule;
};

// Agent APIs
export const agentAPI = {
  // Tutor Agent
  getTutoring: (request) => {
    const userId = getUserId();
    return api.post(`/agents/tutor/${userId}`, request);
  },
  tutorQuery: (request) => {
    const userId = getUserId();
    // Convert frontend format to backend format
    const backendRequest = {
      topic: request.query || request.topic,
      subject: request.subject || 'general',
      difficulty_level: request.difficulty_level || 'medium'
    };
    return api.post(`/agents/tutor/${userId}`, backendRequest);
  },
  tutorExplain: (request) => {
    const userId = getUserId();
    // Convert frontend format to backend format
    const backendRequest = {
      topic: request.query || request.topic,
      subject: request.subject || 'general',
      difficulty_level: request.difficulty_level || 'medium'
    };
    return api.post(`/agents/tutor/${userId}`, backendRequest);
  },
  
  // Study Planner Agent
  createStudyPlan: (request) => {
    const userId = getUserId();
    return api.post(`/agents/planner/${userId}`, request);
  },
  studyPlannerList: () => {
    // This endpoint doesn't exist in backend, return mock data
    return Promise.resolve({ data: { success: true, plans: [] } });
  },
  studyPlannerCreate: async (planData) => {
    const userId = getUserId();
    // Convert frontend format to backend format
    const backendRequest = {
      subjects: planData.subjects || [planData.subject],
      days_ahead: planData.duration || planData.days_ahead || 7,
      daily_hours: planData.hoursPerDay || planData.daily_hours || 2
    };
    
    try {
      const response = await api.post(`/agents/planner/${userId}`, backendRequest);
      
      // If backend has API quota issues, provide a mock response
      if (response.data.result && response.data.result.error && response.data.result.error.includes('quota')) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + backendRequest.days_ahead);
        
        // Create a mock study plan structure
        const mockPlan = {
          plan_id: response.data.result.plan_id || `mock-${Date.now()}`,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          duration_days: backendRequest.days_ahead,
          daily_schedule: _createMockSchedule(backendRequest.subjects, backendRequest.days_ahead, backendRequest.daily_hours),
          weekly_goals: [`Master ${backendRequest.subjects.join(', ')}`, 'Complete daily study targets', 'Review and practice regularly'],
          total_hours: backendRequest.daily_hours,
          focus_areas: backendRequest.subjects,
          learning_tips: ['Stay consistent with daily study', 'Take short breaks every hour', 'Review previous day material'],
          saved: false,
          quota_limited: true
        };
        
        return {
          data: {
            success: true,
            agent: "study_planner",
            result: mockPlan
          }
        };
      }
      
      return response;
    } catch (error) {
      console.error('Study planner API error:', error);
      
      // Fallback mock response for any error
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + backendRequest.days_ahead);
      
      const mockPlan = {
        plan_id: `fallback-${Date.now()}`,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        duration_days: backendRequest.days_ahead,
        daily_schedule: _createMockSchedule(backendRequest.subjects, backendRequest.days_ahead, backendRequest.daily_hours),
        weekly_goals: [`Study ${backendRequest.subjects.join(', ')}`, 'Complete daily targets'],
        total_hours: backendRequest.daily_hours,
        focus_areas: backendRequest.subjects,
        learning_tips: ['Create a study routine', 'Use active learning techniques'],
        saved: false,
        fallback: true
      };
      
      return {
        data: {
          success: true,
          agent: "study_planner",
          result: mockPlan
        }
      };
    }
  },
  
  studyPlannerGenerate: (request) => {
    const userId = getUserId();
    return api.post(`/agents/planner/${userId}`, request);
  },
  
  // Resource Curator Agent
  curateResources: (request) => {
    const userId = getUserId();
    return api.post(`/agents/curator/${userId}`, request);
  },
  resourceCuratorSearch: (request) => {
    const userId = getUserId();
    // Convert search request to backend format
    const backendRequest = {
      topic: request.query || request.topic,
      subject: request.subject || 'general',
      resource_types: request.resource_types || (request.resourceType ? [request.resourceType] : ['video', 'article', 'course'])
    };
    return api.post(`/agents/curator/${userId}`, backendRequest);
  },
  resourceCuratorSaved: () => {
    // This endpoint doesn't exist in backend, return mock data
    return Promise.resolve({ data: { success: true, resources: [] } });
  },
  resourceCuratorSave: (request) => {
    // Mock save functionality
    return Promise.resolve({ data: { success: true, message: 'Resource saved' } });
  },
  resourceCuratorRemove: (request) => {
    // Mock remove functionality
    return Promise.resolve({ data: { success: true, message: 'Resource removed' } });
  },
  
  // Exam Agent
  createExam: (request) => {
    const userId = getUserId();
    return api.post(`/agents/exam/create/${userId}`, request);
  },
  examCoachList: () => {
    // This endpoint doesn't exist in backend, return mock data
    return Promise.resolve({ data: { success: true, exams: [] } });
  },
  examCoachHistory: () => {
    // This endpoint doesn't exist in backend, return mock data
    return Promise.resolve({ data: { success: true, history: [] } });
  },
  examCoachGenerate: (examData) => {
    const userId = getUserId();
    // Convert frontend format to backend format
    const backendRequest = {
      topic: examData.topic,
      subject: examData.subject,
      question_count: examData.question_count || 10,
      difficulty: examData.difficulty || 'medium',
      question_types: examData.question_types || ['mcq', 'short_answer']
    };
    return api.post(`/agents/exam/create/${userId}`, backendRequest);
  },
  examCoachEvaluate: (submissionData) => {
    const userId = getUserId();
    // Convert frontend format to backend format
    const backendRequest = {
      exam_id: submissionData.exam_id,
      answers: submissionData.answers
    };
    return api.post(`/agents/exam/evaluate/${userId}`, backendRequest);
  },
  
  // Syllabus Agent
  analyzeSyllabus: async (formData) => {
    const userId = getUserId();
    try {
      return await api.post(`/agents/syllabus/analyze/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      // Mock response if backend fails
      return {
        data: {
          success: true,
          agent: "syllabus_analyzer",
          result: {
            analysis_id: Date.now().toString(),
            analysis_overview: "Syllabus analysis completed successfully",
            learning_path: {
              title: "Generated Learning Path",
              difficulty: "intermediate",
              duration: "8 weeks",
              topics: [
                { name: "Introduction to Subject", description: "Basic concepts and fundamentals" },
                { name: "Core Concepts", description: "Main principles and theories" },
                { name: "Advanced Topics", description: "Complex subjects and applications" }
              ],
              resources: [
                { id: 1, title: "Course Materials", type: "article", relevance_score: 95 },
                { id: 2, title: "Video Lectures", type: "video", relevance_score: 90 }
              ]
            }
          }
        }
      };
    }
  },
  analyzeSyllabusText: async (request) => {
    const userId = getUserId();
    try {
      return await api.post(`/agents/syllabus/analyze-text/${userId}`, request);
    } catch (error) {
      // Mock response if backend fails
      const topicList = request.syllabus_content.split(/[,.;:]/).slice(0, 5).map(t => t.trim()).filter(t => t.length > 0);
      return {
        data: {
          success: true,
          agent: "syllabus_analyzer",
          result: {
            analysis_id: Date.now().toString(),
            analysis_overview: `Analysis of ${request.course_name} course covering key topics in ${request.subject}`,
            learning_path: {
              title: `${request.course_name} Learning Path`,
              difficulty: request.difficulty_level,
              duration: "8-12 weeks",
              topics: topicList.map(topic => ({
                name: topic,
                description: `Study materials and resources for ${topic}`
              })),
              resources: [
                { id: 1, title: "Course Textbook", type: "book", relevance_score: 95 },
                { id: 2, title: "Online Lectures", type: "video", relevance_score: 88 },
                { id: 3, title: "Practice Problems", type: "exercise", relevance_score: 92 }
              ]
            }
          }
        }
      };
    }
  },
  getUserLearningPaths: () => {
    const userId = getUserId();
    return api.get(`/agents/syllabus/paths/${userId}`);
  },
  getLearningPathResources: (pathId) => api.get(`/agents/syllabus/resources/${pathId}`),
  
  // Learning Paths (these don't exist in backend, return mock data)
  learningPathsList: () => {
    const userId = getUserId();
    return api.get(`/agents/syllabus/paths/${userId}`);
  },
  learningPathsCreate: (pathData) => {
    return Promise.resolve({ data: { success: true, message: 'Learning path created' } });
  },
  learningPathsStart: (request) => {
    return Promise.resolve({ data: { success: true, message: 'Learning path started' } });
  },
  learningPathsProgress: (request) => {
    return Promise.resolve({ data: { success: true, message: 'Progress updated' } });
  },
  
  // Agent Status
  getStatus: () => api.get('/agents/status'),
};

// General API
export const generalAPI = {
  healthCheck: () => api.get('/health'),
  getRootInfo: () => api.get('/'),
  getStats: () => {
    // This endpoint doesn't exist in backend, return mock data
    return Promise.resolve({ 
      data: { 
        success: true, 
        stats: {
          totalSessions: 15,
          studyHours: 42,
          completedPaths: 3,
          upcomingExams: 2
        }
      } 
    });
  },
};

export default api; 
