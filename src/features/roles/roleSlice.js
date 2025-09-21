import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../services/api';


export const fetchRoles = createAsyncThunk('roles/fetchRoles', async () => {
  const res = await axios.get('/roles');
  return res.data;
});

export const fetchUserRoles = createAsyncThunk('roles/fetchUserRoles', async (userId) => {
  const res = await axios.get(`/roles/user/${userId}`);
  return res.data;  // should return: [ { id: 1, name: 'ADMIN' }, ... ]
});

export const assignRolesToUser = createAsyncThunk(
  'roles/assignRolesToUser',
  async ({ userId, role }) => {
    const token = localStorage.getItem('token');
    const res = await axios.put(`/roles/user/${userId}`, { role }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;

  }
);

export const removeUserRole = createAsyncThunk(
  'roles/removeUserRole',
  async ({ userId, roleId }) => {
    const res = await axios.delete(`/roles/remove`, {
      data: { user_id: userId, role_id: roleId }
    });
    return res.data;
  }
);

const rolesSlice = createSlice({
  name: 'roles',
  initialState: {
    allRoles: [],
    userRoles: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.allRoles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Authentication failed';
      })

      .addCase(fetchUserRoles.fulfilled, (state, action) => {
        state.userRoles = action.payload;
      })
      .addCase(fetchUserRoles.rejected, (state, action) => {
        state.error = action.error?.message || 'Authentication failed';

      })

  },
});

export default rolesSlice.reducer;