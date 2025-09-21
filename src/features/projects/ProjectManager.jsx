// src/features/projects/ProjectManager.jsx

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import './ProjectManager.css';

import {
  fetchAllProjects,
  editProject,
  addProject,
  deleteProject,
  fetchUserProjects
} from "./projectSlice";

import { fetchUsers } from "../users/userSlice";

const ProjectManager = () => {
  const dispatch = useDispatch();
  const { allProjects, loading, error } = useSelector(state => state.projects);
  const { roles, user } = useSelector(state => state.auth);
  const users = useSelector(state => state.users.list);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    owner: ''
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const hasPermission = (requiredRole) => roles.includes(requiredRole);

  useEffect(() => {
    if (error) toast.error(error);
    if (hasPermission('ADMIN')) {
      dispatch(fetchAllProjects());
      dispatch(fetchUsers());
    } else if (user?.id) {
      dispatch(fetchUserProjects(user.id));
    }
  }, [dispatch, roles, user, error]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const action = isEditing
      ? dispatch(editProject({ projectId: currentProjectId, update: formData }))
      : dispatch(addProject(formData));

    action
      .unwrap()
      .then(() => {
        toast.success(`Project ${isEditing ? 'updated' : 'created'} successfully`);
        resetForm();
      })
      .catch(err => toast.error(err.message));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      owner: ''
    });
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentProjectId(null);
  };

  const handleEdit = (project) => {
    setFormData({
      name: project.name,
      description: project.description,
      start_date: project.start_date,
      end_date: project.end_date,
      owner: project.owner
    });
    setCurrentProjectId(project.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  if (loading) return <div>Loading projects...</div>;

  return (
    <div className="container">
      <div className="header">
        <h2>Project Manager</h2>
        {hasPermission('ADMIN') && (
          <button
            className="Add-button"
            type="button"
            onClick={() => setIsModalOpen(true)}
          >
            <FontAwesomeIcon icon={faPlus} /> Add Project
          </button>
        )}
      </div>

      <table className="project-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Owner</th>
            {hasPermission('ADMIN') && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {allProjects.map(project => (
            <tr key={project.id}>
              <td>
                <Link to={`/projects/${project.id}/tasks`}>{project.name}</Link>
              </td>
              <td>{project.description}</td>
              <td>{project.start_date}</td>
              <td>{project.end_date || '-'}</td>
              <td>{project.ownerName}</td>
              {hasPermission('ADMIN') && (
                <td className="actions">
                  <button onClick={() => handleEdit(project)}>
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button onClick={() => setProjectToDelete(project)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <h3>{isEditing ? 'Edit Project' : 'Add Project'}</h3>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Project Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Owner</label>
                <select
                  name="owner"
                  value={formData.owner}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Owner</option>
                  {users
                    .filter(u => u.role === 'TASK_CREATOR')
                    .map(u => (
                      <option key={u.id} value={String(u.id)}>
                        {u.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="save-button">
                  {isEditing ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="close-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {projectToDelete && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <h3>Delete Project</h3>
            <p>
              Are you sure you want to delete <strong>{projectToDelete.name}</strong>?
            </p>
            <div className="form-actions">
              <button
                className="save-button"
                onClick={() => {
                  dispatch(deleteProject(projectToDelete.id))
                    .unwrap()
                    .then(() => toast.success('Project deleted'))
                    .finally(() => setProjectToDelete(null));
                }}
              >
                Confirm Delete
              </button>
              <button
                className="close-button"
                onClick={() => setProjectToDelete(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;