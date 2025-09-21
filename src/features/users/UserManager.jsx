// src/features/users/UserManager.jsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUsers,
  editUser,
  deleteUser,
  addUser
} from './userSlice';
import { toast } from 'react-toastify';
import './userManager.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faScrewdriverWrench,
  faSquarePlus
} from '@fortawesome/free-solid-svg-icons';

const UserManager = () => {
  const dispatch = useDispatch();
  const { list: users, loading, error } = useSelector(state => state.users);

  const [showModal, setShowModal] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [addData, setAddData] = useState({ name: '', email: '', role: '' });
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ id: '', name: '', email: '', role: '' });
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleteId, setDeleteId] = useState('');

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleAddClick = () => {
    setAddMode(true);
    setEditMode(false);
    setDeleteMode(false);
    setAddData({ name: '', email: '', role: '' });
    setShowModal(true);
  };

  const handleEditClick = user => {
    setEditMode(true);
    setAddMode(false);
    setDeleteMode(false);
    setEditData({
      id:    user.id,
      name:  user.name || '',
      email: user.email || '',
      role:  user.role || ''
    });
    setShowModal(true);
  };

  const handleDeleteClick = id => {
    setDeleteMode(true);
    setAddMode(false);
    setEditMode(false);
    setDeleteId(id);
    setShowModal(true);
  };

  const handleAddChange = e => setAddData({ ...addData, [e.target.name]: e.target.value });
  const handleEditChange = e => setEditData({ ...editData, [e.target.name]: e.target.value });

  const handleAddSubmit = e => {
    e.preventDefault();
    if (!addData.name || !addData.email || !addData.role) {
      toast.error('Please fill all fields');
      return;
    }
    dispatch(addUser(addData));
    setShowModal(false);
  };

  const handleEditSubmit = e => {
    e.preventDefault();
    if (!editData.name || !editData.email || !editData.role) {
      toast.error('Please fill all fields');
      return;
    }
    dispatch(editUser({ id: editData.id, updates: editData }));
    setShowModal(false);
  };

  const handleSubmitDelete = () => {
    dispatch(deleteUser(deleteId));
    setShowModal(false);
  };

  return (
    <>
      {/* GLOBAL MODAL */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-container">
            {addMode && (
              <>
                <h3>Add User</h3>
                <form className="modal-form" onSubmit={handleAddSubmit}>
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      name="name"
                      value={addData.name}
                      onChange={handleAddChange}
                      placeholder="Name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      name="email"
                      type="email"
                      value={addData.email}
                      onChange={handleAddChange}
                      placeholder="Email"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select
                      name="role"
                      value={addData.role}
                      onChange={handleAddChange}
                      required
                    >
                      <option value="">Select...</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="TASK_CREATOR">TASK_CREATOR</option>
                      <option value="READ_ONLY_USER">READ_ONLY_USER</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="save-button">Save</button>
                    <button
                      type="button"
                      className="close-button"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}

            {editMode && (
              <>
                <h3>Edit User</h3>
                <form className="modal-form" onSubmit={handleEditSubmit}>
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      name="name"
                      value={editData.name}
                      onChange={handleEditChange}
                      placeholder="Name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      name="email"
                      type="email"
                      value={editData.email}
                      onChange={handleEditChange}
                      placeholder="Email"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select
                      name="role"
                      value={editData.role}
                      onChange={handleEditChange}
                      required
                    >
                      <option value="">Select...</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="TASK_CREATOR">TASK_CREATOR</option>
                      <option value="READ_ONLY_USER">READ_ONLY_USER</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="save-button">Save</button>
                    <button
                      type="button"
                      className="close-button"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}

            {deleteMode && (
              <>
                <h3>Delete User</h3>
                <p style={{ textAlign: 'center', margin: '1rem 0' }}>
                  Are you sure you want to delete this user?
                </p>
                <div className="form-actions">
                  <button
                    type="button"
                    className="save-button"
                    onClick={handleSubmitDelete}
                  >
                    Yes, Delete
                  </button>
                  <button
                    type="button"
                    className="close-button"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* PAGE CONTENT */}
      <button
        className="Add-button"
        type="button"
        onClick={handleAddClick}
      >
        <FontAwesomeIcon icon={faSquarePlus} /> Add User
      </button>

      <h2>User Manager</h2>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>S.No.</th>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr key={u.id}>
                <td>{idx + 1}</td>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role || 'N/A'}</td>
                <td>
                  <button onClick={() => handleEditClick(u)}>
                    <FontAwesomeIcon icon={faScrewdriverWrench} />
                  </button>
                  <button onClick={() => handleDeleteClick(u.id)} style={{ marginLeft: '10px' }}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

export default UserManager;