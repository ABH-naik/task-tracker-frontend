// src/features/tasks/ProjectTaskManager.jsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import './TaskManager.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faScrewdriverWrench,
  faSquarePlus
} from '@fortawesome/free-solid-svg-icons';

import {
  fetchProjectAllTasks,
  fetchUserAllTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
} from './taskSlice';
import { fetchUsers } from '../users/userSlice';

const ProjectTaskManager = () => {
  const dispatch = useDispatch();
  const { projectId } = useParams();

  const { tasks, loading, error } = useSelector(state => state.tasks);
  const { user, roles } = useSelector(state => state.auth);
  const users = useSelector(state => state.users.list);

  const [showModal, setShowModal] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [addMode, setAddMode] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // State for add/edit forms
  const [newTask, setNewTask] = useState({
    description: '',
    dueDate: '',
    assigneeId: ''
  });

  const [editTask, setEditTask] = useState({
    id: '',
    description: '',
    dueDate: '',
    assigneeId: '',
    status: ''
  });

  // 1) FETCH TASKS BASED ON ROLE
  useEffect(() => {
    // READ_ONLY_USER sees only their own tasks
    if (roles.includes('READ_ONLY_USER') && user?.id) {
      dispatch(fetchUserAllTasks(user.id));
    }
    // ADMIN or TASK_CREATOR sees tasks for a project
    else if (projectId) {
      dispatch(fetchProjectAllTasks(projectId));
    }
    // always load users for assignee dropdown
    dispatch(fetchUsers());
  }, [dispatch, projectId, roles, user]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleAddClick = () => {
    if (users.length === 0) dispatch(fetchUsers());
    setAddMode(true);
    setShowModal(true);
  };

  const handleEditClick = task => {
    setEditMode(true);
    setShowModal(true);
    setEditTask({
      id: task.id,
      description: task.description,
      dueDate: task.dueDate || '',
      assigneeId: task.assigneeId || '',
      status: task.status || ''
    });
  };

  const handleChange = e => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  const handleEditChange = e => {
    setEditTask({ ...editTask, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!user?.id) {
      toast.error("User not found — cannot assign owner");
      return;
    }
    dispatch(createTask({
      description: newTask.description,
      dueDate: newTask.dueDate,
      projectId: Number(projectId),
      ownerId: Number(user.id),
      assigneeId: newTask.assigneeId || null
    }))
      .unwrap()
      .then(() => {
        toast.success('Task created successfully');
        dispatch(fetchProjectAllTasks(projectId));
        setShowModal(false);
        setAddMode(false);
        setNewTask({ description: '', dueDate: '', assigneeId: '' });
      })
      .catch(err => toast.error(err.message));
  };

  const handleEditSubmit = e => {
    e.preventDefault();
    dispatch(updateTask({
      id: editTask.id,
      description: editTask.description,
      dueDate: editTask.dueDate,
      assigneeId: editTask.assigneeId || null,
      status: editTask.status
    }))
      .unwrap()
      .then(() => {
        toast.success('Task updated successfully');
        dispatch(fetchProjectAllTasks(projectId));
        setEditMode(false);
        setShowModal(false);
      })
      .catch(err => toast.error(err.message || 'Failed to update task'));
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      // include projectId for backend
      await dispatch(updateTaskStatus({
        taskId,
        userId: user.id,
        projectId: Number(projectId),
        status: newStatus
      })).unwrap();
      toast.success('Status updated successfully');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = id => {
    setDeleteId(id);
    setDeleteMode(true);
    setShowModal(true);
  };

  const handleSubmitDelete = () => {
    dispatch(deleteTask(deleteId))
      .unwrap()
      .then(() => {
        toast.success('Task deleted successfully');
        // refetch only if this is project view
        if (!roles.includes('READ_ONLY_USER')) {
          dispatch(fetchProjectAllTasks(projectId));
        } else {
          dispatch(fetchUserAllTasks(user.id));
        }
      })
      .catch(() => toast.error('Failed to delete task'));
    setDeleteId('');
    setDeleteMode(false);
    setShowModal(false);
  };

  const readOnlyUsers = users.filter(u => u.role === 'READ_ONLY_USER');

  if (loading) return <p>Loading...</p>;

  return (
    <>
      {/* Add Task button only for non-viewers */}
      {!roles.includes('READ_ONLY_USER') && (
        <button className="Add-button" onClick={handleAddClick}>
          <FontAwesomeIcon icon={faSquarePlus} /> Add Task
        </button>
      )}

      <h2>Task Manager</h2>

      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Description</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Owner</th>
            <th>Assignee</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id}>
              <td>{task.id}</td>
              <td>{task.description || 'No Description'}</td>
              <td>{task.dueDate || 'No Due Date'}</td>
              <td>{task.status?.replace('_', ' ') || '-'}</td>
              <td>{task.ownerName ?? '-'}</td>
              <td>{task.assigneeName ?? '-'}</td>
              <td>
                {/* Status buttons */}
                {!roles.includes('READ_ONLY_USER') && task.status === 'NOT_STARTED' && (
                  <button
                    className="status-button"
                    onClick={() => handleStatusUpdate(task.id, 'IN_PROGRESS')}
                  >
                    In-Progress
                  </button>
                )}
                {!roles.includes('READ_ONLY_USER') && task.status === 'IN_PROGRESS' && (
                  <button
                    className="status-button"
                    onClick={() => handleStatusUpdate(task.id, 'COMPLETED')}
                  >
                    Completed
                  </button>
                )}

                {/* Edit/Delete for non-viewers */}
                {!roles.includes('READ_ONLY_USER') && (
                  <>
                    <Link onClick={() => handleEditClick(task)} style={{ marginLeft: '10px' }}>
                      <FontAwesomeIcon icon={faScrewdriverWrench} />
                    </Link>
                    <Link onClick={() => handleDelete(task.id)} style={{ marginLeft: '10px' }}>
                      <FontAwesomeIcon icon={faTrash} />
                    </Link>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-container">
            {addMode && (
              <>
                <h3>Add Task</h3>
                <form className="modal-form" onSubmit={handleSubmit}>
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={newTask.description}
                    onChange={handleChange}
                    required
                  />
                  <label>Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={newTask.dueDate}
                    onChange={handleChange}
                  />
                  <label>Assignee</label>
                  <select
                    name="assigneeId"
                    value={newTask.assigneeId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select...</option>
                    {readOnlyUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
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
                <h3>Edit Task</h3>
                <form className="modal-form" onSubmit={handleEditSubmit}>
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={editTask.description}
                    onChange={handleEditChange}
                    required
                  />
                  <label>Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={editTask.dueDate}
                    onChange={handleEditChange}
                  />
                  <label>Assignee</label>
                  <select
                    name="assigneeId"
                    value={editTask.assigneeId}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="">Select...</option>
                    {readOnlyUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  <label>Status</label>
                  <select
                    name="status"
                    value={editTask.status}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                  <div className="form-actions">
                    <button type="submit" className="save-button">Update</button>
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
                <h3>Delete Task</h3>
                <p>Are you sure you want to delete this task?</p>
                <div className="form-actions">
                  <button className="save-button" onClick={handleSubmitDelete}>
                    Yes, Delete
                  </button>
                  <button
                    className="close-button"
                    onClick={() => { setDeleteMode(false); setShowModal(false); }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectTaskManager;