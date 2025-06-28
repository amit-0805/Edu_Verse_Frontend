import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon,
  CloudArrowUpIcon,
  EyeIcon,
  BookOpenIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { agentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SyllabusAnalyzerPage = () => {
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [syllabusText, setSyllabusText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [learningPaths, setLearningPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'text'

  useEffect(() => {
    // Get current user ID
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = userData.user_id || userData.id || localStorage.getItem('user_id') || 'demo-user';
    
    // Get learning paths from localStorage for now with user-specific key
    const savedAnalyses = JSON.parse(localStorage.getItem(`syllabusAnalyses_${userId}`) || '[]');
    const paths = savedAnalyses.map(item => ({
      id: item.id,
      title: item.analysis.learningPath?.title || 'Learning Path',
      difficulty: item.analysis.difficulty,
      topics: item.analysis.topics,
      timestamp: item.timestamp,
      resources: item.analysis.learningPath?.resources || []
    }));
    setLearningPaths(paths);
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.type === 'text/plain') {
        setSyllabusFile(file);
        toast.success('File selected successfully');
      } else {
        toast.error('Please upload a PDF, DOCX, or TXT file');
      }
    }
  };

  const analyzeSyllabus = async () => {
    if (uploadMethod === 'file' && !syllabusFile) {
      toast.error('Please select a file to upload');
      return;
    }
    
    if (uploadMethod === 'text' && !syllabusText.trim()) {
      toast.error('Please enter syllabus text');
      return;
    }

    setLoading(true);
    try {
      // Get current user ID
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.user_id || userData.id || localStorage.getItem('user_id') || 'demo-user';
      
      let response;

      if (uploadMethod === 'file') {
        const formData = new FormData();
        formData.append('file', syllabusFile);
        formData.append('subject', 'General');
        formData.append('course_name', 'Course Analysis');
        formData.append('difficulty_level', 'intermediate');
        response = await agentAPI.analyzeSyllabus(formData);
      } else {
        const requestData = {
          syllabus_content: syllabusText,
          subject: 'General',
          course_name: 'Course Analysis',
          difficulty_level: 'intermediate'
        };
        response = await agentAPI.analyzeSyllabusText(requestData);
      }
      
      if (response.data.success && response.data.result) {
        // Handle the backend response format
        const result = response.data.result;
        
        // Create analysis result from backend data
        const analysis = {
          overview: result.analysis_overview || 'Course analysis completed',
          topics: result.learning_path?.topics?.map(topic => topic.name) || [],
          difficulty: result.learning_path?.difficulty || 'intermediate',
          duration: result.learning_path?.duration || 'Not specified',
          id: result.analysis_id,
          learningPath: result.learning_path
        };
        
        setAnalysisResult(analysis);
        
        // Save to localStorage for persistence
        const savedAnalyses = JSON.parse(localStorage.getItem(`syllabusAnalyses_${userId}`) || '[]');
        savedAnalyses.push({
          id: analysis.id,
          timestamp: new Date().toISOString(),
          analysis: analysis
        });
        localStorage.setItem(`syllabusAnalyses_${userId}`, JSON.stringify(savedAnalyses));
        
        toast.success('Syllabus analyzed successfully!');
        
        // Refresh learning paths from localStorage
        const updatedAnalyses = JSON.parse(localStorage.getItem(`syllabusAnalyses_${userId}`) || '[]');
        const paths = updatedAnalyses.map(item => ({
          id: item.id,
          title: item.analysis.overview || 'Analysis',
          timestamp: item.timestamp,
          topics: item.analysis.topics || [],
          difficulty: item.analysis.difficulty || 'intermediate'
        }));
        setLearningPaths(paths);
      } else {
        toast.error('Analysis failed - no result returned');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      if (error.response?.data?.detail) {
        toast.error(`Analysis failed: ${error.response.data.detail}`);
      } else {
        toast.error('Failed to analyze syllabus');
      }
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <DocumentTextIcon className="h-8 w-8 text-yellow-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Syllabus Analyzer</h1>
          </div>
          <p className="text-lg text-gray-600">
            Upload your course syllabus and get a comprehensive learning roadmap with personalized recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Syllabus</h2>
              
              {/* Upload Method Toggle */}
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setUploadMethod('file')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    uploadMethod === 'file'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setUploadMethod('text')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    uploadMethod === 'text'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Paste Text
                </button>
              </div>

              {uploadMethod === 'file' ? (
                <div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-yellow-400 transition-colors">
                    <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-gray-600 mb-4">
                      <p className="text-lg font-medium">Choose a file to upload</p>
                      <p className="text-sm">PDF, DOCX, or TXT files supported</p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="syllabusFile"
                    />
                    <label
                      htmlFor="syllabusFile"
                      className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 cursor-pointer inline-block transition-colors"
                    >
                      Browse Files
                    </label>
                  </div>
                  
                  {syllabusFile && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-yellow-600 mr-2" />
                        <span className="text-sm font-medium text-yellow-800">{syllabusFile.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Syllabus Content
                  </label>
                  <textarea
                    value={syllabusText}
                    onChange={(e) => setSyllabusText(e.target.value)}
                    placeholder="Paste your syllabus content here..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    rows={8}
                  />
                </div>
              )}

              <button
                onClick={analyzeSyllabus}
                disabled={loading || (uploadMethod === 'file' && !syllabusFile) || (uploadMethod === 'text' && !syllabusText.trim())}
                className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-colors ${
                  loading || (uploadMethod === 'file' && !syllabusFile) || (uploadMethod === 'text' && !syllabusText.trim())
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </div>
                ) : (
                  'Analyze Syllabus'
                )}
              </button>
            </div>

            {/* Analysis Results */}
            {analysisResult && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Course Overview</h4>
                    <p className="text-gray-600 text-sm">{analysisResult.overview}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Key Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.topics?.map((topic, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Difficulty Level</h4>
                    <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(analysisResult.difficulty)}`}>
                      {analysisResult.difficulty}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Estimated Duration</h4>
                    <div className="flex items-center text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      {analysisResult.duration}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Learning Paths */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Learning Paths</h2>
            
            {learningPaths.length > 0 ? (
              <div className="space-y-4">
                {learningPaths.map((path, index) => (
                  <div 
                    key={index} 
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-yellow-300"
                    onClick={() => setSelectedPath(path)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{path.title}</h3>
                        <p className="text-sm text-gray-600">{path.subject}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(path.difficulty)}`}>
                        {path.difficulty}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{path.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <BookOpenIcon className="h-4 w-4 mr-1" />
                        {path.topics?.length || 0} topics
                      </div>
                      <div className="flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm text-gray-600">{path.rating || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-600 h-2 rounded-full"
                          style={{ width: `${path.progress || 0}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{path.progress || 0}% complete</p>
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-xs text-gray-500">Click to view details</span>
                      <EyeIcon className="h-4 w-4 text-yellow-600" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No learning paths yet</h3>
                <p className="text-gray-600">
                  Upload and analyze a syllabus to generate personalized learning paths.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <DocumentTextIcon className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Smart Analysis</h3>
            <p className="text-gray-600 text-sm">
              AI-powered analysis extracts key topics, difficulty levels, and learning objectives.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <BookOpenIcon className="h-8 w-8 text-green-600 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Personalized Paths</h3>
            <p className="text-gray-600 text-sm">
              Generate customized learning paths based on your syllabus and learning style.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <ClockIcon className="h-8 w-8 text-purple-600 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Time Optimization</h3>
            <p className="text-gray-600 text-sm">
              Get realistic time estimates and optimized study schedules for each topic.
            </p>
          </div>
        </div>

        {/* Learning Path Details Modal */}
        {selectedPath && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedPath.title}</h2>
                    <p className="text-gray-600">{selectedPath.analysis?.course_name || 'Learning Path Details'}</p>
                  </div>
                  <button
                    onClick={() => setSelectedPath(null)}
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
                    <h3 className="font-medium text-gray-900 mb-2">Difficulty</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedPath.difficulty)}`}>
                      {selectedPath.difficulty}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Duration</h3>
                    <p className="text-lg font-medium text-gray-900">{selectedPath.analysis?.duration || 'Not specified'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Topics</h3>
                    <p className="text-2xl font-bold text-yellow-600">{selectedPath.topics?.length || 0}</p>
                  </div>
                </div>

                {selectedPath.analysis?.overview && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Course Overview</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-gray-700">{selectedPath.analysis.overview}</p>
                    </div>
                  </div>
                )}

                {selectedPath.topics && selectedPath.topics.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Learning Topics</h3>
                    <div className="grid gap-3">
                      {selectedPath.topics.map((topic, index) => (
                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            {typeof topic === 'string' ? topic : topic.name}
                          </h4>
                          {topic.description && (
                            <p className="text-sm text-gray-600">{topic.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPath.resources && selectedPath.resources.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Learning Resources</h3>
                    <div className="grid gap-3">
                      {selectedPath.resources.map((resource, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">{resource.title}</h4>
                              <p className="text-sm text-gray-600 mb-2">{resource.description || 'Learning resource'}</p>
                              <div className="flex items-center space-x-4">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {resource.type || 'Resource'}
                                </span>
                                {resource.relevance_score && (
                                  <span className="text-xs text-gray-500">
                                    Relevance: {resource.relevance_score}%
                                  </span>
                                )}
                              </div>
                            </div>
                            {resource.url && (
                              <a 
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                              >
                                View →
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setSelectedPath(null)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      // Add logic to start learning path
                      toast.success('Learning path started!');
                      setSelectedPath(null);
                    }}
                    className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    Start Learning
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyllabusAnalyzerPage; 