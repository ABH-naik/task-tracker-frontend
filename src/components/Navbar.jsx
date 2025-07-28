// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import './Navbar.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, roles, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const hasRole = (role) => roles.includes(role);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Task-Tracker</Link>
      </div>
      <ul className="navbar-links">
        {isAuthenticated && (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            {(hasRole('ADMIN') || hasRole('TASK_CREATOR')) &&
            (<li><Link to="/projects">Projects</Link></li>)
            }
            {hasRole('ADMIN') && (
              <>
                <li><Link to="/users">Users</Link></li>
                {/* <li><Link to="/roles">Roles</Link></li> */}
              </>
            )}
            <li className="logout-link" onClick={handleLogout}>Logout</li>
          </>
        )}
        {!isAuthenticated && (
          <li><Link to="/login">Login</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
