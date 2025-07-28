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
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ id: '', name: '', email: '', role: '' });

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
    setShowModal(true);
    setAddData({ name: '', email: '', role: '' });
  };

  const handleEditClick = (user) => {
    setEditMode(true);
    setShowModal(true);
    setEditData({
      id:    user.id,
      name:  user.name || '',
      email: user.email || '',
      role:  user.role || ''
    });
  };

  const handleAddChange = e => {
    setAddData({ ...addData, [e.target.name]: e.target.value });
  };
  const handleEditChange = e => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = e => {
    e.preventDefault();
    if (!addData.name || !addData.email || !addData.role) {
      toast.error('Please fill all fields');
      return;
    }
    dispatch(addUser(addData));
    setAddMode(false);
    setShowModal(false);
  };

  const handleEditSubmit = e => {
    e.preventDefault();
    if (!editData.name || !editData.email || !editData.role) {
      toast.error('Please fill all fields');
      return;
    }
    dispatch(editUser({ id: editData.id, updates: editData }));
    setEditMode(false);
    setShowModal(false);
  };

  const handleDelete = id => {
    setDeleteId(id);
    setDeleteMode(true);
    setShowModal(true);
  };

  const handleSubmitDelete = () => {
    dispatch(deleteUser(deleteId));
    setDeleteId('');
    setDeleteMode(false);
    setShowModal(false);
  };

  return (
    <>
      {showModal && (
  <div className="modal-backdrop">
    <div className="modal">
      <div className="modal-content">
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
                  onClick={() => { setAddMode(false); setShowModal(false); }}
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
                  onClick={() => { setEditMode(false); setShowModal(false); }}
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
            <p style={{ textAlign: 'center', marginBottom: '20px' }}>
              Are you sure you want to delete this user?
            </p>
            <div className="form-actions" style={{ justifyContent: 'center' }}>
              <button
                type="button"
                className="close-button"
                onClick={handleSubmitDelete}
              >
                Yes, Delete
              </button>
              <button
                type="button"
                className="save-button"
                style={{ marginLeft: '10px' }}
                onClick={() => { setDeleteMode(false); setShowModal(false); }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
)}
      

      <button
        className="Add-button"
        type="button"
        onClick={handleAddClick}
      >
        <FontAwesomeIcon icon={faSquarePlus} /> Add User
      </button>

      <div>
        <h2>User Manager</h2>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>S.No.</th>   {/* New Serial No. column */}
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={user.id}>
                  <td>{idx + 1}</td>               {/* Row index */}
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role || 'N/A'}</td>
                  <td>
                    <button onClick={() => handleEditClick(user)}>
                      <FontAwesomeIcon icon={faScrewdriverWrench} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      style={{ marginLeft: '10px' }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default UserManager;