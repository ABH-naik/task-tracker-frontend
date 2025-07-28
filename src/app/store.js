import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import {thunk} from 'redux-thunk';

import authReducer from '../features/auth/authSlice';
import usersReducer from '../features/users/userSlice';
import rolesReducer from '../features/roles/roleSlice';
import tasksReducer from '../features/tasks/taskSlice';
import projectReducer from '../features/projects/projectSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  users: usersReducer,
  roles: rolesReducer,
  projects: projectReducer,
  tasks: tasksReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
};


const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk,
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);