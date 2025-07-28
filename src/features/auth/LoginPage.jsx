// src/features/auth/LoginPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { BaseURL, key } from '../../config';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { loginFulfilled, logout } from './authSlice';
import './login.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 1) Clear any existing token + Redux auth state on page load
  useEffect(() => {
    localStorage.removeItem('token');
    dispatch(logout());
  }, [dispatch]);

  // 2) Handle Google OAuth login
  const handleGoogleSuccess = useCallback(
    async (response) => {
      const idToken = response.credential;
      try {
        const res = await fetch(`${BaseURL}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: idToken }),
        });
        const data = await res.json();

        if (!data.isError) {
          // Save token + user info
          localStorage.setItem('token', data.jwt);
          localStorage.setItem('userId', data.userId);
          localStorage.setItem('fullName', data.name);
          dispatch(loginFulfilled(data));

          // Redirect to dashboard
          navigate('/dashboard');
        } else {
          toast.error('Google login failed');
        }
      } catch (err) {
        toast.error('Error during Google login');
      }
    },
    [dispatch, navigate]
  );

  // 3) Handle email-based login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${BaseURL}/auth/login?email=${encodeURIComponent(username)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const data = await response.json();

      if (!data.isError) {
        localStorage.setItem('token', data.jwt);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('fullName', data.name);
        dispatch(loginFulfilled(data));
        navigate('/dashboard');
      } else {
        toast.error('Login failed');
      }
    } catch (error) {
      toast.error('Login error');
    }
  };

  return (
    <div className="login-container">
      {/* Google One-Tap / Button */}
      <GoogleOAuthProvider clientId={key}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error('Google Login Failed')}
          useOneTap={false}
        />
      </GoogleOAuthProvider>

      {/* Email Login Form */}
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;