import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:80/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if:
    // 1. We get a 401 error
    // 2. We're NOT already on the login/register/verify-otp pages
    // 3. The request was NOT to check authentication (getProfile)
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isAuthPage = ['/login', '/register', '/verify-otp'].includes(currentPath);
      const isAuthCheckRequest = error.config?.url?.includes('/users/profile');
      
      // Only redirect if we're on a protected page and it's not the initial auth check
      if (!isAuthPage && !isAuthCheckRequest) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  register: (data) => axiosInstance.post('/auth/register', data),
  verifyOtp: (data) => axiosInstance.post('/auth/verify-otp', data),
  resendOtp: (userId) => axiosInstance.post(`/auth/resend-otp/${userId}`),
  login: (data) => axiosInstance.post('/auth/login', data),
  logout: () => axiosInstance.post('/auth/logout'),
};

export const userAPI = {
  getProfile: () => axiosInstance.get('/users/profile'),
  getUserProfile: (userId) => axiosInstance.get(`/users/${userId}`),
  updateProfile: (formData) =>
    axiosInstance.put('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getSuggestions: () => axiosInstance.get('/users/suggestions'),
  followUser: (userId) => axiosInstance.post(`/users/${userId}/follow`),
  unfollowUser: (userId) => axiosInstance.delete(`/users/${userId}/follow`),
  getFollowers: () => axiosInstance.get('/users/followers'),
  getFollowing: () => axiosInstance.get('/users/following'),
  getUserFollowers: (userId) => axiosInstance.get(`/users/${userId}/followers`),
  getUserFollowing: (userId) => axiosInstance.get(`/users/${userId}/following`),
};

export const postAPI = {
  getFeed: () => axiosInstance.get('/posts/feed'),
  getPost: (postId) => axiosInstance.get(`/posts/${postId}`),
  getUserPosts: (userId) => axiosInstance.get(`/posts/user/${userId}`),
  createPost: (formData) =>
    axiosInstance.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updatePost: (postId, data) => axiosInstance.put(`/posts/${postId}`, data),
  deletePost: (postId) => axiosInstance.delete(`/posts/${postId}`),
  likePost: (postId) => axiosInstance.post(`/posts/${postId}/like`),
  unlikePost: (postId) => axiosInstance.delete(`/posts/${postId}/like`),
};

export const commentAPI = {
  getComments: (postId) => axiosInstance.get(`/posts/${postId}/comments`),
  addComment: (postId, data) =>
    axiosInstance.post(`/posts/${postId}/comments`, data),
};

export const paymentAPI = {
  createPrimeOrder: () => axiosInstance.post('/payment/create-prime-order'),
  activatePrime: () => axiosInstance.post('/payment/activate-prime'),
  checkPrimeStatus: () => axiosInstance.get('/payment/prime-status'),
};

export default axiosInstance;