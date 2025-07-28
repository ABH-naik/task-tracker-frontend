// src/pages/Dashboard.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import {
  faUsers,
  faFolderOpen,
  faKey,
  faFileSignature
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Dashboard = () => {
  const { user, roles } = useSelector((s) => s.auth);
  
  // Normalize incoming roleName to uppercase
  const hasRole = (roleName) =>
    roles.includes(roleName.toUpperCase());

  return (
    <div className="dashboard">
      <h2>Welcome, {user?.name}</h2>
      <p className="subtitle">You are logged in as: {roles.join(', ')}</p>

      <div className="dashboard-links">
        {hasRole('READ_ONLY_USER') && !hasRole('TASK_CREATOR') && !hasRole('ADMIN') && (
          <Link to="/tasks" className="dash-card">
            <h3>
              <FontAwesomeIcon icon={faFileSignature} /> Manage Tasks
            </h3>
            <p>View and update tasks.</p>
          </Link>
        )}

        {hasRole('TASK_CREATOR') && !hasRole('ADMIN') && (
          <Link to="/projects" className="dash-card">
            <h3>
              <FontAwesomeIcon icon={faFolderOpen} /> Manage Project
            </h3>
            <p>View and update projects.</p>
          </Link>
        )}

        {hasRole('ADMIN') && (
          <>
            <Link to="/projects" className="dash-card">
              <h3>
                <FontAwesomeIcon icon={faFolderOpen} /> Project Management
              </h3>
              <p>View, edit, or delete projects.</p>
            </Link>

            <Link to="/users" className="dash-card">
              <h3>
                <FontAwesomeIcon icon={faUsers} /> User Management
              </h3>
              <p>View, edit, or delete users.</p>
            </Link>

            <Link to="/roles" className="dash-card">
              <h3>
                <FontAwesomeIcon icon={faKey} /> Role Management
              </h3>
              <p>Assign roles to users.</p>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;