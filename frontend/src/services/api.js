import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5001/api', // Your Express Server URL
});

// Middleware to add Token to headers
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;