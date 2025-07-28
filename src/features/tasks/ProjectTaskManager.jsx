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
  createTask,
  updateTask,
  deleteTask
} from './taskSlice';
import { fetchUsers } from '../users/userSlice';

const ProjectTaskManager = () => {
  const dispatch = useDispatch();
  const { projectId } = useParams();

  const { tasks, loading, error } = useSelector(state => state.tasks);
  const { user } = useSelector(state => state.auth);
  const users = useSelector(state => state.users.list);

  useEffect(() => {
    dispatch(fetchProjectAllTasks(projectId));
    dispatch(fetchUsers());
  }, [dispatch, projectId]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const [showModal, setShowModal] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [addMode, setAddMode] = useState(false);
  const [editMode, setEditMode] = useState(false);

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

  const handleAddClick = () => {
    if (users.length === 0) {
      dispatch(fetchUsers());
    }
    setAddMode(true);
    setShowModal(true);
  };

  const handleEditClick = (task) => {
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

  // Removed handleStatusUpdate function as it is no longer needed

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
        dispatch(fetchProjectAllTasks(projectId));
      })
      .catch(() => toast.error('Failed to delete task'));
    setDeleteId('');
    setDeleteMode(false);
    setShowModal(false);
  };

  const readOnlyUsers = users.filter(u => u.role === 'READ_ONLY_USER');

  return (
    <>
      <button className="Add-button" onClick={handleAddClick}>
        <FontAwesomeIcon icon={faSquarePlus} /> Add Task
      </button>
      <h2>Task Manager</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
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
                <td>{task.status ? task.status.replace('_', ' ') : '-'}</td>
                <td>{task.ownerName ?? '-'}</td>
                <td>{task.assigneeName ?? '-'}</td>
                <td>
                  {/* No status update buttons here to avoid unwanted API calls */}
                  <Link onClick={() => handleEditClick(task)} style={{ cursor: 'pointer', marginLeft: '10px' }}>
                    <FontAwesomeIcon icon={faScrewdriverWrench} />
                  </Link>
                  <Link onClick={() => handleDelete(task.id)} style={{ cursor: 'pointer', marginLeft: '10px' }}>
                    <FontAwesomeIcon icon={faTrash} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
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
                    {readOnlyUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="save-button">Save</button>
                  <button type="button" className="close-button" onClick={() => { setAddMode(false); setShowModal(false); }}>Cancel</button>
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
                    {readOnlyUsers.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
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
                  <button type="submit" className="save-button">Update</button>
                  <button type="button" className="close-button" onClick={() => { setEditMode(false); setShowModal(false); }}>Cancel</button>
                </form>
              </>
            )}

            {deleteMode && (
              <>
                <p>Are you sure you want to delete this task?</p>
                <button type="button" className="close-button" onClick={handleSubmitDelete}>Yes</button>
                <button type="button" className="save-button" style={{ marginLeft: '5px' }} onClick={() => { setDeleteMode(false); setShowModal(false); }}>No</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectTaskManager;
