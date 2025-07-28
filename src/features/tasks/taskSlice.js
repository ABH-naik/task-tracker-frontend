// src/features/tasks/taskSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import axios from '../../app/axiosConfig';

// Fetch all tasks for a given user
export const fetchUserAllTasks = createAsyncThunk(
  'tasks/fetchUserAll',
  async (userId) => {
    const resp = await api.get(`/tasks/owner/${userId}`);
    return resp.data;
  }
);

// ✅ FIX: Update a task's metadata - remove 'name' field, use correct backend fields
export const updateTask = createAsyncThunk(
  'tasks/update',
  async (
    { id, description, dueDate, assigneeId, status }, // ✅ Removed 'name' parameter
    { rejectWithValue }
  ) => {
    try {
      // ✅ Send data in format that matches your backend UpdateTaskRequest
      const payload = { 
        description,  // ✅ Use description instead of name
        dueDate, 
        assigneeId, 
        status 
      };
      const response = await axios.put(`/api/tasks/${id}`, payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Fetch all tasks for a project
export const fetchProjectAllTasks = createAsyncThunk(
  'tasks/fetchProjectAll',
  async (projectId) => {
    const resp = await api.get(`/tasks/${projectId}`);
    return resp.data;
  }
);

// Create a task
export const createTask = createAsyncThunk(
  'tasks/create',
  async ({ description, dueDate, projectId, ownerId, assigneeId }) => {
    const resp = await api.post('/tasks', {
      description,
      dueDate,
      projectId,
      ownerId,
      assigneeId: assigneeId || null,
    });
    return resp.data;
  }
);

// Update only status — now returns updated task object from API
export const updateTaskStatus = createAsyncThunk(
  'tasks/updateStatus',
  async ({ taskId, userId, projectId, status }, { rejectWithValue }) => {
    try {
      const response = await api.put('/tasks/update-status', {
        taskId, userId, projectId, status
      });
      // API should return the updated task object here
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Delete a task by ID
export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
    return taskId;
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    loading: false,
    error: null
  },
  extraReducers: builder => {
    builder.addMatcher(
      action => action.type.startsWith('tasks/') && action.type.endsWith('/pending'),
      (state) => {
        state.loading = true;
        state.error = null;
      }
    );

    builder.addMatcher(
      action => action.type.startsWith('tasks/') && action.type.endsWith('/fulfilled'),
      (state, action) => {
        state.loading = false;

        if (Array.isArray(action.payload)) {
          // for fetchUserAllTasks or fetchProjectAllTasks
          state.tasks = action.payload;
        } else if (action.type === createTask.fulfilled.toString()) {
          // ✅ FIX: Add the newly created task to the tasks array
          state.tasks.push(action.payload);
        } else if (action.type === deleteTask.fulfilled.toString()) {
          state.tasks = state.tasks.filter(t => t.id !== action.payload);
        } else if (action.type === updateTaskStatus.fulfilled.toString()) {
          // Replace updated task in state.tasks
          const index = state.tasks.findIndex(t => t.id === action.payload.id);
          if (index !== -1) {
            state.tasks[index] = action.payload;
          }
        } else if (action.type === updateTask.fulfilled.toString()) {
          // ✅ FIX: Handle updateTask fulfilled case
          const index = state.tasks.findIndex(t => t.id === action.payload.id);
          if (index !== -1) {
            state.tasks[index] = action.payload;
          }
        }
      }
    );

    builder.addMatcher(
      action => action.type.startsWith('tasks/') && action.type.endsWith('/rejected'),
      (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      }
    );
  }
});

export default tasksSlice.reducer;