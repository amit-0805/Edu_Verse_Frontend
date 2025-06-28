import React, { useState, useEffect } from 'react';
import { 
  BookOpenIcon,
  MapIcon,
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  PlusIcon,
  AcademicCapIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { getCurrentUserId, getUserSpecificKey } from '../../utils/auth';

const LearningPathsPage = () => {
  const [paths, setPaths] = useState([]);
  const [activePath, setActivePath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [newPath, setNewPath] = useState({
    title: '',
    subject: '',
    difficulty_level: 'intermediate',
    estimated_duration: '4 weeks',
    goals: ['']
  });

  // Mock learning paths data as fallback for new users
  const getDefaultPaths = () => [
    {
      id: 1,
      title: 'Introduction to Machine Learning',
      subject: 'Computer Science',
      difficulty_level: 'intermediate',
      estimated_duration: '8 weeks',
      status: 'available',
      progress: 0,
      steps_count: 12,
      goals: [
        'Understand basic ML concepts and algorithms',
        'Learn Python for data science',
        'Build your first ML model',
        'Master data preprocessing techniques'
      ],
      steps: [
        { id: 1, title: 'Introduction to ML', description: 'Learn the fundamentals of machine learning', completed: false },
        { id: 2, title: 'Python for Data Science', description: 'Master Python libraries like NumPy and Pandas', completed: false },
        { id: 3, title: 'Data Preprocessing', description: 'Clean and prepare data for ML models', completed: false },
        { id: 4, title: 'Linear Regression', description: 'Build your first regression model', completed: false },
        { id: 5, title: 'Classification Algorithms', description: 'Learn decision trees and random forests', completed: false },
        { id: 6, title: 'Model Evaluation', description: 'Evaluate and improve model performance', completed: false }
      ]
    },
    {
      id: 2,
      title: 'Web Development Fundamentals',
      subject: 'Web Development',
      difficulty_level: 'beginner',
      estimated_duration: '6 weeks',
      status: 'available',
      progress: 0,
      steps_count: 10,
      goals: [
        'Master HTML, CSS, and JavaScript',
        'Build responsive web pages',
        'Understand web development workflow',
        'Create interactive user interfaces'
      ],
      steps: [
        { id: 1, title: 'HTML Basics', description: 'Learn HTML structure and elements', completed: false },
        { id: 2, title: 'CSS Styling', description: 'Style web pages with CSS', completed: false },
        { id: 3, title: 'JavaScript Fundamentals', description: 'Add interactivity with JavaScript', completed: false },
        { id: 4, title: 'Responsive Design', description: 'Create mobile-friendly layouts', completed: false },
        { id: 5, title: 'DOM Manipulation', description: 'Interact with web page elements', completed: false },
        { id: 6, title: 'Forms and Validation', description: 'Handle user input and validation', completed: false }
      ]
    }
  ];

  useEffect(() => {
    // Load user-specific learning paths
    const loadUserPaths = () => {
      try {
        const userPathsKey = getUserSpecificKey('learningPaths');
        const savedPaths = localStorage.getItem(userPathsKey);
        
        if (savedPaths) {
          setPaths(JSON.parse(savedPaths));
        } else {
          // For new users, provide default paths
          const defaultPaths = getDefaultPaths();
          setPaths(defaultPaths);
          localStorage.setItem(userPathsKey, JSON.stringify(defaultPaths));
        }
      } catch (error) {
        console.error('Failed to load learning paths:', error);
        setPaths(getDefaultPaths());
      } finally {
        setLoading(false);
      }
    };

    // Simulate loading
    setTimeout(loadUserPaths, 1000);
  }, []);

  const savePaths = (updatedPaths) => {
    const userPathsKey = getUserSpecificKey('learningPaths');
    localStorage.setItem(userPathsKey, JSON.stringify(updatedPaths));
  };

  const createPath = () => {
    if (!newPath.title || !newPath.subject) {
      toast.error('Please fill in title and subject');
      return;
    }

    const pathData = {
      id: Date.now(),
      ...newPath,
      status: 'available',
      progress: 0,
      steps_count: Math.floor(Math.random() * 10) + 5,
      goals: newPath.goals.filter(goal => goal.trim() !== ''),
      steps: []
    };
    
    const updatedPaths = [...paths, pathData];
    setPaths(updatedPaths);
    savePaths(updatedPaths);
    
    setNewPath({
      title: '',
      subject: '',
      difficulty_level: 'intermediate',
      estimated_duration: '4 weeks',
      goals: ['']
    });
    setShowCreateForm(false);
    toast.success('Learning path created successfully!');
  };

  const startPath = (pathId) => {
    const updatedPaths = paths.map(path => 
      path.id === pathId 
        ? { ...path, status: 'active', progress: path.progress || 0 }
        : path
    );
    setPaths(updatedPaths);
    savePaths(updatedPaths);
    toast.success('Learning path started! Begin your journey.');
  };

  const updateProgress = (pathId, stepId) => {
    const updatedPaths = paths.map(path => {
      if (path.id === pathId) {
        const updatedSteps = path.steps.map(step =>
          step.id === stepId ? { ...step, completed: true } : step
        );
        const completedSteps = updatedSteps.filter(step => step.completed).length;
        const progress = updatedSteps.length > 0 ? Math.round((completedSteps / updatedSteps.length) * 100) : 0;
        
        return {
          ...path,
          steps: updatedSteps,
          progress: progress,
          status: progress === 100 ? 'completed' : 'active'
        };
      }
      return path;
    });
    
    setPaths(updatedPaths);
    savePaths(updatedPaths);
    toast.success('Step completed! Keep up the great work.');
  };

  const addGoal = () => {
    setNewPath({
      ...newPath,
      goals: [...newPath.goals, '']
    });
  };

  const updateGoal = (index, value) => {
    const updatedGoals = [...newPath.goals];
    updatedGoals[index] = value;
    setNewPath({
      ...newPath,
      goals: updatedGoals
    });
  };

  const removeGoal = (index) => {
    setNewPath({
      ...newPath,
      goals: newPath.goals.filter((_, i) => i !== index)
    });
  };

  const PathCard = ({ path }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{path.title}</h3>
          <p className="text-sm text-gray-600">{path.subject}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          path.status === 'active' ? 'bg-green-100 text-green-800' :
          path.status === 'completed' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {path.status || 'available'}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapIcon className="h-4 w-4 mr-2" />
          {path.difficulty_level} level
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <ClockIcon className="h-4 w-4 mr-2" />
          {path.estimated_duration}
        </div>
        {path.steps_count && (
          <div className="flex items-center text-sm text-gray-600">
            <BookOpenIcon className="h-4 w-4 mr-2" />
            {path.steps_count} steps
          </div>
        )}
      </div>

      {path.progress !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{path.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${path.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {path.goals && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Learning Goals:</p>
          <ul className="space-y-1">
            {path.goals.slice(0, 2).map((goal, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start">
                <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                {goal}
              </li>
            ))}
            {path.goals.length > 2 && (
              <li className="text-sm text-gray-500">
                +{path.goals.length - 2} more goals
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="flex space-x-2">
        {path.status === 'active' ? (
          <button
            onClick={() => setActivePath(path)}
            className="flex-1 bg-indigo-600 text-white py-2 px-3 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            Continue Learning
          </button>
        ) : path.status === 'completed' ? (
          <button
            onClick={() => setActivePath(path)}
            className="flex-1 bg-gray-600 text-white py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            Review Path
          </button>
        ) : (
          <button
            onClick={() => startPath(path.id)}
            className="flex-1 bg-indigo-600 text-white py-2 px-3 rounded-lg hover:bg-indigo-700 transition-colors text-sm flex items-center justify-center"
          >
            <PlayIcon className="h-4 w-4 mr-1" />
            Start Path
          </button>
        )}
        <button
          onClick={() => setActivePath(path)}
          className="border border-indigo-600 text-indigo-600 py-2 px-3 rounded-lg hover:bg-indigo-50 transition-colors text-sm"
        >
          View Details
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpenIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Learning Paths</h1>
                <p className="text-lg text-gray-600">Follow structured learning journeys to master new skills</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Path
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-indigo-100">
                <BookOpenIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Paths</p>
                <p className="text-2xl font-bold text-gray-900">{paths.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <AcademicCapIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Paths</p>
                <p className="text-2xl font-bold text-gray-900">
                  {paths.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <SparklesIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {paths.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Path Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Learning Path</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Path Title
                </label>
                <input
                  type="text"
                  value={newPath.title}
                  onChange={(e) => setNewPath({ ...newPath, title: e.target.value })}
                  placeholder="e.g., Master React Development"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={newPath.subject}
                  onChange={(e) => setNewPath({ ...newPath, subject: e.target.value })}
                  placeholder="e.g., Web Development"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={newPath.difficulty_level}
                  onChange={(e) => setNewPath({ ...newPath, difficulty_level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Duration
                </label>
                <select
                  value={newPath.estimated_duration}
                  onChange={(e) => setNewPath({ ...newPath, estimated_duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="2 weeks">2 weeks</option>
                  <option value="4 weeks">4 weeks</option>
                  <option value="8 weeks">8 weeks</option>
                  <option value="12 weeks">12 weeks</option>
                  <option value="6 months">6 months</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Goals
              </label>
              {newPath.goals.map((goal, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => updateGoal(index, e.target.value)}
                    placeholder="Enter a learning goal"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {newPath.goals.length > 1 && (
                    <button
                      onClick={() => removeGoal(index)}
                      className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addGoal}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Goal
              </button>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createPath}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create Path
              </button>
            </div>
          </div>
        )}

        {/* Paths Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {paths.map((path) => (
            <PathCard key={path.id} path={path} />
          ))}
        </div>

        {paths.length === 0 && (
          <div className="text-center py-12">
            <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No learning paths yet</h3>
            <p className="text-gray-600 mb-4">Create your first learning path to start your structured learning journey!</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Create Your First Path
            </button>
          </div>
        )}

        {/* Path Details Modal */}
        {activePath && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity">
                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setActivePath(null)}></div>
              </div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {activePath.title}
                    </h3>
                    <button
                      onClick={() => setActivePath(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Path Overview */}
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-2">Path Overview</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Subject:</span>
                          <p className="font-medium">{activePath.subject}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Level:</span>
                          <p className="font-medium">{activePath.difficulty_level}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <p className="font-medium">{activePath.estimated_duration}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Progress:</span>
                          <p className="font-medium">{activePath.progress || 0}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Learning Steps */}
                    {activePath.steps && activePath.steps.length > 0 && (
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-4">Learning Steps</h4>
                        <div className="space-y-3">
                          {activePath.steps.map((step, index) => (
                            <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                                step.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {step.completed ? '✓' : index + 1}
                              </div>
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">{step.title}</h5>
                                <p className="text-sm text-gray-600">{step.description}</p>
                              </div>
                              {!step.completed && activePath.status === 'active' && (
                                <button
                                  onClick={() => updateProgress(activePath.id, step.id)}
                                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                                >
                                  Mark Complete
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Goals */}
                    {activePath.goals && (
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-2">Learning Goals</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {activePath.goals.map((goal, index) => (
                            <li key={index}>{goal}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPathsPage; 