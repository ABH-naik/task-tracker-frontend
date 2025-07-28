// src/features/users/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../services/api';

// Fetch all users (no trailing slash)
export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async () => {
    const res = await axios.get('/users');
    return res.data;
  }
);

// Add a new user
export const addUser = createAsyncThunk(
  'users/add',
  async ({ name, email, role }) => {
    // 1) Create the user
    const res = await axios.post('/users', { name, email });
    const userId = res.data.id;

    // 2) Assign role if provided
    if (role) {
      await axios.put(
        `/users/${userId}/role?role=${role.toUpperCase()}`
      );
    }

    // 3) Return the original create response (no deep merge here)
    return res.data;
  }
);

// EDIT: Only call the /role endpoint and return its response
export const editUser = createAsyncThunk(
  'users/edit',
  async ({ id, updates }) => {
    const { role } = updates;

    if (!role) {
      throw new Error('Role is required to update');
    }

    // Hit only your supported endpoint
    const res = await axios.put(
      `/users/${id}/role?role=${role.toUpperCase()}`
    );

    // Return the updated UserResponse (with new role)
    return res.data;
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id) => {
    await axios.delete(`/users/${id}`);
    return id;
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.list = payload;
      })
      .addCase(fetchUsers.rejected, (state, { error }) => {
        state.loading = false;
        state.error = error.message || 'Failed to fetch users';
      })

      // addUser
      .addCase(addUser.fulfilled, (state, { payload }) => {
        state.list.push(payload);
      })
      .addCase(addUser.rejected, (state, { error }) => {
        state.error = error.message || 'Failed to add user';
      })

      // editUser
      .addCase(editUser.fulfilled, (state, { payload }) => {
        const idx = state.list.findIndex(u => u.id === payload.id);
        if (idx !== -1) {
          state.list[idx] = payload;
        }
      })
      .addCase(editUser.rejected, (state, { error }) => {
        state.error = error.message || 'Failed to edit user';
      })

      // deleteUser
      .addCase(deleteUser.fulfilled, (state, { payload }) => {
        state.list = state.list.filter(u => u.id !== payload);
      })
      .addCase(deleteUser.rejected, (state, { error }) => {
        state.error = error.message || 'Failed to delete user';
      });
  },
});

export default userSlice.reducer;