// src/features/projects/projectSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api"; 

// Convert backend ProjectResponse → frontend shape
const transformProject = (project) => ({
  id: project.id,
  name: project.name,
  description: project.description,
  start_date: project.startDate,
  end_date: project.endDate,
  owner: project.ownerId,
  ownerName: project.ownerName || '', // already in ProjectResponse
  createdAt: project.createdAt
});

// Thunks

export const fetchAllProjects = createAsyncThunk(
  'projects/fetchAll',
  async () => {
    const res = await api.get('/projects');
    return res.data.map(transformProject);
  }
);

export const fetchUserProjects = createAsyncThunk(
  'projects/fetchUserProjects',
  async (userId) => {
    const res = await api.get(`/projects/user/${userId}`);
    return res.data.map(transformProject);
  }
);

export const addProject = createAsyncThunk(
  'projects/add',
  async ({ name, description, owner, start_date, end_date }) => {
    const payload = {
      name,
      description,
      ownerId: owner,
      startDate: start_date,
      endDate: end_date
    };
    const res = await api.post('/projects', payload);
    return transformProject(res.data);
  }
);

export const editProject = createAsyncThunk(
  'projects/edit',
  async ({ projectId, update }) => {
    const payload = {
      name: update.name,
      description: update.description,
      ownerId: update.owner,
      startDate: update.start_date,
      endDate: update.end_date
    };
    const res = await api.put(`/projects/${projectId}`, payload);
    return transformProject(res.data);
  }
);

export const deleteProject = createAsyncThunk(
  'projects/delete',
  async (projectId) => {
    await api.delete(`/projects/${projectId}`);
    return projectId;
  }
);

export const assignUserToProject = createAsyncThunk(
  'projects/assignUser',
  async ({ projectId, userId }) => {
    await api.post(`/projects/${projectId}/assign/${userId}`);
    const res = await api.get(`/projects/${projectId}`);
    return transformProject(res.data);
  }
);

// Slice

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    allProjects: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: builder => {
    builder
      // fetchAllProjects
      .addCase(fetchAllProjects.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.allProjects = action.payload;
      })
      .addCase(fetchAllProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // fetchUserProjects
      .addCase(fetchUserProjects.pending, state => {
        state.loading = true;
      })
      .addCase(fetchUserProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.allProjects = action.payload;
      })
      .addCase(fetchUserProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // addProject
      .addCase(addProject.fulfilled, (state, action) => {
        state.allProjects.push(action.payload);
      })
      .addCase(addProject.rejected, (state, action) => {
        state.error = action.error.message;
      })

      // editProject
      .addCase(editProject.fulfilled, (state, action) => {
        const index = state.allProjects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.allProjects[index] = action.payload;
        }
      })
      .addCase(editProject.rejected, (state, action) => {
        state.error = action.error.message;
      })

      // deleteProject
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.allProjects = state.allProjects.filter(p => p.id !== action.payload);
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.error = action.error.message;
      })

      // assignUserToProject
      .addCase(assignUserToProject.fulfilled, (state, action) => {
        const index = state.allProjects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.allProjects[index] = action.payload;
        }
      })
      .addCase(assignUserToProject.rejected, (state, action) => {
        state.error = action.error.message;
      });
  }
});

export default projectSlice.reducer;