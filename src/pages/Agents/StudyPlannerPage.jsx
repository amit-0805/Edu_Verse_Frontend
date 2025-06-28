import React, { useState, useEffect } from 'react';
import { 
  ClipboardDocumentListIcon,
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  BookOpenIcon,
  AcademicCapIcon,
  UserIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { agentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core';

const StudyPlannerPage = () => {
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [newPlan, setNewPlan] = useState({
    title: '',
    subject: '',
    duration_weeks: 4,
    hours_per_day: 2,
    difficulty_level: 'intermediate',
    goals: ['']
  });

  const [isLoading, setIsLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    goal: '',
    timeframe: '',
    studyHours: '',
    currentLevel: 'beginner',
    learningStyle: 'visual',
    topics: []
  });
  const [customTopic, setCustomTopic] = useState('');

  // Make study plan data readable to CopilotKit
  useCopilotReadable({
    description: "Current study plans with details and progress",
    value: plans,
  });

  // Make new plan form data readable to CopilotKit
  useCopilotReadable({
    description: "Study plan creation form data including title, subject, duration, and goals",
    value: newPlan,
  });

  // CopilotKit action for creating study plans
  useCopilotAction({
    name: "createStudyPlan",
    description: "Create a personalized study plan based on subject, goals, and preferences",
    parameters: [
      {
        name: "title",
        type: "string",
        description: "The title of the study plan",
        required: true,
      },
      {
        name: "subject",
        type: "string", 
        description: "The subject to study",
        required: true,
      },
      {
        name: "duration_weeks",
        type: "number",
        description: "Duration in weeks for the study plan",
        required: true,
      },
      {
        name: "hours_per_day",
        type: "number",
        description: "Hours per day for studying",
        required: true,
      },
      {
        name: "difficulty_level",
        type: "string",
        description: "Difficulty level (beginner, intermediate, advanced)",
      },
      {
        name: "goals",
        type: "array",
        description: "Array of learning goals",
      },
    ],
    handler: async ({ title, subject, duration_weeks, hours_per_day, difficulty_level, goals }) => {
      try {
        const planData = {
          title,
          subject,
          duration_weeks: duration_weeks || 4,
          hours_per_day: hours_per_day || 2,
          difficulty_level: difficulty_level || 'intermediate',
          goals: goals || ['']
        };

        setNewPlan(planData);
        setShowCreateForm(true);
        
        return `Set up study plan form with: ${title} for ${subject}, ${duration_weeks} weeks, ${hours_per_day} hours daily.`;
      } catch (error) {
        console.error('Error setting up study plan:', error);
        return 'Failed to set up study plan form. Please try again.';
      }
    },
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      // Get current user ID
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.user_id || userData.id || localStorage.getItem('user_id') || 'demo-user';
      
      // Use user-specific localStorage key
      const savedPlans = localStorage.getItem(`studyPlans_${userId}`);
      if (savedPlans) {
        setPlans(JSON.parse(savedPlans));
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      // Start with empty array if localStorage fails
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async () => {
    if (!newPlan.title || !newPlan.subject) {
      toast.error('Please fill in title and subject');
      return;
    }

    setLoading(true);

    try {
      // Convert frontend form data to backend API format
      const planData = {
        subjects: [newPlan.subject],
        days_ahead: newPlan.duration_weeks * 7,
        daily_hours: newPlan.hours_per_day
      };
      
      const response = await agentAPI.studyPlannerCreate(planData);
      
      if (response.data.success) {
        toast.success('Study plan created successfully!');
        
        // Create plan object with both form data and API response
        const createdPlan = {
          id: Date.now().toString(),
          title: newPlan.title,
          subject: newPlan.subject,
          duration_weeks: newPlan.duration_weeks,
          hours_per_day: newPlan.hours_per_day,
          difficulty_level: newPlan.difficulty_level,
          goals: newPlan.goals.filter(goal => goal.trim() !== ''),
          result: response.data.result,
          created_at: new Date().toISOString(),
          status: 'active'
        };
        
        // Get current user ID for user-specific storage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = userData.user_id || userData.id || localStorage.getItem('user_id') || 'demo-user';
        
        // Update state and localStorage with user-specific key
        const updatedPlans = [...plans, createdPlan];
        setPlans(updatedPlans);
        localStorage.setItem(`studyPlans_${userId}`, JSON.stringify(updatedPlans));
        
        // Reset form
        setNewPlan({
          title: '',
          subject: '',
          duration_weeks: 4,
          hours_per_day: 2,
          difficulty_level: 'intermediate',
          goals: ['']
        });
        setShowCreateForm(false);
      } else {
        toast.error('Failed to create study plan - API returned error');
      }
    } catch (error) {
      console.error('Failed to create plan:', error);
      toast.error('Failed to create study plan - please try again');
    } finally {
      setLoading(false);
    }
  };

  const generateSchedule = async (planId) => {
    try {
      // Find the plan to regenerate
      const plan = plans.find(p => p.id === planId);
      if (!plan) {
        toast.error('Plan not found');
        return;
      }

      // Use the same API call as createPlan but for regeneration
      const planData = {
        subjects: [plan.subject],
        days_ahead: plan.duration_weeks * 7,
        daily_hours: plan.hours_per_day
      };
      
      const response = await agentAPI.studyPlannerCreate(planData);
      
      if (response.data.success) {
        toast.success('Schedule regenerated successfully!');
        
        // Update the plan with the new result
        const updatedPlans = plans.map(p => 
          p.id === planId 
            ? { ...p, result: response.data.result, updated_at: new Date().toISOString() }
            : p
        );
        
        // Get current user ID for user-specific storage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = userData.user_id || userData.id || localStorage.getItem('user_id') || 'demo-user';
        
        setPlans(updatedPlans);
        localStorage.setItem(`studyPlans_${userId}`, JSON.stringify(updatedPlans));
      } else {
        toast.error('Failed to regenerate schedule - API returned error');
      }
    } catch (error) {
      console.error('Failed to generate schedule:', error);
      toast.error('Failed to generate schedule - please try again');
    }
  };

  const addGoal = () => {
    setNewPlan({
      ...newPlan,
      goals: [...newPlan.goals, '']
    });
  };

  const updateGoal = (index, value) => {
    const updatedGoals = [...newPlan.goals];
    updatedGoals[index] = value;
    setNewPlan({
      ...newPlan,
      goals: updatedGoals
    });
  };

  const removeGoal = (index) => {
    setNewPlan({
      ...newPlan,
      goals: newPlan.goals.filter((_, i) => i !== index)
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addCustomTopic = () => {
    if (customTopic.trim() && !formData.topics.includes(customTopic.trim())) {
      setFormData(prev => ({
        ...prev,
        topics: [...prev.topics, customTopic.trim()]
      }));
      setCustomTopic('');
    }
  };

  const removeTopic = (topicToRemove) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter(topic => topic !== topicToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.goal) {
      toast.error('Please fill in subject and goal');
      return;
    }

    setIsLoading(true);

    try {
      // Convert timeframe to days
      const timeframeToDays = {
        '1 week': 7,
        '2 weeks': 14,
        '1 month': 30,
        '2 months': 60,
        '3 months': 90
      };

      // Convert study hours to number
      const studyHoursToNumber = {
        '1 hour': 1,
        '2 hours': 2,
        '3 hours': 3,
        '4 hours': 4,
        '5+ hours': 5
      };

      // Prepare data in the format expected by the backend
      const planData = {
        subjects: [formData.subject], // Backend expects array of subjects
        days_ahead: timeframeToDays[formData.timeframe] || 14, // Convert timeframe to days
        daily_hours: studyHoursToNumber[formData.studyHours] || 2 // Convert to number
      };

      const response = await agentAPI.studyPlannerCreate(planData);
      
      if (response.data.success) {
        setStudyPlan(response.data.result);
        toast.success('Study plan generated successfully!');
        setShowCreateForm(false);
      } else {
        throw new Error(response.data.message || 'Failed to generate study plan');
      }
    } catch (error) {
      console.error('Error generating study plan:', error);
      toast.error('Failed to generate study plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const subjects = [
    'Mathematics', 'Science', 'History', 'Literature', 'Physics', 
    'Chemistry', 'Biology', 'Computer Science', 'Economics', 'Philosophy',
    'Engineering', 'Medicine', 'Law', 'Business', 'Psychology'
  ];

  const timeframes = [
    '1 week', '2 weeks', '1 month', '2 months', '3 months', '6 months', '1 year'
  ];

  const studyHourOptions = [
    '1 hour', '2 hours', '3 hours', '4 hours', '5+ hours'
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const learningStyles = [
    { value: 'visual', label: 'Visual (diagrams, charts)' },
    { value: 'auditory', label: 'Auditory (lectures, discussions)' },
    { value: 'kinesthetic', label: 'Kinesthetic (hands-on)' },
    { value: 'reading', label: 'Reading/Writing' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
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
              <ClipboardDocumentListIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Study Planner</h1>
                <p className="text-lg text-gray-600">Create and manage personalized study schedules</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Plan
            </button>
          </div>
        </div>

        {/* Create Plan Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Study Plan</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Title
                </label>
                <input
                  type="text"
                  value={newPlan.title}
                  onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                  placeholder="e.g., Calculus Mastery Plan"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={newPlan.subject}
                  onChange={(e) => setNewPlan({ ...newPlan, subject: e.target.value })}
                  placeholder="e.g., Mathematics"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (weeks)
                </label>
                <select
                  value={newPlan.duration_weeks}
                  onChange={(e) => setNewPlan({ ...newPlan, duration_weeks: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {[2, 4, 6, 8, 12, 16].map(weeks => (
                    <option key={weeks} value={weeks}>{weeks} weeks</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hours per day
                </label>
                <select
                  value={newPlan.hours_per_day}
                  onChange={(e) => setNewPlan({ ...newPlan, hours_per_day: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {[1, 2, 3, 4, 5, 6].map(hours => (
                    <option key={hours} value={hours}>{hours} hour{hours > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={newPlan.difficulty_level}
                  onChange={(e) => setNewPlan({ ...newPlan, difficulty_level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Goals
              </label>
              {newPlan.goals.map((goal, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => updateGoal(index, e.target.value)}
                    placeholder="Enter a learning goal"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {newPlan.goals.length > 1 && (
                    <button
                      onClick={() => removeGoal(index)}
                      className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addGoal}
                className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
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
                onClick={createPlan}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Plan...' : 'Create Plan'}
              </button>
            </div>
          </div>
        )}

        {/* Plans List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                  <p className="text-sm text-gray-600">{plan.subject}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  plan.status === 'active' ? 'bg-green-100 text-green-800' :
                  plan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {plan.status || 'draft'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {plan.duration_weeks} weeks
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  {plan.hours_per_day} hours/day
                </div>
              </div>

              {plan.goals && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Goals:</p>
                  <ul className="space-y-1">
                    {plan.goals.slice(0, 3).map((goal, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                        {goal}
                      </li>
                    ))}
                    {plan.goals.length > 3 && (
                      <li className="text-sm text-gray-500">
                        +{plan.goals.length - 3} more goals
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => setActivePlan(plan)}
                  className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  View Details
                </button>
                {!plan.result && (
                  <button
                    onClick={() => generateSchedule(plan.id)}
                    className="flex-1 border border-green-600 text-green-600 py-2 px-3 rounded-lg hover:bg-green-50 transition-colors text-sm"
                  >
                    Generate Schedule
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {plans.length === 0 && (
          <div className="text-center py-12">
            <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No study plans yet</h3>
            <p className="text-gray-600 mb-4">Create your first study plan to get started!</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Create Your First Plan
            </button>
          </div>
        )}

        {/* Plan Details Modal */}
        {activePlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{activePlan.title}</h2>
                    <p className="text-gray-600">{activePlan.subject}</p>
                  </div>
                  <button
                    onClick={() => setActivePlan(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Duration</h3>
                    <p className="text-2xl font-bold text-green-600">{activePlan.duration_weeks} weeks</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Daily Hours</h3>
                    <p className="text-2xl font-bold text-green-600">{activePlan.hours_per_day}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Difficulty</h3>
                    <p className="text-lg font-medium text-gray-900 capitalize">{activePlan.difficulty_level}</p>
                  </div>
                </div>

                {activePlan.goals && activePlan.goals.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Learning Goals</h3>
                    <ul className="space-y-2">
                      {activePlan.goals.map((goal, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircleIcon className="h-5 w-5 mr-3 mt-0.5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activePlan.result && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">AI-Generated Study Plan</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      {typeof activePlan.result === 'string' ? (
                        <pre className="whitespace-pre-wrap text-sm text-gray-800">{activePlan.result}</pre>
                      ) : (
                        <div className="space-y-4">
                          {activePlan.result.daily_schedule && (
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2">Daily Schedule:</h4>
                              <div className="grid gap-3">
                                {Object.entries(activePlan.result.daily_schedule).slice(0, 3).map(([date, tasks]) => (
                                  <div key={date} className="bg-white p-3 rounded border">
                                    <div className="font-medium text-gray-700 mb-2">{new Date(date).toLocaleDateString()}</div>
                                    {Array.isArray(tasks) ? tasks.map((task, idx) => (
                                      <div key={idx} className="text-sm text-gray-600 flex justify-between">
                                        <span>{task.topic || task.subject}</span>
                                        <span>{task.duration_minutes || task.time} min</span>
                                      </div>
                                    )) : (
                                      <div className="text-sm text-gray-600">{tasks}</div>
                                    )}
                                  </div>
                                ))}
                                {Object.keys(activePlan.result.daily_schedule).length > 3 && (
                                  <div className="text-sm text-gray-500 text-center">
                                    +{Object.keys(activePlan.result.daily_schedule).length - 3} more days...
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {activePlan.result.weekly_goals && (
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2">Weekly Goals:</h4>
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                {activePlan.result.weekly_goals.map((goal, idx) => (
                                  <li key={idx}>{goal}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {activePlan.result.learning_tips && (
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2">Learning Tips:</h4>
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                {activePlan.result.learning_tips.map((tip, idx) => (
                                  <li key={idx}>{tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {activePlan.result.focus_areas && (
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2">Focus Areas:</h4>
                              <div className="flex flex-wrap gap-2">
                                {activePlan.result.focus_areas.map((area, idx) => (
                                  <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                    {area}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!activePlan.result && (
                  <div className="mb-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        No AI-generated content available for this plan. Try generating a new schedule or creating a new plan.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => setActivePlan(null)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <UserIcon className="h-8 w-8 text-purple-600 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Personalized Plans</h3>
            <p className="text-gray-600 text-sm">
              Custom study schedules based on your goals, time, and learning style.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <ClockIcon className="h-8 w-8 text-green-600 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Time Management</h3>
            <p className="text-gray-600 text-sm">
              Optimized schedules that fit your available study time.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <SparklesIcon className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Insights</h3>
            <p className="text-gray-600 text-sm">
              Smart recommendations and study tips powered by AI. Use the sidebar for quick help!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPlannerPage; 