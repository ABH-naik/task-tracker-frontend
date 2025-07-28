import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from './authSlice';

const AuthInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        dispatch(setCredentials({ user, accessToken: storedToken }));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
      }
    }
  }, [dispatch]);

  return null;
};

export default AuthInitializer;