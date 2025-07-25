
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  // Set auth token in localStorage
  setAuthToken(token) {
    localStorage.setItem('authToken', token);
  }

  // Remove auth token from localStorage
  removeAuthToken() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userData');
  }

  // Generic API call method
  async request(endpoint, options = {}) {
    const token = this.getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401 || response.status === 403) {
          this.removeAuthToken();
          window.location.href = '/user-login';
          throw new Error('Session expired. Please login again.');
        }
        
        throw new Error(data.error || data.errors?.[0] || 'An error occurred');
      }

      return data;
    } catch (error) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
  }

  // Authentication methods
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store token and user data
    this.setAuthToken(response.token);
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify(response.user));

    return response;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Store token and user data
    this.setAuthToken(response.token);
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify(response.user));

    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.warn('Logout request failed:', error.message);
    } finally {
      this.removeAuthToken();
    }
  }

  async getProfile() {
    return await this.request('/auth/profile');
  }

  async updateProfile(profileData) {
    const response = await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });

    // Update stored user data
    localStorage.setItem('userData', JSON.stringify(response.user));
    
    return response;
  }

  async changePassword(passwordData) {
    return await this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  // Utility methods
  getCurrentUser() {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  isAuthenticated() {
    return !!this.getAuthToken() && localStorage.getItem('userLoggedIn') === 'true';
  }

  // Health check
  async healthCheck() {
    return await this.request('/health');
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;

// Named exports for convenience
export const {
  login,
  register,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  getCurrentUser,
  isAuthenticated,
  healthCheck
} = apiService;
