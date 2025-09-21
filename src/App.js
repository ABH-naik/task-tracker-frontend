// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AuthInitializer from './features/auth/AuthInitializer';
import MyTasks from './features/tasks/MyTasks';    // <-- viewer’s task list

// import TaskManager from './features/tasks/TaskManager';  
// ^— no longer used for /tasks

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginPage from './features/auth/LoginPage';
import Dashboard from './pages/Dashboard';
import RoleManager from './features/roles/RoleManager';
import ProjectTaskManager from './features/tasks/ProjectTaskManager';
// import TaskManager from './features/tasks/TaskManager'; // removed
import ProjectManager from './features/projects/ProjectManager';
import UserManager from './features/users/UserManager';

import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

import { store } from './app/store';
import { setTokenGetter } from './app/axiosConfig';

setTokenGetter(() => store.getState().auth.token);

const App = () => {
  return (
    <Router>
      <AuthInitializer />

      <Navbar />

      <ToastContainer position="top-center" autoClose={3000} />

      <div className="main-content" style={{ padding: '20px' }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['ADMIN','TASK_CREATOR','READ_ONLY_USER']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Project-specific task view for ADMIN & TASK_CREATOR */}
          <Route
            path="/projects/:projectId/tasks"
            element={
              <ProtectedRoute roles={['ADMIN', 'TASK_CREATOR']}>
                <ProjectTaskManager />
              </ProtectedRoute>
            }
          />

          {/* Stand-alone tasks view for READ_ONLY_USER */}
          <Route
            path="/tasks"
            element={
              <ProtectedRoute roles={['READ_ONLY_USER']}>
                <MyTasks />
              </ProtectedRoute>
            }
          />

          {/* Project list/management (ADMIN & TASK_CREATOR) */}
          <Route
            path="/projects"
            element={
              <ProtectedRoute roles={['ADMIN','TASK_CREATOR']}>
                <ProjectManager />
              </ProtectedRoute>
            }
          />

          {/* User management (ADMIN & TASK_CREATOR) */}
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={['ADMIN','TASK_CREATOR']}>
                <UserManager />
              </ProtectedRoute>
            }
          />

          {/* Role management (ADMIN only) */}
          <Route
            path="/roles"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <RoleManager />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;