// src/features/tasks/MyTasks.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchUserAllTasks, updateTaskStatus } from './taskSlice';

const MyTasks = () => {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector(state => state.tasks);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserAllTasks(user.id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleStatusUpdate = async (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task?.projectId) {
      toast.error('Missing projectId for this task');
      return;
    }

    try {
      await dispatch(updateTaskStatus({
        taskId,
        userId: user.id,
        projectId: task.projectId,
        status: newStatus
      })).unwrap();
      toast.success('Status updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  if (loading) return <div>Loading your tasks...</div>;

  return (
    <div className="container">
      <h2>My Assigned Tasks</h2>

      {tasks.length === 0 ? (
        <p>No tasks assigned to you.</p>
      ) : (
        <table className="project-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Project</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                <td>{task.description || 'No Description'}</td>
                <td>{task.dueDate || 'No Due Date'}</td>
                <td>{task.status?.replace('_',' ') || '-'}</td>
                <td>{task.projectName || 'Unknown Project'}</td>
                <td>
                  {task.status !== 'COMPLETED' && (
                    <button
                      className="status-button"
                      onClick={() => handleStatusUpdate(task.id, 'COMPLETED')}
                    >
                      Mark Completed
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyTasks;