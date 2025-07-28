import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: localStorage.getItem('userId') ? {
    id: parseInt(localStorage.getItem('userId'), 10),
    name: localStorage.getItem('fullName')
  } : null,
  token: localStorage.getItem('token') || null,
  roles: [],
  isAuthenticated: !!localStorage.getItem('userId'),
  error: null,
  loading: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginFulfilled: (state, action) => {
      const { userId, name, jwt, isAdmin, isTaskCreator, readonly } = action.payload;
      state.user = { id: userId, name };
      state.token = jwt;
      state.roles = [];
      if (isAdmin) state.roles.push('ADMIN');
      if (isTaskCreator) state.roles.push('TASK_CREATOR');
      if (readonly) state.roles.push('READ_ONLY_USER');
      state.isAuthenticated = true;

      localStorage.setItem('token', jwt);
      localStorage.setItem('fullName', name);
      localStorage.setItem('userId', userId.toString());
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.roles = [];
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('fullName');
      localStorage.removeItem('userId');
    },
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.token = accessToken;
      state.isAuthenticated = !!user;
    },
  },
});

export const { loginFulfilled, logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
