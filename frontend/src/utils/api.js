import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:6001/api',
});

// Request interceptor to automatically add the bearer token if it exists in localStorage
API.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (err) {
        console.error('Error parsing user token:', err);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
