/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  visitor: null,
  droppedAsset: null,
  isAssetSpawnedInWorld: null,
  spawnedAsset: null,
  spawnSuccess: true,
  error: null,
  isLockerAlreadyTaken: false,
};

const reducers = {
  setVisitor: (state, action) => {
    state.visitor = action.payload;
  },
  setDroppedAsset: (state, action) => {
    state.droppedAsset = action.payload;
  },
  setDroppedAssetAndVisitor: (state, action) => {
    state.droppedAsset = action.payload.droppedAsset;
    state.visitor = action.payload.visitor;
    state.isAssetSpawnedInWorld = action.payload.isAssetSpawnedInWorld;
    state.spawnedAsset = action.payload.spawnedAsset;
    state.userLocker = action.payload.userLocker;
    state.world = action.payload.world;
  },
  setInPrivateZone: (state, action) => {
    state.inPrivateZone = action.payload;
  },
  setIsAssetSpawnedInWorld: (state, action) => {
    state.isAssetSpawnedInWorld = action.payload;
  },
  setSpawnSuccess: (state, action) => {
    state.spawnSuccess = action.payload.spawnSuccess;
    state.isAssetSpawnedInWorld = action.payload.isAssetSpawnedInWorld;
    state.spawnedAsset = action.payload.spawnedAsset;
    state.isLockerAlreadyTaken = action.payload.isLockerAlreadyTaken;
  },
  setError: (state, action) => {
    state.error = action.payload;
  },
};

export const session = createSlice({
  name: "session",
  initialState,
  reducers,
});
