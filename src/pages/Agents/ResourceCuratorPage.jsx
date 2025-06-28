import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  BookmarkIcon,
  LinkIcon,
  TagIcon,
  StarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { agentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ResourceCuratorPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    subject: '',
    resource_type: 'all',
    difficulty_level: 'all'
  });
  const [resources, setResources] = useState([]);
  const [savedResources, setSavedResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');

  useEffect(() => {
    // Get current user ID
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = userData.user_id || userData.id || localStorage.getItem('user_id') || 'demo-user';
    
    // Get saved resources from localStorage with user-specific key
    const saved = JSON.parse(localStorage.getItem(`savedResources_${userId}`) || '[]');
    setSavedResources(saved);
  }, []);

  const searchResources = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setLoading(true);
    try {
      const response = await agentAPI.resourceCuratorSearch({
        topic: searchQuery,
        subject: searchFilters.subject || 'General',
        resource_types: [searchFilters.type || 'video', 'article', 'course']
      });
      
      if (response.data.success && response.data.result) {
        let resources = [];
        const result = response.data.result;
        
        if (result.curated_resources && Array.isArray(result.curated_resources)) {
          // Handle the actual backend response format
          resources = result.curated_resources.map(resource => ({
            id: resource.id || Date.now().toString() + Math.random(),
            title: resource.title,
            description: resource.description,
            url: resource.url,
            type: resource.type,
            tags: resource.tags || [searchQuery],
            source: resource.source || 'Web',
            rating: resource.rating || 4.0,
            difficulty: resource.difficulty,
            relevance_score: resource.relevance_score,
            recommendation: resource.why_recommended
          }));
          
          toast.success(`Found ${result.total_found || resources.length} resources`);
        } else if (typeof result === 'string') {
          // Handle plain text response
          resources = [{
            id: Date.now().toString(),
            title: `AI Generated Resources for ${searchQuery}`,
            description: result,
            url: '#',
            type: 'ai-generated',
            tags: [searchQuery],
            source: 'AI Assistant',
            rating: 5.0
          }];
          toast.success('Generated AI recommendations');
        } else if (result.resources && Array.isArray(result.resources)) {
          // Handle alternative resources format
          resources = result.resources.map(resource => ({
            id: resource.id || resource.resource_id || Date.now().toString(),
            title: resource.title,
            description: resource.description,
            url: resource.url,
            type: resource.type,
            tags: resource.tags || [],
            source: resource.source || 'Web',
            rating: resource.rating,
            difficulty: resource.difficulty,
            relevance_score: resource.relevance_score,
            recommendation: resource.recommendation
          }));
          toast.success(`Found ${resources.length} resources`);
        } else {
          resources = [];
          toast.info('No resources found for your search');
        }
        
        setResources(resources);
        
        // Save the search to localStorage for history with user-specific key
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = userData.user_id || userData.id || localStorage.getItem('user_id') || 'demo-user';
        
        const searchHistory = JSON.parse(localStorage.getItem(`resourceSearchHistory_${userId}`) || '[]');
        searchHistory.unshift({
          query: searchQuery,
          filters: searchFilters,
          timestamp: new Date().toISOString(),
          resultsCount: resources.length
        });
        // Keep only the last 10 searches
        localStorage.setItem(`resourceSearchHistory_${userId}`, JSON.stringify(searchHistory.slice(0, 10)));
        
      } else {
        setResources([]);
        toast.info('No resources found for your search');
      }
    } catch (error) {
      console.error('Search failed:', error);
      if (error.response?.data?.detail) {
        toast.error(`Search failed: ${error.response.data.detail}`);
      } else {
        toast.error('Failed to search resources');
      }
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const saveResource = async (resource) => {
    try {
      // Get current user ID
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.user_id || userData.id || localStorage.getItem('user_id') || 'demo-user';
      
      const saved = JSON.parse(localStorage.getItem(`savedResources_${userId}`) || '[]');
      
      // Check if already saved
      if (saved.find(r => r.id === resource.id)) {
        toast.info('Resource already saved');
        return;
      }
      
      const resourceToSave = {
        ...resource,
        savedAt: new Date().toISOString()
      };
      
      saved.push(resourceToSave);
      localStorage.setItem(`savedResources_${userId}`, JSON.stringify(saved));
      setSavedResources(saved);
      toast.success('Resource saved successfully!');
    } catch (error) {
      console.error('Failed to save resource:', error);
      toast.error('Failed to save resource');
    }
  };

  const removeResource = async (resourceId) => {
    try {
      // Get current user ID
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.user_id || userData.id || localStorage.getItem('user_id') || 'demo-user';
      
      const saved = JSON.parse(localStorage.getItem(`savedResources_${userId}`) || '[]');
      const updated = saved.filter(r => r.id !== resourceId);
      localStorage.setItem(`savedResources_${userId}`, JSON.stringify(updated));
      setSavedResources(updated);
      toast.success('Resource removed');
    } catch (error) {
      console.error('Failed to remove resource:', error);
      toast.error('Failed to remove resource');
    }
  };

  const ResourceCard = ({ resource, isSaved = false, onSave, onRemove }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">{resource.description}</p>
        </div>
        {resource.rating && (
          <div className="flex items-center ml-4">
            <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">{resource.rating}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          {resource.type && (
            <span className="bg-gray-100 px-2 py-1 rounded-full">{resource.type}</span>
          )}
          {resource.difficulty && (
            <span className={`px-2 py-1 rounded-full ${
              resource.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
              resource.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {resource.difficulty}
            </span>
          )}
        </div>
      </div>

      {resource.tags && resource.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {resource.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="inline-flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
              <TagIcon className="h-3 w-3 mr-1" />
              {tag}
            </span>
          ))}
          {resource.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{resource.tags.length - 3} more</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          <LinkIcon className="h-4 w-4 mr-1" />
          View Resource
        </a>
        
        <div className="flex space-x-2">
          {!isSaved ? (
            <button
              onClick={() => onSave(resource)}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <BookmarkIcon className="h-4 w-4 mr-1" />
              Save
            </button>
          ) : (
            <button
              onClick={() => onRemove(resource.id)}
              className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <MagnifyingGlassIcon className="h-8 w-8 text-purple-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Resource Curator</h1>
          </div>
          <p className="text-lg text-gray-600">
            Discover, curate, and organize educational resources tailored to your learning needs.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('search')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'search'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Search Resources
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'saved'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Saved Resources ({savedResources.length})
            </button>
          </nav>
        </div>

        {activeTab === 'search' && (
          <>
            {/* Search Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Find Educational Resources</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
                <div className="lg:col-span-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for resources, topics, or keywords..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onKeyDown={(e) => e.key === 'Enter' && searchResources()}
                  />
                </div>
                
                <select
                  value={searchFilters.resource_type}
                  onChange={(e) => setSearchFilters({ ...searchFilters, resource_type: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Types</option>
                  <option value="article">Articles</option>
                  <option value="video">Videos</option>
                  <option value="book">Books</option>
                  <option value="course">Courses</option>
                  <option value="tutorial">Tutorials</option>
                </select>
                
                <select
                  value={searchFilters.difficulty_level}
                  onChange={(e) => setSearchFilters({ ...searchFilters, difficulty_level: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <button
                onClick={searchResources}
                disabled={loading}
                className={`w-full lg:w-auto px-6 py-2 rounded-md font-medium transition-colors ${
                  loading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </div>
                ) : (
                  'Search Resources'
                )}
              </button>
            </div>

            {/* Search Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {resources.map((resource, index) => (
                <ResourceCard
                  key={index}
                  resource={resource}
                  onSave={saveResource}
                  isSaved={savedResources.some(r => r.id === resource.id)}
                />
              ))}
            </div>

            {resources.length === 0 && !loading && (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start Your Search</h3>
                <p className="text-gray-600">
                  Enter keywords or topics to find relevant educational resources.
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === 'saved' && (
          <>
            {/* Saved Resources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {savedResources.map((resource, index) => (
                <ResourceCard
                  key={index}
                  resource={resource}
                  isSaved={true}
                  onRemove={removeResource}
                />
              ))}
            </div>

            {savedResources.length === 0 && (
              <div className="text-center py-12">
                <BookmarkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No saved resources yet</h3>
                <p className="text-gray-600 mb-4">
                  Search and save resources to build your personal learning library.
                </p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                >
                  Start Searching
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResourceCuratorPage; 