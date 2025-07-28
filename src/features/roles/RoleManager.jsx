// src/features/roles/RoleManager.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRoles,
  assignRolesToUser  // assigns one role
} from './roleSlice';
import { fetchUsers } from '../users/userSlice';
import './RoleManager.css';
import { toast } from 'react-toastify';

const RoleManager = () => {
  const dispatch = useDispatch();
  const { allRoles, error } = useSelector((state) => state.roles);
  const users = useSelector((state) => state.users.list || []);
  const [selectedRoles, setSelectedRoles] = useState({});

  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleChange = (userId, role) => {
    setSelectedRoles((prev) => ({ ...prev, [userId]: role }));
  };

  const handleSubmit = (userId) => {
    const role = selectedRoles[userId] || null;
    if (!role) {
      toast.warning("Please select a role before updating");
      return;
    }
    dispatch(assignRolesToUser({ userId, role }))
      .unwrap()
      .then(() => toast.success("Role updated"))
      .catch((err) => toast.error(err));
  };

  return (
    <div className="role-manager">
      <h2>Role Manager</h2>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Assign Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr><td colSpan="3">No users found.</td></tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>
                  <select
                    value={selectedRoles[user.id] || user.role}
                    onChange={(e) => handleChange(user.id, e.target.value)}
                  >
                    {allRoles.map((role) => (
                      <option key={role} value={role}>
                        {role.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button onClick={() => handleSubmit(user.id)}>
                    Update
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RoleManager;