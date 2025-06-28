/**
 * Utility functions for authentication and user management
 */

/**
 * Get the current user ID from localStorage
 * @returns {string} The user ID or a default fallback
 */
export const getCurrentUserId = () => {
  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const directUserId = localStorage.getItem('user_id');
    
    // Try multiple sources for user ID
    return userData.user_id || userData.id || directUserId || 'demo-user';
  } catch (error) {
    console.error('Error parsing user data:', error);
    return localStorage.getItem('user_id') || 'demo-user';
  }
};

/**
 * Get user-specific localStorage key
 * @param {string} baseKey - The base key name
 * @returns {string} The user-specific key
 */
export const getUserSpecificKey = (baseKey) => {
  const userId = getCurrentUserId();
  return `${baseKey}_${userId}`;
};

/**
 * Get current user data from localStorage
 * @returns {object} The user data object
 */
export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch (error) {
    console.error('Error parsing user data:', error);
    return {};
  }
}; 